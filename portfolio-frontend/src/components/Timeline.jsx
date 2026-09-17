import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { timelineData } from '../data/portfolioData'; // fallback

export function Timeline() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.getTimeline()
      .then(res => setEntries(res.data))
      .catch(() => setEntries(timelineData)); // static fallback
  }, []);

  return (
    <section id="timeline" className="timeline-section">
      <div className="section-header">
        <h2 className="section-title">Career & Education</h2>
        <p className="section-subtitle">Engineering experience, academic milestones, and open-source contributions.</p>
      </div>
      <div className="timeline-container" id="vertical-timeline">
        {entries.map((node, idx) => (
          <div key={node.id ?? idx} className="timeline-node">
            <span className="timeline-time">{node.time}</span>
            <div className="timeline-body">
              <h3>{node.title}</h3>
              <div className="timeline-institution">{node.inst}</div>
              <p className="timeline-desc">{node.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
