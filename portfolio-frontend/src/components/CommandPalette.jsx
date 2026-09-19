import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  FolderGit2,
  Cpu,
  Briefcase,
  Github,
  Linkedin,
  Twitter,
  Mail,
  FileText,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Clock,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

const cmdItems = [
  { id: 1, label: 'Home / Hero', target: '/', key: 'H', icon: Home, action: 'nav' },
  { id: 2, label: 'About Me & Philosophy', target: '/#about', key: 'A', icon: Briefcase, action: 'hash' },
  { id: 3, label: 'Career & Experience', target: '/#experience', key: 'E', icon: Briefcase, action: 'hash' },
  { id: 4, label: 'Featured Projects & Mockups', target: '/#projects', key: 'P', icon: FolderGit2, action: 'hash' },
  { id: 5, label: 'Engineering Services', target: '/#services', key: 'S', icon: CheckCircle2, action: 'hash' },
  { id: 6, label: 'Skills & Proficiency Matrix', target: '/#skills', key: 'K', icon: Cpu, action: 'hash' },
  { id: 7, label: 'Technical Writing & Blog', target: '/#writing', key: 'W', icon: BookOpen, action: 'hash' },
  { id: 8, label: 'Client & Team Reviews', target: '/#testimonials', key: 'R', icon: MessageSquare, action: 'hash' },
  { id: 9, label: 'What I Am Doing Now', target: '/#now', key: 'N', icon: Clock, action: 'hash' },
  { id: 10, label: 'Uses, Gear & Software Setup', target: '/#uses', key: 'U', icon: Laptop, action: 'hash' },
  { id: 11, label: 'Frequently Asked Questions', target: '/#faq', key: 'F', icon: HelpCircle, action: 'hash' },
  { id: 12, label: 'Contact & Hire Form', target: '/#contact', key: 'C', icon: Mail, action: 'hash' },
  { id: 14, label: 'Download Resume (PDF)', target: '/resume.pdf', key: 'PDF', icon: FileText, action: 'download' },
  { id: 15, label: 'Open GitHub Profile', target: 'https://github.com/Vaishnav0299', key: 'GH', icon: Github, action: 'ext' },
  { id: 16, label: 'Open LinkedIn Profile', target: 'https://www.linkedin.com/in/vaishnav-gaware', key: 'IN', icon: Linkedin, action: 'ext' },
  { id: 17, label: 'Open Twitter Profile', target: 'https://twitter.com/vaishnav0299', key: 'TW', icon: Twitter, action: 'ext' },
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

  const filtered = cmdItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item) => {
    onClose();
    if (item.action === 'nav') {
      navigate(item.target);
    } else if (item.action === 'hash') {
      if (window.location.pathname !== '/') {
        navigate(item.target);
      } else {
        const id = item.target.replace('/#', '');
        const elem = document.getElementById(id);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (item.action === 'download') {
      window.open(item.target, '_blank');
    } else if (item.action === 'ext') {
      window.open(item.target, '_blank');
    }
  };

  return (
    <div
      className="cmd-modal-backdrop active"
      onClick={(e) => e.target.classList.contains('cmd-modal-backdrop') && onClose()}
    >
      <div className="cmd-modal">
        <div className="cmd-header">
          <Search className="cmd-search-icon" />
          <input
            type="text"
            id="cmd-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to section..."
            autoFocus
            autoComplete="off"
          />
          <span className="cmd-esc-badge" onClick={onClose} style={{ cursor: 'pointer' }}>
            ESC
          </span>
        </div>
        <div className="cmd-list" id="cmd-options-list">
          {filtered.length === 0 ? (
            <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No commands found.
            </p>
          ) : (
            filtered.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.id} className="cmd-item" onClick={() => handleSelect(item)}>
                  <IconComponent style={{ width: 17, height: 17 }} />
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

export default CommandPalette;
