import React, { useState } from 'react';
import { Mail, Send, Check, Copy, User, MessageSquare, MapPin, Github, Linkedin, Clock, AlertCircle } from 'lucide-react';
import { aboutData } from '../data/portfolioData';

export function Contact({ onShowToast }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(aboutData.email);
    setCopied(true);
    if (onShowToast) {
      onShowToast('Email address copied to clipboard!');
    }
    setTimeout(() => setCopied(false), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Primary: POST to /api/contact (saves to DB + forwards to Web3Forms server-side)
      const apiRes = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      const apiData = await apiRes.json();

      setIsSubmitting(false);

      if (apiData.success) {
        setIsSubmitted(true);
        if (onShowToast) onShowToast('Message sent! It will arrive in your inbox.');
        return;
      }
      throw new Error(apiData.error ?? 'API submission failed');
    } catch (apiErr) {
      // Fallback: submit directly to Web3Forms if API is unreachable
      try {
        const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
        if (!accessKey) throw new Error('No fallback configured');

        const payload = new FormData();
        payload.append('access_key', accessKey);
        payload.append('name', formData.name);
        payload.append('email', formData.email);
        payload.append('message', formData.message);
        payload.append('from_name', 'Portfolio Contact Form');
        payload.append('subject', `[Portfolio Message] New message from ${formData.name}`);

        const fallbackRes = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: payload });
        const fallbackData = await fallbackRes.json();
        setIsSubmitting(false);

        if (fallbackData.success) {
          setIsSubmitted(true);
          if (onShowToast) onShowToast('Message sent! It will arrive in your inbox.');
        } else {
          setErrorMsg(fallbackData.message || 'Failed to send message. Please try again.');
        }
      } catch {
        setIsSubmitting(false);
        setErrorMsg('Network error. Unable to send message. Please try again later.');
      }
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitted(false);
  };

  return (
    <section id="contact" className="contact-section">
      <div className="section-header">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">Have a project idea, collaboration proposal, job opportunity, or inquiry? Send a direct message or reach out via email.</p>
      </div>

      <div className="contact-main-grid">
        {/* --- Left Column: Info & Connect Cards --- */}
        <div className="contact-info-column">
          
          {/* Main Direct Email Card */}
          <div className="contact-info-card accent-card">
            <div className="info-card-header">
              <div className="info-icon-badge">
                <Mail style={{ width: 22, height: 22 }} />
              </div>
              <div>
                <h4>Direct Email</h4>
                <p className="info-card-sub">Primary contact channel</p>
              </div>
            </div>
            <div className="email-copy-box">
              <span className="email-text">{aboutData.email}</span>
              <button 
                onClick={handleCopyEmail} 
                className="copy-btn"
                title="Copy Email to Clipboard"
                type="button"
              >
                {copied ? <Check style={{ width: 16, height: 16, color: '#10b981' }} /> : <Copy style={{ width: 16, height: 16 }} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Location & Availability Card */}
          <div className="contact-info-card">
            <div className="info-card-header">
              <div className="info-icon-badge location-badge">
                <MapPin style={{ width: 22, height: 22 }} />
              </div>
              <div>
                <h4>Location & Timezone</h4>
                <p className="info-card-sub">{aboutData.location || 'Pune, India'} • IST (UTC+5:30)</p>
              </div>
            </div>
            <div className="availability-status">
              <span className="status-dot"></span>
              <span>Available for Full-Stack, ML & Open-Source Projects</span>
            </div>
          </div>

          {/* Quick Response SLA Card */}
          <div className="contact-info-card">
            <div className="info-card-header">
              <div className="info-icon-badge time-badge">
                <Clock style={{ width: 22, height: 22 }} />
              </div>
              <div>
                <h4>Response Time</h4>
                <p className="info-card-sub">Fast turnarounds</p>
              </div>
            </div>
            <p className="info-card-text">
              I usually reply to all inquiries within <strong>24 hours</strong>. Feel free to connect directly on LinkedIn or GitHub as well!
            </p>
          </div>

          {/* Social Connect Links */}
          <div className="contact-social-grid">
            <a href={aboutData.github} target="_blank" rel="noreferrer" className="social-connect-btn">
              <Github style={{ width: 18, height: 18 }} />
              <span>GitHub</span>
            </a>
            <a href={aboutData.linkedin} target="_blank" rel="noreferrer" className="social-connect-btn linkedin">
              <Linkedin style={{ width: 18, height: 18 }} />
              <span>LinkedIn</span>
            </a>
          </div>

        </div>

        {/* --- Right Column: Interactive Form --- */}
        <div className="contact-form-column">
          <div className="contact-form-card">
            
            {isSubmitted ? (
              <div className="form-success-state">
                <div className="success-icon-wrap">
                  <Check style={{ width: 36, height: 36 }} />
                </div>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for reaching out, <strong>{formData.name}</strong>. Your message has been sent directly to my inbox!</p>
                <button onClick={handleReset} className="btn btn-secondary btn-sm" style={{ marginTop: '1.5rem' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-header">
                  <h3>
                    <MessageSquare style={{ width: 20, height: 20, color: 'var(--accent-primary)' }} />
                    <span>Send a Direct Message</span>
                  </h3>
                  <p>Fill out the form below to get in touch directly.</p>
                </div>

                {errorMsg && (
                  <div className="form-error-banner">
                    <AlertCircle style={{ width: 18, height: 18 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-name">Your Name <span className="required">*</span></label>
                    <div className="input-input-wrap">
                      <User className="input-icon" />
                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Alex Mercer"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-email">Your Email Address <span className="required">*</span></label>
                    <div className="input-input-wrap">
                      <Mail className="input-icon" />
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="alex@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message">Your Message <span className="required">*</span></label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message, project scope, or inquiry details here..."
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary submit-btn" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send style={{ width: 18, height: 18 }} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
