import React, { useState, useEffect } from 'react';
import { Mail, Send, Check, Copy, User, MessageSquare, MapPin, Github, Linkedin, Twitter, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useConfig, isEnabled } from '../context/ConfigContext.jsx';

const ROLES = [
  'Full-Time Role',
  'Contract / MVP',
  'Technical Advisory',
  'Just Saying Hi',
];

export function Contact({ onShowToast }) {
  const { config } = useConfig();
  const [bio, setBio] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Full-Time Role',
    message: '',
  });

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch bio for dynamic contact info
  useEffect(() => {
    let isMounted = true;
    api.getBio()
      .then((res) => { if (isMounted && res?.data) setBio(res.data); })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const emailAddr = bio?.email || 'vaishnavgaware1@gmail.com';
  const locationStr = bio?.location || 'Pune, Maharashtra, India';
  const githubUrl = bio?.github || 'https://github.com/Vaishnav0299';
  const linkedinUrl = bio?.linkedin || 'https://www.linkedin.com/in/vaishnav-gaware';
  const twitterUrl = bio?.twitter || 'https://twitter.com/vaishnav0299';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailAddr);
    setCopied(true);
    if (onShowToast) {
      onShowToast(`Email copied to clipboard: ${emailAddr}`);
    }
    setTimeout(() => setCopied(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in Name, Email, and your Message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.sendContact({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        message: formData.message,
      });

      setIsSubmitting(false);

      if (res?.success) {
        setIsSubmitted(true);
        if (onShowToast) onShowToast('Message delivered! I will reply shortly.');
      } else {
        setErrorMsg(res?.error || 'Failed to send message. Please email directly.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || `Network error. Please email ${emailAddr} directly.`);
    }
  };

  return (
    <section id="contact" className="section" style={{ padding: '5rem 0' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            START A CONVERSATION
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            Let&apos;s Build Something Resilient
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.75rem auto 0', fontSize: '1.05rem' }}>
            Have a project, open position, or an architectural problem to bounce around? Drop a line below.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2.5rem' }}>
          {/* Direct Channels Column */}
          {isEnabled(config, 'contact', 'contactDirectInfo') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card contact-card" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  Direct Channels
                </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                I respond to all developer and client inquiries within 24 hours.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Email card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Mail size={18} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{emailAddr}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    style={{ color: copied ? '#10b981' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Location card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <MapPin size={18} style={{ color: 'var(--accent-emerald)' }} />
                  <span>{locationStr} &middot; IST (UTC+5:30)</span>
                </div>

                {/* Turnaround */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Clock size={18} style={{ color: '#f59e0b' }} />
                  <span>Available for immediate start</span>
                </div>
              </div>

              {/* Social profiles */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Github size={16} /> GitHub
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Linkedin size={16} /> LinkedIn
                </a>
                {twitterUrl && (
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Twitter size={16} /> Twitter
                  </a>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Form Column */}
          {isEnabled(config, 'contact', 'contactForm') && (
            <div className="glass-card contact-card" style={{ padding: '2rem', borderRadius: '16px' }}>
              {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Message Delivered!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
                  Thank you for reaching out. I will review your note and get back to you shortly.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', role: 'Full-Time Role', message: '' });
                  }}
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Role Type Selector */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    What are you looking for?
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSelect(r)}
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          background: formData.role === r ? 'var(--accent-primary)' : 'var(--bg-main)',
                          color: formData.role === r ? '#fff' : 'var(--text-secondary)',
                          border: formData.role === r ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Smith"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Your Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@company.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                {/* Message */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Project or Role Details *
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formData.message.length} / 2000
                    </span>
                  </div>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={2000}
                    placeholder="Tell me about your tech stack, product goals, or what you'd like to build..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {errorMsg && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Delivering Message...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Contact;
