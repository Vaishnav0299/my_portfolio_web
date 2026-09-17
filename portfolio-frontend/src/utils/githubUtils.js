export const getLanguageColor = (lang) => {
  const colors = {
    typescript: '#3178c6',
    javascript: '#f1e05a',
    css: '#563d7c',
    html: '#e34c26',
    python: '#3572a5',
    go: '#00add8',
    rust: '#dea584',
    java: '#b07219',
    cpp: '#f34b7d',
    c: '#555555',
  };
  const key = (lang || '').toLowerCase();
  return colors[key] || 'var(--accent-primary)';
};
