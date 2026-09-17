import React from 'react';
import { Contact } from '../components/Contact';

export function ContactPage({ onShowToast }) {
  return (
    <div className="contact-page-container">
      <Contact onShowToast={onShowToast} />
    </div>
  );
}
