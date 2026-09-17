import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>© 2026 Vaishnav Gaware. Built with React & Vite.</p>
        <div className="footer-links">
          <a href="https://github.com/Vaishnav0299" target="_blank" rel="noreferrer"><Github style={{ width: 16, height: 16 }} /> GitHub</a>
          <a href="https://www.linkedin.com/in/vaishnav-gaware-107799315/" target="_blank" rel="noreferrer"><Linkedin style={{ width: 16, height: 16 }} /> LinkedIn</a>
          <a href="mailto:vaishnavgaware1@gmail.com"><Mail style={{ width: 16, height: 16 }} /> Email</a>
        </div>
      </div>
    </footer>
  );
}
