import React, { useState, useEffect } from 'react';
import { FolderGit2, GitCommit } from 'lucide-react';
import { api } from '../lib/api';
import { useConfig, isEnabled } from '../context/ConfigContext.jsx';

const INITIAL_STATS = [
  { label: 'Public Repos', value: '10', icon: FolderGit2 },
  { label: 'Overall Contributions', value: '944', icon: GitCommit },
];

export function GitHubStrip() {
  const { config } = useConfig();
  const [stats, setStats] = useState(INITIAL_STATS);

  useEffect(() => {
    let isMounted = true;

    const loadLiveStats = async () => {
      try {
        const res = await api.getGithubStats();
        if (isMounted && res?.data?.stats && Array.isArray(res.data.stats)) {
          const rawStats = res.data.stats;
          const repoStat = rawStats.find((s) => /repo/i.test(s.label));
          const contribStat = rawStats.find((s) => /contrib/i.test(s.label));

          const filtered = [];
          if (repoStat) {
            filtered.push({
              label: 'Public Repos',
              value: String(repoStat.value),
              icon: FolderGit2,
            });
          }
          if (contribStat) {
            filtered.push({
              label: 'Overall Contributions',
              value: String(contribStat.value),
              icon: GitCommit,
            });
          }

          if (filtered.length > 0) {
            setStats(filtered);
            return;
          }
        }
      } catch {
        // Fallback to telemetry.json directly if backend is restarting
      }

      try {
        const tRes = await fetch('data/telemetry.json');
        if (tRes.ok) {
          const tData = await tRes.json();
          const repoCount = tData?.summary?.public_repos ?? tData?.profile?.public_repos;
          const contribCount = tData?.summary?.contributions;
          if (isMounted && repoCount !== undefined && contribCount !== undefined) {
            setStats([
              { label: 'Public Repos', value: String(repoCount), icon: FolderGit2 },
              { label: 'Overall Contributions', value: String(contribCount), icon: GitCommit },
            ]);
          }
        }
      } catch {
        // Keep initial stats
      }
    };

    loadLiveStats();

    const handleSync = () => {
      loadLiveStats();
    };
    window.addEventListener('db-synced', handleSync);
    return () => {
      isMounted = false;
      window.removeEventListener('db-synced', handleSync);
    };
  }, []);

  return (
    <section className="github-strip" aria-label="GitHub activity stats">
      <div className="github-strip-inner">
        {isEnabled(config, 'githubStrip', 'githubStats') && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="github-stat-item">
                  <div className="github-stat-icon">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="github-stat-val">{item.value}</div>
                    <div className="github-stat-label">{item.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default GitHubStrip;
