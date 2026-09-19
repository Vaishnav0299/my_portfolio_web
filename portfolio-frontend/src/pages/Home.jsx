import React from 'react';
import { Hero } from '../components/Hero';
import { GitHubStrip } from '../components/GitHubStrip';
import { About } from '../components/About';
import { Timeline } from '../components/Timeline';
import { Projects } from '../components/Projects';
import { Services } from '../components/Services';
import { Skills } from '../components/Skills';
import { Process } from '../components/Process';
import { Blog } from '../components/Blog';
import { Testimonials } from '../components/Testimonials';
import { Now } from '../components/Now';
import { Uses } from '../components/Uses';
import { FAQ } from '../components/FAQ';
import { Contact } from '../components/Contact';
import { useConfig } from '../context/ConfigContext.jsx';

export function Home() {
  const { config } = useConfig();
  const c = config?.components || {};

  return (
    <div className="home-page-container">
      {/* 1. Hero */}
      {c.hero !== false && <Hero />}

      {/* 2. GitHub Activity Strip */}
      {c.githubStrip !== false && <GitHubStrip />}

      {/* 3. About Identity & Philosophy */}
      {c.about !== false && <About />}

      {/* 4. Experience & Education Timeline */}
      {c.experience !== false && <Timeline />}

      {/* 5. Projects Showcase with Wireframe Mockups */}
      {c.projects !== false && <Projects />}

      {/* 6. Engineering Services & Conversion */}
      {c.services !== false && <Services />}

      {/* 7. Technical Skills Matrix */}
      {c.skills !== false && <Skills />}

      {/* 8. Development Process (4 Phases) */}
      {c.process !== false && <Process />}

      {/* 9. Technical Writing & Notes */}
      {c.blog !== false && <Blog />}

      {/* 10. Client & Team Testimonials Marquee */}
      {c.testimonials !== false && <Testimonials />}

      {/* 11. What I Am Doing Now */}
      {c.now !== false && <Now />}

      {/* 12. Tech Stack & Gear Setup */}
      {c.uses !== false && <Uses />}

      {/* 13. FAQ */}
      {c.faq !== false && <FAQ />}

      {/* 14. Contact Form */}
      {c.contact !== false && <Contact />}
    </div>
  );
}

export default Home;
