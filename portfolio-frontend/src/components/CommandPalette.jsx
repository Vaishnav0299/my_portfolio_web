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
  Award,
  GraduationCap,
} from 'lucide-react';
import { api } from '../lib/api';

const staticCmdItems = [
  { id: 'nav-home', label: 'Home / Hero', target: '/', key: 'H', icon: Home, action: 'nav' },
  { id: 'nav-about', label: 'About Me & Philosophy', target: '/#about', key: 'A', icon: Briefcase, action: 'hash' },
  { id: 'nav-exp', label: 'Career & Experience', target: '/#experience', key: 'E', icon: Briefcase, action: 'hash' },
  { id: 'nav-proj', label: 'Featured Projects & Mockups', target: '/#projects', key: 'P', icon: FolderGit2, action: 'hash' },
  { id: 'nav-serv', label: 'Engineering Services', target: '/#services', key: 'S', icon: CheckCircle2, action: 'hash' },
  { id: 'nav-skills', label: 'Skills & Proficiency Matrix', target: '/#skills', key: 'K', icon: Cpu, action: 'hash' },
  { id: 'nav-blog', label: 'Technical Writing & Blog', target: '/#writing', key: 'W', icon: BookOpen, action: 'hash' },
  { id: 'nav-rev', label: 'Client & Team Reviews', target: '/#testimonials', key: 'R', icon: MessageSquare, action: 'hash' },
  { id: 'nav-now', label: 'What I Am Doing Now', target: '/#now', key: 'N', icon: Clock, action: 'hash' },
  { id: 'nav-uses', label: 'Uses, Gear & Software Setup', target: '/#uses', key: 'U', icon: Laptop, action: 'hash' },
  { id: 'nav-faq', label: 'Frequently Asked Questions', target: '/#faq', key: 'F', icon: HelpCircle, action: 'hash' },
  { id: 'nav-contact', label: 'Contact & Hire Form', target: '/#contact', key: 'C', icon: Mail, action: 'hash' },
  { id: 'ext-gh', label: 'Open GitHub Profile', target: 'https://github.com/Vaishnav0299', key: 'GH', icon: Github, action: 'ext' },
  { id: 'ext-li', label: 'Open LinkedIn Profile', target: 'https://www.linkedin.com/in/vaishnav-gaware', key: 'IN', icon: Linkedin, action: 'ext' },
  { id: 'ext-tw', label: 'Open Twitter Profile', target: 'https://twitter.com/vaishnav0299', key: 'TW', icon: Twitter, action: 'ext' },
];

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(staticCmdItems);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDynamicItems = async () => {
      try {
        const [bioRes, docsRes] = await Promise.allSettled([
          api.getBio(),
          api.getDocuments(),
        ]);

        const resumeUrl = bioRes.status === 'fulfilled' && bioRes.value.data?.resumeUrl ? bioRes.value.data.resumeUrl : '/resume.pdf';
        const docList = docsRes.status === 'fulfilled' && Array.isArray(docsRes.value.data) ? docsRes.value.data : [];

        const dynamicDocs = [
          { id: 'doc-resume', label: 'Download Active Resume (PDF)', target: resumeUrl, key: 'RESUME', icon: FileText, action: 'download' },
          ...docList.map(d => ({
            id: `doc-${d.id}`,
            label: `View Document: ${d.title}`,
            target: d.downloadUrl || d.fileUrl,
            key: d.category.toUpperCase(),
            icon: d.category === 'certificate' ? Award : d.category === 'transcript' ? GraduationCap : FileText,
            action: 'download',
          })),
        ];

        setItems([...dynamicDocs, ...staticCmdItems]);
      } catch {
        // Keep static
      }
    };

    if (isOpen) {
      loadDynamicItems();
    }
  }, [isOpen]);

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

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.key?.toLowerCase().includes(query.toLowerCase())
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
