import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Link2,
  Check,
  AlertCircle,
  Trash2,
  ExternalLink,
  Download,
  Eye,
  Star,
  Sparkles,
  Copy,
  RefreshCw,
  Plus,
  X,
  FileCheck,
  FolderOpen,
  Award,
  GraduationCap,
  BookOpen,
  FileCode,
  Globe,
} from 'lucide-react';
import { api } from '../lib/api';

const CATEGORIES = [
  { id: 'all',            label: 'All Documents',    icon: FolderOpen },
  { id: 'resume',         label: 'Resumes & CVs',    icon: FileText,    color: '#8b5cf6' },
  { id: 'certificate',    label: 'Certifications',   icon: Award,       color: '#10b981' },
  { id: 'transcript',     label: 'Transcripts',      icon: GraduationCap, color: '#06b6d4' },
  { id: 'whitepaper',     label: 'Research & Decks', icon: BookOpen,    color: '#f59e0b' },
  { id: 'recommendation', label: 'Recommendations',  icon: FileCheck,   color: '#ec4899' },
  { id: 'other',          label: 'Other Assets',     icon: FileCode,    color: '#64748b' },
];

export function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('upload'); // 'upload' | 'drive' | 'edit'
  const [submitting, setSubmitting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);

  // Form states
  const [selectedFile, setSelectedFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('resume');
  const [docDescription, setDocDescription] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [isPrimaryResume, setIsPrimaryResume] = useState(false);
  const [drivePreviewInfo, setDrivePreviewInfo] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments();
      setDocuments(res.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    const handleDbSynced = () => loadDocuments();
    window.addEventListener('db-synced', handleDbSynced);
    return () => window.removeEventListener('db-synced', handleDbSynced);
  }, []);

  // Reset form
  const resetForm = () => {
    setSelectedFile(null);
    setDocTitle('');
    setDocCategory('resume');
    setDocDescription('');
    setDriveUrl('');
    setIsPrimaryResume(false);
    setDrivePreviewInfo(null);
    setEditingDoc(null);
    setError('');
  };

  const openUploadModal = (mode = 'upload') => {
    resetForm();
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    resetForm();
    setEditingDoc(doc);
    setDocTitle(doc.title);
    setDocCategory(doc.category);
    setDocDescription(doc.description || '');
    setDriveUrl(doc.driveUrl || '');
    setIsPrimaryResume(doc.isPrimaryResume || false);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Live Drive URL parsing helper
  const handleDriveUrlChange = async (url) => {
    setDriveUrl(url);
    if (!url.trim()) {
      setDrivePreviewInfo(null);
      return;
    }
    try {
      const res = await api.parseDriveUrl(url);
      setDrivePreviewInfo(res.data);
      if (!docTitle && res.data?.fileId) {
        setDocTitle(`Google Drive Document (${res.data.fileId.substring(0, 6)})`);
      }
    } catch {
      // Ignored during typing
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (!docTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setDocTitle(cleanName);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (modalMode === 'upload') {
        if (!selectedFile) throw new Error('Please select a file to upload');
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', docTitle.trim() || selectedFile.name);
        formData.append('category', docCategory);
        formData.append('description', docDescription);
        formData.append('isPrimaryResume', String(isPrimaryResume));

        await api.uploadDocument(formData);
        showToast('Local document uploaded successfully!');
      } else if (modalMode === 'drive') {
        if (!driveUrl.trim()) throw new Error('Please enter a valid Google Drive or Cloud URL');
        await api.createDriveDoc({
          title: docTitle.trim() || 'Google Drive Document',
          category: docCategory,
          description: docDescription,
          driveUrl: driveUrl.trim(),
          isPrimaryResume,
        });
        showToast('Google Drive document linked successfully!');
      } else if (modalMode === 'edit') {
        await api.updateDocument(editingDoc.id, {
          title: docTitle.trim(),
          category: docCategory,
          description: docDescription,
          driveUrl: editingDoc.sourceType === 'gdrive_link' ? driveUrl.trim() : undefined,
          isPrimaryResume,
        });
        showToast('Document updated successfully!');
      }

      setIsModalOpen(false);
      resetForm();
      await loadDocuments();
      window.dispatchEvent(new Event('db-synced'));
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetPrimaryResume = async (doc) => {
    try {
      await api.setPrimaryResume(doc.id);
      showToast(`"${doc.title}" is now your active portfolio resume!`);
      await loadDocuments();
      window.dispatchEvent(new Event('db-synced'));
    } catch (err) {
      setError(err.message || 'Failed to set active resume');
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.title}"?`)) return;
    try {
      await api.deleteDocument(doc.id);
      showToast('Document deleted');
      await loadDocuments();
      window.dispatchEvent(new Event('db-synced'));
    } catch (err) {
      setError(err.message || 'Failed to delete document');
    }
  };

  const copyToClipboard = (text, label = 'Link') => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const filteredDocs = documents.filter((doc) => {
    if (activeCategory === 'all') return true;
    return doc.category === activeCategory;
  });

  const primaryResumeDoc = documents.find((d) => d.isPrimaryResume);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '0.75rem 1.25rem', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <Check style={{ width: 16, height: 16 }} /> {toast}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Document & Resume Studio
            </h1>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 20, background: 'rgba(139,92,246,0.15)', color: 'var(--accent-primary)', fontWeight: 700 }}>
              {documents.length} Assets
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Upload local files or link Google Drive documents. Manage your live portfolio Resume, Certifications, Transcripts, and Project Whitepapers with 1-click active sync.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => openUploadModal('upload')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            <Upload size={15} /> Upload Local File
          </button>
          <button
            onClick={() => openUploadModal('drive')}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            <Link2 size={15} /> Link Google Drive
          </button>
        </div>
      </div>

      {/* Active Primary Resume Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <Star size={22} fill="currentColor" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} /> Active Portfolio Resume
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {primaryResumeDoc ? primaryResumeDoc.title : 'Default Resume (/resume.pdf)'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>Source: <strong>{primaryResumeDoc?.sourceType === 'gdrive_link' ? 'Google Drive Link' : 'Local File'}</strong></span>
              {primaryResumeDoc?.fileSize && <span>Size: <strong>{primaryResumeDoc.fileSize}</strong></span>}
              <span>Synced with Navbar & Hero CTA</span>
            </div>
          </div>
        </div>

        {primaryResumeDoc && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPreviewDoc(primaryResumeDoc)}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <Eye size={14} /> Preview
            </button>
            <a
              href={primaryResumeDoc.downloadUrl || primaryResumeDoc.fileUrl}
              download={primaryResumeDoc.fileName}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <Download size={14} /> Download
            </a>
          </div>
        )}
      </div>

      {/* Error Notice */}
      {error && (
        <div style={{ padding: '0.85rem 1.1rem', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
          <AlertCircle size={17} /> {error}
        </div>
      )}

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count = cat.id === 'all' ? documents.length : documents.filter(d => d.category === cat.id).length;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.9rem',
                borderRadius: 10,
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                background: isActive ? 'rgba(139,92,246,0.15)' : 'var(--bg-surface)',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} style={{ color: cat.color || 'inherit' }} />
              <span>{cat.label}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.8, background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.4rem', borderRadius: 8 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
          <p>Loading document collection…</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--bg-surface)', borderRadius: 16, border: '1px dashed var(--border-color)' }}>
          <FolderOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>No Documents in this Category</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', maxWidth: 450, margin: '0.35rem auto 1.25rem' }}>
            Upload a local PDF/document or connect a Google Drive link to showcase your resume, certificates, and academic credentials.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button onClick={() => openUploadModal('upload')} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
              <Upload size={14} style={{ marginRight: 4 }} /> Upload File
            </button>
            <button onClick={() => openUploadModal('drive')} className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}>
              <Link2 size={14} style={{ marginRight: 4 }} /> Link Google Drive
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredDocs.map((doc) => {
            const catMeta = CATEGORIES.find(c => c.id === doc.category) || CATEGORIES[1];
            const isPrimary = doc.isPrimaryResume;

            return (
              <div
                key={doc.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: isPrimary ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: 16,
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isPrimary ? '0 8px 24px rgba(139,92,246,0.15)' : 'none',
                }}
              >
                {/* Top Category & Source Badges */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 8,
                          background: `${catMeta.color || '#8b5cf6'}20`,
                          color: catMeta.color || '#8b5cf6',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        {doc.category.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 8,
                          background: doc.sourceType === 'gdrive_link' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.06)',
                          color: doc.sourceType === 'gdrive_link' ? '#3b82f6' : 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        {doc.sourceType === 'gdrive_link' ? <Globe size={11} /> : <FileCode size={11} />}
                        {doc.sourceType === 'gdrive_link' ? 'Google Drive' : 'Local File'}
                      </span>
                    </div>

                    {isPrimary && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(139,92,246,0.15)', padding: '0.2rem 0.5rem', borderRadius: 8 }}>
                        <Star size={12} fill="currentColor" /> Active Resume
                      </span>
                    )}
                  </div>

                  {/* Document Title & File Info */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.35rem', lineHeight: 1.35 }}>
                    {doc.title}
                  </h3>

                  {doc.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                      {doc.description}
                    </p>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', opacity: 0.85 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                      📄 {doc.fileName || 'document.pdf'}
                    </span>
                    {doc.fileSize && <span>• {doc.fileSize}</span>}
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      title="Preview Document"
                      style={{ padding: '0.4rem 0.65rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <a
                      href={doc.downloadUrl || doc.fileUrl}
                      download={doc.fileName}
                      target="_blank"
                      rel="noreferrer"
                      title="Direct Download"
                      style={{ padding: '0.4rem 0.65rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                    >
                      <Download size={13} /> Download
                    </a>
                    <button
                      onClick={() => copyToClipboard(doc.downloadUrl || doc.fileUrl, 'Download Link')}
                      title="Copy Direct URL"
                      style={{ padding: '0.4rem 0.5rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <Copy size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {doc.category === 'resume' && !isPrimary && (
                      <button
                        onClick={() => handleSetPrimaryResume(doc)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)' }}
                      >
                        <Star size={12} /> Set as Active
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(doc)}
                      title="Edit Document Info"
                      style={{ padding: '0.4rem 0.5rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      title="Delete Document"
                      style={{ padding: '0.4rem 0.5rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Upload / Link / Edit ────────────────────────────────────── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
            >
              <X size={20} />
            </button>

            {/* Modal Title & Tabs */}
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
              {modalMode === 'upload' && 'Upload Local Document'}
              {modalMode === 'drive' && 'Link Google Drive / Cloud Document'}
              {modalMode === 'edit' && 'Edit Document Metadata'}
            </h2>

            {modalMode !== 'edit' && (
              <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-primary)', padding: '0.3rem', borderRadius: 12, marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setModalMode('upload')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: 9,
                    border: 'none',
                    background: modalMode === 'upload' ? 'var(--accent-primary)' : 'transparent',
                    color: modalMode === 'upload' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Upload size={14} /> Local File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('drive')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: 9,
                    border: 'none',
                    background: modalMode === 'drive' ? 'var(--accent-primary)' : 'transparent',
                    color: modalMode === 'drive' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Link2 size={14} /> Google Drive Link
                </button>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Local File Drop Zone */}
              {modalMode === 'upload' && (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                    Select Document File *
                  </label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: dragOver ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-color)',
                      background: dragOver ? 'rgba(139,92,246,0.08)' : 'var(--bg-primary)',
                      borderRadius: 14,
                      padding: '1.75rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      style={{ display: 'none' }}
                    />

                    {selectedFile ? (
                      <div>
                        <FileCheck size={36} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {selectedFile.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {(selectedFile.size / 1024).toFixed(1)} KB • Click to change file
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload size={32} style={{ color: 'var(--accent-primary)', margin: '0 auto 0.5rem' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          Drag & drop document here, or click to browse
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Supports PDF, DOC, DOCX, PNG, JPG (up to 20MB)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Google Drive Link Input */}
              {(modalMode === 'drive' || (modalMode === 'edit' && editingDoc?.sourceType === 'gdrive_link')) && (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                    Google Drive or Cloud Document URL *
                  </label>
                  <input
                    type="url"
                    value={driveUrl}
                    onChange={(e) => handleDriveUrlChange(e.target.value)}
                    placeholder="https://drive.google.com/file/d/1ABC.../view?usp=sharing"
                    required
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      borderRadius: 10,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.86rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                    Tip: Ensure the file permission in Google Drive is set to <strong>"Anyone with the link can view"</strong>.
                  </div>

                  {drivePreviewInfo && drivePreviewInfo.fileId && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Check size={14} /> Detected Google Drive File ID: {drivePreviewInfo.fileId}
                      </div>
                      <div>Direct Download: <code style={{ fontSize: '0.7rem' }}>{drivePreviewInfo.downloadUrl}</code></div>
                    </div>
                  )}
                </div>
              )}

              {/* Document Title */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  Document Title *
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Vaishnav Gaware - Full Stack Engineer Resume 2026"
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  Category *
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="resume">Resume / Curriculum Vitae</option>
                  <option value="certificate">Certification / Award</option>
                  <option value="transcript">Degree / Academic Transcript</option>
                  <option value="whitepaper">Research Paper / Presentation Deck</option>
                  <option value="recommendation">Letter of Recommendation</option>
                  <option value="other">Other Asset / Document</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief note about this document version or issuance authority"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Set as Primary Resume Checkbox */}
              {docCategory === 'resume' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.8rem', borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <input
                    type="checkbox"
                    id="set-primary-resume-chk"
                    checked={isPrimaryResume}
                    onChange={(e) => setIsPrimaryResume(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="set-primary-resume-chk" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Set as active portfolio resume (updates Navbar & Hero download link)
                  </label>
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                  style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.3rem', fontSize: '0.85rem' }}
                >
                  {submitting ? 'Saving…' : modalMode === 'edit' ? 'Update Document' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Document In-Browser Preview Modal ───────────────────────────────── */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
          {/* Preview Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: 'var(--bg-surface)', borderRadius: '16px 16px 0 0', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {previewDoc.title}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {previewDoc.category.toUpperCase()} • {previewDoc.sourceType === 'gdrive_link' ? 'Google Drive Stream' : 'Local Storage'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <a
                href={previewDoc.downloadUrl || previewDoc.fileUrl}
                download={previewDoc.fileName}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Download size={14} /> Download
              </a>
              <a
                href={previewDoc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                <ExternalLink size={14} /> Open in Tab
              </a>
              <button
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }}
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Preview Frame */}
          <div style={{ flex: 1, background: '#1e1e24', borderRadius: '0 0 16px 16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {previewDoc.previewUrl ? (
              <iframe
                src={previewDoc.previewUrl}
                title={previewDoc.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay"
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#fff', padding: '2rem' }}>
                <FileText size={48} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
                <p>Preview not available directly in browser.</p>
                <a href={previewDoc.downloadUrl} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  Download to View
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDocuments;
