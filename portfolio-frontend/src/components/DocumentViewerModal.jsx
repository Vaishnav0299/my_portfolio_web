import React from 'react';
import { X, Download, ExternalLink, FileText, Globe } from 'lucide-react';

export function DocumentViewerModal({ doc, onClose }) {
  if (!doc) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal Topbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.5rem',
          background: 'var(--bg-surface)',
          borderRadius: '16px 16px 0 0',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(139,92,246,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            {doc.sourceType === 'gdrive_link' ? <Globe size={18} /> : <FileText size={18} />}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {doc.title}
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {doc.category?.toUpperCase() || 'DOCUMENT'} • {doc.sourceType === 'gdrive_link' ? 'Google Drive Cloud Asset' : 'Verified Local Asset'} {doc.fileSize ? `• ${doc.fileSize}` : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a
            href={doc.downloadUrl || doc.fileUrl}
            download={doc.fileName || 'document.pdf'}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Download size={14} /> Download
          </a>
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <ExternalLink size={14} /> Open in New Tab
          </a>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, display: 'flex' }}
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Frame / Iframe Viewport */}
      <div
        style={{
          flex: 1,
          background: '#18181b',
          borderRadius: '0 0 16px 16px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {doc.previewUrl ? (
          <iframe
            src={doc.previewUrl}
            title={doc.title}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay"
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#fff', padding: '2rem' }}>
            <FileText size={48} style={{ opacity: 0.5, marginBottom: '0.75rem' }} />
            <p>Direct preview is not available in browser.</p>
            <a href={doc.downloadUrl || doc.fileUrl} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Download to View
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentViewerModal;
