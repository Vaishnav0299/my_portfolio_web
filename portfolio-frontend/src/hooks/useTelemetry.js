import { useState, useEffect } from 'react';

const IGNORED_REPOS = ['Vaishnav0299'];

const isCourseOrFork = (repo) => {
  if (repo.fork) return true;
  const lower = repo.name.toLowerCase();
  return lower.startsWith('skills-') || lower.includes('copilot-') || lower.includes('introduction-to-github') || IGNORED_REPOS.includes(repo.name);
};

export function useTelemetry(username = 'Vaishnav0299') {
  const [data, setData] = useState({ profile: null, repos: [], compiledAt: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTelemetry() {
      try {
        // First try local telemetry cache
        const res = await fetch('data/telemetry.json');
        if (res.ok) {
          const json = await res.json();
          if (json && json.profile && json.repos) {
            const publicRepos = json.repos.filter(r => !r.private && !isCourseOrFork(r));
            setData({
              profile: json.profile,
              repos: publicRepos,
              compiledAt: json.compiledAt,
            });
            setLoading(false);
            return;
          }
        }
        throw new Error('Local cache unavailable');
      } catch (err) {
        // Fallback to live API
        try {
          const [profRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?type=public&sort=updated&per_page=30`),
          ]);
          if (!profRes.ok || !reposRes.ok) throw new Error('GitHub API Error');
          const profile = await profRes.json();
          const rawRepos = await reposRes.json();
          const publicRepos = Array.isArray(rawRepos)
            ? rawRepos.filter(r => !r.private && !isCourseOrFork(r))
            : [];

          // Try to discover contributed repos from events and a predefined list
          const contributedNames = new Set(['devabokare/Deva-Portfolio-master']);
          try {
            const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public`);
            if (eventsRes.ok) {
              const events = await eventsRes.json();
              if (Array.isArray(events)) {
                events.forEach(event => {
                  if (event.repo && event.repo.name) {
                    const [owner] = event.repo.name.split('/');
                    if (owner && owner.toLowerCase() !== username.toLowerCase()) {
                      contributedNames.add(event.repo.name);
                    }
                  }
                });
              }
            }
          } catch (e) {
            console.warn('Failed to fetch public events:', e);
          }

          // Fetch details for each contributed repo in parallel
          const contributedRepos = [];
          const fetchedNames = Array.from(contributedNames);
          await Promise.all(
            fetchedNames.map(async (name) => {
              try {
                const res = await fetch(`https://api.github.com/repos/${name}`);
                if (res.ok) {
                  const repoData = await res.json();
                  contributedRepos.push(repoData);
                }
              } catch (e) {
                console.warn(`Failed to fetch repo details for ${name}:`, e);
              }
            })
          );

          // Fetch languages for all repositories in parallel
          const allRepos = [...publicRepos, ...contributedRepos];
          const reposWithLanguages = await Promise.all(
            allRepos.map(async (repo) => {
              try {
                const res = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`);
                if (res.ok) {
                  const langs = await res.json();
                  return {
                    ...repo,
                    languages_list: Object.keys(langs),
                    languages: langs
                  };
                }
              } catch (e) {
                console.warn(`Failed to fetch languages for ${repo.full_name}:`, e);
              }
              return repo;
            })
          );

          setData({
            profile,
            repos: reposWithLanguages,
            compiledAt: Math.floor(Date.now() / 1000),
          });
        } catch (apiErr) {
          setError(apiErr.message);
        } finally {
          setLoading(false);
        }
      }
    }

    loadTelemetry();
  }, [username]);

  return { ...data, loading, error };
}
