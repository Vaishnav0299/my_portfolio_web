import React from 'react';

const accentColors = {
  violet: { primary: '#8b5cf6', secondary: '#a78bfa', muted: 'rgba(139,92,246,0.15)' },
  emerald: { primary: '#10b981', secondary: '#34d399', muted: 'rgba(16,185,129,0.15)' },
  amber: { primary: '#f59e0b', secondary: '#fbbf24', muted: 'rgba(245,158,11,0.15)' },
};

export function ProjectMockup({ project }) {
  const accent = project.accent || 'violet';
  const c = accentColors[accent] || accentColors.violet;
  const mockup = project.mockup || 'dashboard';

  return (
    <div className="mockup-window" style={{ position: 'relative' }}>
      <div className="mockup-header">
        <span className="mockup-dot red" />
        <span className="mockup-dot yellow" />
        <span className="mockup-dot green" />
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {project.name.split('—')[0].trim().toLowerCase()}.dev
        </span>
      </div>

      <div className="mockup-svg-wrap">
        <svg
          viewBox="0 0 320 160"
          style={{ width: '100%', height: '100%', maxHeight: '160px' }}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {mockup === 'dashboard' && <DashboardWireframe c={c} />}
          {mockup === 'chat' && <ChatWireframe c={c} />}
          {mockup === 'editor' && <EditorWireframe c={c} />}
          {mockup === 'ledger' && <LedgerWireframe c={c} />}
        </svg>
      </div>

      {project.emoji && (
        <span
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '1.5rem',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
          }}
          aria-hidden="true"
        >
          {project.emoji}
        </span>
      )}
    </div>
  );
}

function DashboardWireframe({ c }) {
  return (
    <g>
      <rect x="8" y="12" width="36" height="136" rx="6" fill={c.muted} />
      <circle cx="18" cy="24" r="3" fill={c.primary} />
      <rect x="14" y="34" width="20" height="3" rx="1.5" fill={c.secondary} opacity="0.5" />
      <rect x="14" y="42" width="20" height="3" rx="1.5" fill={c.secondary} opacity="0.3" />
      <rect x="14" y="50" width="20" height="3" rx="1.5" fill={c.secondary} opacity="0.3" />
      <rect x="52" y="12" width="260" height="20" rx="4" fill={c.muted} />
      <circle cx="64" cy="22" r="3" fill={c.primary} />
      <rect x="74" y="20" width="60" height="4" rx="2" fill={c.secondary} opacity="0.4" />
      <rect x="52" y="40" width="80" height="36" rx="4" fill={c.muted} />
      <rect x="58" y="46" width="30" height="3" rx="1.5" fill={c.secondary} opacity="0.5" />
      <rect x="58" y="54" width="50" height="6" rx="2" fill={c.primary} opacity="0.7" />
      <rect x="140" y="40" width="80" height="36" rx="4" fill={c.muted} />
      <rect x="146" y="46" width="30" height="3" rx="1.5" fill={c.secondary} opacity="0.5" />
      <rect x="146" y="54" width="50" height="6" rx="2" fill={c.primary} opacity="0.7" />
      <rect x="228" y="40" width="84" height="36" rx="4" fill={c.muted} />
      <rect x="234" y="46" width="30" height="3" rx="1.5" fill={c.secondary} opacity="0.5" />
      <rect x="234" y="54" width="60" height="6" rx="2" fill={c.primary} opacity="0.7" />
      <rect x="52" y="84" width="172" height="64" rx="4" fill={c.muted} />
      <polyline
        points="60,130 90,120 120,110 150,95 180,100 210,85"
        fill="none"
        stroke={c.primary}
        strokeWidth="2"
        opacity="0.8"
      />
      <polyline
        points="60,138 90,128 120,118 150,108 180,112 210,98"
        fill="none"
        stroke={c.secondary}
        strokeWidth="1.5"
        opacity="0.5"
      />
      <rect x="232" y="84" width="80" height="64" rx="4" fill={c.muted} />
      <rect x="240" y="92" width="40" height="3" rx="1.5" fill={c.secondary} opacity="0.4" />
      <rect x="240" y="100" width="64" height="3" rx="1.5" fill={c.secondary} opacity="0.25" />
      <rect x="240" y="108" width="64" height="3" rx="1.5" fill={c.secondary} opacity="0.25" />
      <rect x="240" y="116" width="64" height="3" rx="1.5" fill={c.secondary} opacity="0.25" />
      <rect x="240" y="124" width="64" height="3" rx="1.5" fill={c.secondary} opacity="0.25" />
      <rect x="240" y="132" width="64" height="3" rx="1.5" fill={c.secondary} opacity="0.25" />
    </g>
  );
}

