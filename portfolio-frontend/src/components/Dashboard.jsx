import React from 'react';
import { Package, Star, GitCommit, PieChart, GitFork } from 'lucide-react';
import { useTelemetry } from '../hooks/useTelemetry';
import { getLanguageColor } from '../utils/githubUtils';
import { LanguageStatsBar } from './LanguageStatsBar';

export function Dashboard({ theme }) {
  const { profile, repos, compiledAt, loading, error } = useTelemetry('Vaishnav0299');

  const formattedDate = compiledAt ? new Date(compiledAt * 1000).toLocaleString() : 'Syncing...';

  // Helper to construct Vercel dynamic streak stats URL based on theme
  const getStreakStatsUrl = (currentTheme) => {
    const isDark = currentTheme === 'dark';
    const baseColor = '8b5cf6'; // Accent purple
    return `https://streak-stats.demolab.com?user=Vaishnav0299&theme=transparent&hide_border=true&ring=${baseColor}&fire=${baseColor}&currStreakNum=${isDark ? 'ffffff' : '0f172a'}&sideNums=${isDark ? 'ffffff' : '0f172a'}&sideLabels=${isDark ? 'a1a1aa' : '475569'}&currStreakLabel=${baseColor}&dates=${isDark ? 'a1a1aa' : '475569'}`;
  };


  // Sort repos dynamically in React to determine top repo (only from owned repositories)
  const topRepo = repos && repos.length > 0
    ? [...repos]
        .filter(r => r.owner && r.owner.login.toLowerCase() === 'vaishnav0299')
        .sort((a, b) => {
          if (b.stargazers_count !== a.stargazers_count) {
            return b.stargazers_count - a.stargazers_count;
          }
          return new Date(b.updated_at) - new Date(a.updated_at);
        })[0]
    : null;

  // Sort all repos by push/update time to showcase recent activity first
  const sortedRepos = repos && repos.length > 0
    ? [...repos].sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at))
    : [];

  return (
    <section id="dashboard" className="dashboard-section">
      <div className="dashboard-container">
        <div className="section-header">
          <h2 className="section-title">Live GitHub Telemetry</h2>
          <p className="section-subtitle">Real-time repository statistics synced via GitHub REST API & automated cache pipelines.</p>
        </div>

        {/* --- 1. Visualizations Grid (Above the fold) --- */}
        <div className="telemetry-visualizations-main" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '2.5rem' }}>
          
          {/* GitHub Heatmap Calendar Card (Full Width) */}
          <div className="visualization-card heatmap-card" style={{ width: '100%', padding: '1.75rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              <GitCommit style={{ width: 22, height: 22, color: 'var(--accent-primary)' }} />
              <span>GitHub Contribution Calendar</span>
            </h3>
            <div className="viz-img-wrapper" style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center', padding: '0.5rem 0' }}>
              <img 
                src="https://ghchart.rshah.org/a855f7/Vaishnav0299" 
                alt="Vaishnav0299's GitHub Heatmap"
                style={{ minWidth: '720px', height: 'auto', filter: theme === 'dark' ? 'none' : 'brightness(1.05) contrast(0.95)' }} 
              />
            </div>
          </div>

          {/* Activity Line Graph & Language Donut Card Grid */}
          <div className="telemetry-visualizations" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
            <div className="visualization-card">
              <h3>
                <GitCommit style={{ width: 22, height: 22, color: 'var(--accent-primary)' }} />
                <span>Commit Contribution Activity</span>
              </h3>
              <div className="viz-img-wrapper">
                <img src="https://github-readme-activity-graph.vercel.app/graph?username=Vaishnav0299&bg_color=00000000&color=a855f7&line=3b82f6&point=a855f7&area=true&hide_border=true&hide_title=true" alt="Commit Activity Graph" />
              </div>
            </div>
            
            <div className="visualization-card">
              <h3>
                <PieChart style={{ width: 22, height: 22, color: 'var(--accent-primary)' }} />
                <span>Top Languages & Tech Stack</span>
              </h3>
              <div className="viz-img-wrapper">
                <img src="https://github-stats-extended.vercel.app/api/top-langs/?username=Vaishnav0299&layout=compact&theme=transparent&hide_border=true&title_color=a855f7&text_color=a1a1aa&icon_color=3b82f6&hide_title=true" alt="Most Used Languages" />
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. Secondary Metrics & Cards Grid (Below the fold) --- */}
        <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem', marginBottom: '3.5rem' }}>
          
          {/* Card 1: Public Repos count */}
          <div className="metric-card" id="metric-repos" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '170px' }}>
            <div className="card-glow"></div>
            <div>
              <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span className="metric-label">Public Repositories</span>
                <Package className="metric-icon" style={{ width: 22, height: 22 }} />
              </div>
              <div className="metric-value" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{loading ? '--' : profile?.public_repos || repos.length}</div>
            </div>
            <div className="metric-footer" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 'auto' }}>Actively maintained projects</div>
          </div>

          {/* Card 2: GitHub Streak Stats Embed */}
          <div className="metric-card streak-stats-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '170px', padding: '1rem' }}>
            <div className="card-glow"></div>
            <img 
              src={getStreakStatsUrl(theme)}
              alt="GitHub Streak Stats" 
              style={{ width: '100%', height: '100%', maxHeight: '140px', objectFit: 'contain' }}
            />
          </div>

          {/* Card 4: Top Repository Dynamic Card */}
          {loading ? (
            <div className="metric-card loading-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '170px' }}>
              <div className="card-glow"></div>
              <span style={{ color: 'var(--text-muted)' }}>Loading Top Repo...</span>
            </div>
          ) : topRepo ? (
            <div className="metric-card top-repo-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '170px' }}>
              <div className="card-glow"></div>
              <div style={{ zIndex: 1 }}>
                <div className="metric-header" style={{ marginBottom: '0.4rem' }}>
                  <span className="metric-label" style={{ color: 'var(--accent-secondary)' }}>★ Top Repository</span>
                </div>
                <a href={topRepo.html_url} target="_blank" rel="noreferrer" className="repo-name" style={{ 
                  fontSize: '1.15rem', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  textDecoration: 'none',
                  display: 'block',
                  marginBottom: '0.3rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {topRepo.name}
                </a>
                <p className="repo-description" style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--text-secondary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.4'
                }}>
                  {topRepo.description || "Open source repository developed by Vaishnav Gaware."}
                </p>
              </div>
              {/* Languages Stats Bar */}
              <div style={{ zIndex: 1, padding: '0 0.5rem' }}>
                <LanguageStatsBar languages={topRepo.languages} />
              </div>

              <div className="repo-meta-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
                {(!topRepo.languages || Object.keys(topRepo.languages).length === 0) ? (
                  <div className="repo-lang" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                    <span className="lang-dot" style={{ background: getLanguageColor(topRepo.language) }}></span>
                    <span>{topRepo.language || "Code"}</span>
                  </div>
                ) : <div></div>}
                <div className="repo-stats-aside" style={{ display: 'flex', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Star style={{ width: 12, height: 12 }} /> {topRepo.stargazers_count}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><GitFork style={{ width: 12, height: 12 }} /> {topRepo.forks_count}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="metric-card loading-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '170px' }}>
              <div className="card-glow"></div>
              <span style={{ color: 'var(--text-muted)' }}>No public repository found</span>
            </div>
          )}

        </div>

        {/* --- 3. Pinned & Recent Repositories Grid (Showcase) --- */}
        <div className="repo-explorer-header">
          <h3>Repository Showcase Explorer</h3>
          <span className="sync-timestamp" id="sync-time">Sync: {formattedDate}</span>
        </div>

        <div className="repo-grid" id="repo-showcase-container">
          {loading ? (
            <>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </>
          ) : sortedRepos.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>No public repositories found.</p>
          ) : (
            sortedRepos.slice(0, 6).map(repo => {
              const isContribution = repo.owner && repo.owner.login.toLowerCase() !== 'vaishnav0299';
              return (
                <div key={repo.id} className="repo-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-name" style={{ marginBottom: 0 }}>
                        {isContribution ? repo.full_name : repo.name}
                      </a>
                      {isContribution && (
                        <span className="contribution-badge" style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          fontWeight: 600
                        }}>Contribution</span>
                      )}
                    </div>
                    <p className="repo-description" style={{ marginBottom: '1rem' }}>
                      {repo.description || (isContribution 
                        ? "Open source repository contributed to by Vaishnav Gaware." 
                        : "Open source repository developed by Vaishnav Gaware.")}
                    </p>
                  </div>

                  {/* Languages Stats Bar */}
                  <LanguageStatsBar languages={repo.languages} />

                  <div className="repo-meta-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.85rem' }}>
                    {(!repo.languages || Object.keys(repo.languages).length === 0) ? (
                      <div className="repo-lang" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                        {((repo.languages_list && repo.languages_list.length > 0)
                          ? repo.languages_list
                          : (repo.language ? [repo.language] : [])
                        ).map((lang, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span className="lang-dot" style={{ background: getLanguageColor(lang), margin: 0 }}></span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{lang}</span>
                          </div>
                        ))}
                      </div>
                    ) : <div></div>}
                    <div className="repo-stats-aside">
                      <span><Star style={{ width: 12, height: 12 }} /> {repo.stargazers_count}</span>
                      <span><GitFork style={{ width: 12, height: 12 }} /> {repo.forks_count}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
