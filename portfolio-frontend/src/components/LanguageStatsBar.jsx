import React from 'react';
import { getLanguageColor } from '../utils/githubUtils';

export function LanguageStatsBar({ languages }) {
  if (!languages || Object.keys(languages).length === 0) return null;

  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  if (totalBytes === 0) return null;

  // Calculate percentages and sort languages by byte count descending
  const sortedLangs = Object.entries(languages)
    .map(([name, bytes]) => {
      const percentage = (bytes / totalBytes) * 100;
      return { name, bytes, percentage };
    })
    .sort((a, b) => b.bytes - a.bytes);

  return (
    <div className="languages-stats-container" style={{ marginTop: '0.85rem', width: '100%', zIndex: 1 }}>
      {/* 1. Segmented Progress Bar */}
      <div className="languages-progress-bar" style={{
        display: 'flex',
        height: '8px',
        width: '100%',
        borderRadius: '9999px',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.08)',
        marginBottom: '0.65rem'
      }}>
        {sortedLangs.map((lang) => (
          <div
            key={lang.name}
            style={{
              width: `${lang.percentage}%`,
              background: getLanguageColor(lang.name),
              height: '100%'
            }}
            title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* 2. Legend / List */}
      <div className="languages-legend" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem 0.85rem',
        alignItems: 'center'
      }}>
        {sortedLangs.map((lang) => (
          <div key={lang.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span className="lang-dot" style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: getLanguageColor(lang.name),
              margin: 0
            }}></span>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {lang.name}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {lang.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
