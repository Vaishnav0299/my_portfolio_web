import React from 'react';
import { About } from '../components/About';
import { Timeline } from '../components/Timeline';

export function AboutPage() {
  return (
    <div className="about-page-container" style={{ padding: '2rem 0' }}>
      <About />
      <Timeline />
    </div>
  );
}
