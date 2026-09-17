import React from 'react';
import { CheckCircle } from 'lucide-react';

export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className="toast">
        <CheckCircle style={{ width: 18, height: 18, color: 'var(--accent-primary)' }} />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