function ChatWireframe({ c }) {
  return (
    <g>
      <rect x="8" y="12" width="60" height="136" rx="6" fill={c.muted} />
      <rect x="14" y="20" width="40" height="4" rx="2" fill={c.secondary} opacity="0.4" />
      <rect x="14" y="32" width="48" height="10" rx="2" fill={c.primary} opacity="0.2" />
      <rect x="14" y="46" width="48" height="10" rx="2" fill={c.secondary} opacity="0.1" />
      <rect x="14" y="60" width="48" height="10" rx="2" fill={c.secondary} opacity="0.1" />
      <rect x="14" y="74" width="48" height="10" rx="2" fill={c.secondary} opacity="0.1" />
      <rect x="76" y="12" width="236" height="100" rx="6" fill={c.muted} />
      <rect x="84" y="22" width="100" height="14" rx="4" fill={c.secondary} opacity="0.25" />
      <rect x="84" y="44" width="200" height="10" rx="2" fill={c.primary} opacity="0.4" />
      <rect x="84" y="58" width="180" height="10" rx="2" fill={c.primary} opacity="0.4" />
      <rect x="84" y="72" width="160" height="10" rx="2" fill={c.primary} opacity="0.4" />
      <rect x="84" y="88" width="30" height="8" rx="2" fill={c.secondary} opacity="0.5" />
      <rect x="118" y="88" width="30" height="8" rx="2" fill={c.secondary} opacity="0.5" />
      <rect x="76" y="120" width="236" height="28" rx="6" fill={c.muted} />
      <rect x="84" y="130" width="120" height="4" rx="2" fill={c.secondary} opacity="0.3" />
      <circle cx="300" cy="134" r="6" fill={c.primary} />
    </g>
  );
}

function EditorWireframe({ c }) {
  return (
    <g>
      <rect x="8" y="12" width="304" height="16" rx="4" fill={c.muted} />
      <circle cx="20" cy="20" r="3" fill={c.secondary} opacity="0.6" />
      <rect x="30" y="18" width="40" height="4" rx="2" fill={c.secondary} opacity="0.3" />
      <circle cx="280" cy="20" r="4" fill={c.primary} />
      <circle cx="290" cy="20" r="4" fill={c.secondary} opacity="0.7" />
      <circle cx="300" cy="20" r="4" fill="#ec4899" opacity="0.7" />
      <rect x="8" y="36" width="304" height="112" rx="6" fill={c.muted} />
      <rect x="20" y="48" width="120" height="4" rx="2" fill={c.secondary} opacity="0.4" />
      <rect x="20" y="58" width="180" height="4" rx="2" fill={c.secondary} opacity="0.4" />
      <rect x="20" y="68" width="100" height="4" rx="2" fill={c.secondary} opacity="0.4" />
      <rect x="124" y="46" width="2" height="8" fill={c.primary} />
      <rect x="20" y="82" width="160" height="4" rx="2" fill={c.secondary} opacity="0.3" />
      <rect x="20" y="92" width="200" height="4" rx="2" fill={c.secondary} opacity="0.3" />
      <rect x="20" y="100" width="80" height="6" rx="2" fill={c.primary} opacity="0.2" />
      <rect x="20" y="108" width="140" height="4" rx="2" fill={c.secondary} opacity="0.3" />
      <rect x="240" y="100" width="60" height="20" rx="4" fill={c.primary} opacity="0.25" />
      <rect x="246" y="106" width="40" height="3" rx="1.5" fill={c.secondary} opacity="0.6" />
      <rect x="246" y="112" width="30" height="3" rx="1.5" fill={c.secondary} opacity="0.4" />
    </g>
  );
}

function LedgerWireframe({ c }) {
  return (
    <g>
      <rect x="8" y="12" width="304" height="20" rx="4" fill={c.muted} />
      <rect x="16" y="20" width="60" height="4" rx="2" fill={c.secondary} opacity="0.4" />
      <rect x="240" y="18" width="60" height="8" rx="2" fill={c.primary} opacity="0.3" />
      <rect x="8" y="40" width="304" height="32" rx="6" fill={c.muted} />
      <rect x="16" y="48" width="50" height="3" rx="1.5" fill={c.secondary} opacity="0.5" />
      <rect x="16" y="56" width="100" height="8" rx="2" fill={c.primary} opacity="0.8" />
      <rect x="8" y="80" width="304" height="68" rx="6" fill={c.muted} />
      <rect x="16" y="88" width="40" height="4" rx="2" fill={c.secondary} opacity="0.4" />
      <rect x="100" y="88" width="50" height="4" rx="2" fill={c.secondary} opacity="0.4" />
      <rect x="200" y="88" width="50" height="4" rx="2" fill={c.secondary} opacity="0.4" />
      <rect x="270" y="88" width="30" height="4" rx="2" fill={c.secondary} opacity="0.4" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="16" y={100 + i * 11} width="40" height="3" rx="1.5" fill={c.secondary} opacity="0.25" />
          <rect x="100" y={100 + i * 11} width="50" height="3" rx="1.5" fill={c.secondary} opacity="0.25" />
          <rect x="200" y={100 + i * 11} width="50" height="3" rx="1.5" fill={c.secondary} opacity="0.25" />
          <circle cx="285" cy={101.5 + i * 11} r="2.5" fill={i === 1 ? c.primary : c.secondary} opacity={i === 1 ? 0.7 : 0.3} />
        </g>
      ))}
    </g>
  );
}

export default ProjectMockup;
