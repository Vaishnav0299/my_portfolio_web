import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: "What is your typical timeline for a project or MVP?",
    a: "Most production web apps land in the 4–8 week range depending on scope. A focused MVP can ship in 2–3 weeks; a multi-tenant SaaS with auth, billing, and real-time features usually runs 6–10 weeks. I provide a scoped, transparent timeline after our discovery call.",
  },
  {
    q: "How do you handle pricing and contract structure?",
    a: "I work on fixed-scope project quotes (preferred for defined deliverables) or monthly retainers for ongoing work. Project quotes include the build, testing, deployment, and documentation handover. Milestone payments are typically split 40% upfront, 30% mid-milestone, and 30% on delivery.",
  },
  {
    q: "Do you work with existing codebases and distributed engineering teams?",
    a: "Yes — roughly a third of my work is modernizing or scaling existing codebases. I audit the system, profile bottlenecks, and propose an iterative refactor plan that ships value early instead of risky big-bang rewrites. I can embed directly with your team via Slack/Linear/GitHub or own a slice independently.",
  },
  {
    q: "Who owns the code and intellectual property when complete?",
    a: "You do — 100%. All source code, schemas, and deployment assets belong to your team upon final payment. There are zero proprietary runtime locks.",
  },
  {
    q: "Are you open to full-time engineering roles?",
    a: "Yes — I am open to Senior Full-Stack and Systems Engineering roles, remote-first or Pune-based.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <section id="faq" className="section" style={{ padding: '5rem 0' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="pulse-pill" style={{ marginBottom: '0.75rem' }}>
            COMMON QUESTIONS
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Key answers regarding availability, timelines, and development workflow.
          </p>
        </div>

        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                      color: 'var(--accent-primary)',
                    }}
                  />
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
