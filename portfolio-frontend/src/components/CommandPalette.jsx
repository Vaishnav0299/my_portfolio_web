import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, FolderGit2, Cpu, Briefcase, Terminal as TermIcon, Github, Linkedin, Mail } from 'lucide-react';

const cmdItems = [
  { id: 1, label: 'Go to Home', target: '/', key: '/', icon: Home, action: 'nav' },
  { id: 2, label: 'Go to About Me', target: '/about', key: '/about', icon: Briefcase, action: 'nav' },

  { id: 4, label: 'View Projects', target: '/projects', key: '/projects', icon: FolderGit2, action: 'nav' },
  { id: 5, label: 'View Skills & Tech Stack', target: '/skills', key: '/skills', icon: Cpu, action: 'nav' },
  { id: 6, label: 'Get in Touch (Contact)', target: '/contact', key: '/contact', icon: Mail, action: 'nav' },
  { id: 7, label: 'Open Developer Terminal', target: '/terminal', key: '/terminal', icon: TermIcon, action: 'nav' },
  { id: 8, label: 'Open GitHub Profile', target: 'https://github.com/Vaishnav0299', key: '↗', icon: Github, action: 'ext' },
  { id: 9, label: 'Open LinkedIn Profile', target: 'https://www.linkedin.com/in/vaishnav-gaware-107799315/', key: '↗', icon: Linkedin, action: 'ext' }
];

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = cmdItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    onClose();
    if (item.action === 'nav') {
      navigate(item.target);
    } else if (item.action === 'ext') {
      window.open(item.target, '_blank');
    }
  };

  return (
    <div className="cmd-modal-backdrop active" onClick={(e) => e.target.classList.contains('cmd-modal-backdrop') && onClose()}>
      <div className="cmd-modal">
        <div className="cmd-header">
          <Search className="cmd-search-icon" />
          <input
            type="text"
            id="cmd-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or section..."
            autoFocus
            autoComplete="off"
          />
          <span className="cmd-esc-badge" onClick={onClose} style={{ cursor: 'pointer' }}>ESC</span>
        </div>
        <div className="cmd-list" id="cmd-options-list">
          {filtered.length === 0 ? (
            <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No commands found.</p>
          ) : (
            filtered.map(item => {
              const IconComponent = item.icon;
              return (
                <div key={item.id} className="cmd-item" onClick={() => handleSelect(item)}>
                  <IconComponent style={{ width: 18, height: 18 }} />
                  <span>{item.label}</span>
                  <span className="cmd-key">{item.key}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
