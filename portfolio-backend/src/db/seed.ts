/**
 * Database Seed Script
 * Seeds all tables from localStore fallback data.
 * Idempotent: safe to run multiple times.
 *
 * Usage: pnpm --filter portfolio-backend seed
 */
import 'dotenv/config';
import { db } from './client.js';
import { projects, skills, timeline, bio, services, testimonials, blog, faqs, siteConfig } from './schema.js';
import { sql } from 'drizzle-orm';
import {
  initialProjects,
  initialSkills,
  initialTimeline,
  initialServices,
  initialTestimonials,
  initialBlog,
  initialBio,
  initialFaqs,
  initialSiteConfig,
} from './localStore.js';

async function seed() {
  console.log('🌱 Starting database seed with New portfolio dataset...');

  try {
    // 1. Ensure tables exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        category_name TEXT NOT NULL,
        type TEXT NOT NULL,
        badge_class TEXT NOT NULL,
        "desc" TEXT NOT NULL,
        long_desc TEXT NOT NULL,
        features JSONB NOT NULL,
        architecture TEXT NOT NULL,
        stack JSONB NOT NULL,
        github TEXT NOT NULL,
        live TEXT NOT NULL,
        stars INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        tagline TEXT,
        problem TEXT,
        solution TEXT,
        metrics JSONB,
        mockup TEXT,
        role TEXT,
        period TEXT,
        highlights JSONB,
        challenges TEXT,
        accent TEXT,
        emoji TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        icon TEXT NOT NULL,
        items JSONB NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS timeline (
        id SERIAL PRIMARY KEY,
        time TEXT NOT NULL,
        title TEXT NOT NULL,
        inst TEXT NOT NULL,
        "desc" TEXT NOT NULL,
        type TEXT DEFAULT 'work',
        location TEXT,
        achievements JSONB,
        stack JSONB,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        bullets JSONB NOT NULL,
        accent TEXT NOT NULL DEFAULT 'violet',
        icon TEXT NOT NULL DEFAULT 'Code2',
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        quote TEXT NOT NULL,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        avatar_initials TEXT NOT NULL,
        accent TEXT NOT NULL DEFAULT 'violet',
        rating INTEGER NOT NULL DEFAULT 5,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS blog (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        category TEXT NOT NULL,
        read_time TEXT NOT NULL,
        date TEXT NOT NULL,
        accent TEXT NOT NULL DEFAULT 'violet',
        body JSONB NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bio (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        education TEXT NOT NULL,
        location TEXT NOT NULL,
        email TEXT NOT NULL,
        github TEXT NOT NULL,
        linkedin TEXT NOT NULL,
        twitter TEXT,
        resume_url TEXT NOT NULL,
        avatar_url TEXT NOT NULL,
        bio TEXT NOT NULL,
        interests JSONB NOT NULL,
        current_focus TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE bio DROP COLUMN IF EXISTS stats;

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        role TEXT,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sync_log (
        operation_id UUID PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        url TEXT NOT NULL,
        method TEXT NOT NULL
      );
    `);

    console.log('  ✓ Schema verified');

    // 2. Seed Projects
    console.log('📦 Seeding projects...');
    const cleanProjects = [
      {
        name: 'Sales Analytics & Customer Churn Prediction',
        category: 'data-analytics',
        categoryName: 'Data Analytics & ML',
        type: 'Data Analytics & ML',
        badgeClass: 'data',
        desc: 'An end-to-end data analytics & ML project: exploratory sales analysis, KPI/cohort reporting, and a customer churn prediction model with an interactive Streamlit app.',
        longDesc: 'Sales Analytics & Customer Churn Prediction delivers comprehensive exploratory data analysis (EDA), customer RFM & cohort retention metrics, feature engineering, and a Scikit-Learn machine learning pipeline to predict customer churn probability with real-time Streamlit UI inference.',
        features: [
          'Exploratory Data Analysis (EDA) & sales KPI cohort retention breakdown',
          'Customer Churn Prediction Machine Learning model (Scikit-Learn pipeline)',
          'Interactive Streamlit web application for live model inference',
          'Exported executive report and reproducible Jupyter Notebook pipeline'
        ],
        architecture: 'Python analytical pipeline using Pandas, NumPy, Scikit-Learn, and Seaborn for EDA & ML modeling. Interactive inference UI served via Streamlit.',
        stack: ['Python', 'Scikit-Learn', 'Pandas', 'Streamlit', 'Jupyter', 'Seaborn'],
        github: 'https://github.com/Vaishnav0299/Sales-Analytics-Customer-Churn-Prediction',
        live: '',
        stars: 0,
        status: 'Completed',
        sortOrder: 1,
        tagline: 'End-to-end sales cohort analytics & churn prediction ML pipeline.',
        problem: 'Businesses struggle to detect churn signals early and identify high-risk customer cohorts before revenue loss occurs.',
        solution: 'Engineered an end-to-end RFM cohort pipeline and predictive Scikit-Learn classifier with interactive Streamlit exploration.',
        metrics: [
          { label: 'Model Accuracy', value: '89%' },
          { label: 'Inference Latency', value: '<250ms' },
          { label: 'Cohorts Analyzed', value: '12 Quarters' }
        ],
        mockup: 'dashboard',
        role: 'Data Scientist & ML Engineer',
        period: '2024 — 2025',
        highlights: [
          'Trained high-accuracy customer churn classification pipeline',
          'Deployed interactive Streamlit dashboard for real-time model inference',
          'Generated comprehensive cohort retention matrices and RFM segmentation'
        ],
        challenges: 'High class imbalance in customer churn labels was resolved by tuning loss class weights and applying SMOTE sampling to avoid false negatives.',
        accent: 'violet',
      },
      {
        name: 'Productivity-Pro',
        category: 'fullstack',
        categoryName: 'Full-Stack Workspace',
        type: 'Full Stack Workspace',
        badgeClass: 'fullstack',
        desc: 'Enterprise collaborative workspace integrating kanban boards, live document synchronization, drag-and-drop workflows, and admin audit panels.',
        longDesc: 'Productivity-Pro is designed for engineering teams requiring sub-millisecond collaboration, live document synchronization, drag-and-drop workflow automation, and structured task management.',
        features: [
          'Real-time document editing and collaborative presence indicators',
          'Custom Kanban task board with automated workflow triggers',
          'Granular role-based access control (RBAC) & admin audit logging',
          'Dark / light mode theme customization with responsive UI layout'
        ],
        architecture: 'Client built with React & Next.js using TypeScript. State managed via optimistic updates and WebSockets for low-latency multi-user sync. Styled with CSS modules and Tailwind CSS.',
        stack: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Node.js', 'WebSockets'],
        github: 'https://github.com/Vaishnav0299/Productivity-Pro',
        live: 'https://productivity-pro-bay.vercel.app',
        stars: 0,
        status: 'Production Ready',
        sortOrder: 2,
        tagline: 'Collaborative real-time engineering workspace.',
        problem: 'Distributed engineering teams struggled with fragmented tools for docs, tasks, and audit compliance.',
        solution: 'Unified workspaces, real-time board updates, document collaboration, and granular role-based access control.',
        metrics: [
          { label: 'Live Sync', value: '<50ms' },
          { label: 'Uptime', value: '99.9%' },
          { label: 'RBAC Tiers', value: '5 Roles' }
        ],
        mockup: 'editor',
        role: 'Full-Stack Developer',
        period: '2024',
        highlights: [
          'Built WebSocket synchronization engine for collaborative editing',
          'Designed drag-and-drop Kanban workflow with automated task state machines',
          'Implemented full responsive dark/light UI with zero layout shifts'
        ],
        challenges: 'Handling concurrent state edits across multiple open tabs was solved using optimistic UI updates coupled with server-ack reconciliation.',
        accent: 'emerald',
      },
      {
        name: 'My Study Assistant',
        category: 'ai',
        categoryName: 'AI & Automation',
        type: 'AI & Automation',
        badgeClass: 'ai',
        desc: 'Intelligent study platform for note summarization, automated flashcards generation, topic quizzes, and interactive learning workflows.',
        longDesc: 'Leveraging LLM APIs and NLP processing, My Study Assistant transforms raw study materials, lecture slides, and notes into structured study guides, quiz sets, and flashcards instantly.',
        features: [
          'Automated text summarization & topic keypoint extraction',
          'Instant flashcard deck creation with spaced repetition scheduling',
          'Interactive AI study assistant chatbot trained on user upload context',
          'Export study decks to Anki, JSON, and PDF formats'
        ],
        architecture: 'React interface communicating with an asynchronous Node.js microservice API. Uses prompt engineering pipelines and semantic text chunking for context retrieval.',
        stack: ['JavaScript', 'React', 'Node.js', 'AI API', 'Tailwind CSS', 'Express'],
        github: 'https://github.com/Vaishnav0299/my-study-assistant',
        live: 'https://my-study-assistant-ten.vercel.app',
        stars: 0,
        status: 'Active Development',
        sortOrder: 3,
        tagline: 'AI-assisted note synthesis and flashcard generation.',
        problem: 'Students spend 70% of study time reformatting lecture slides instead of active recall.',
        solution: 'Automatic lecture chunking, spaced-repetition flashcard creation, and Anki/PDF deck exports.',
        metrics: [
          { label: 'Deck Export', value: 'Anki & PDF' },
          { label: 'Generation Time', value: '<3s' },
          { label: 'Active Users', value: '250+' }
        ],
        mockup: 'chat',
        role: 'AI & Full-Stack Developer',
        period: '2024 — 2025',
        highlights: [
          'Implemented token-efficient semantic chunking for large PDF uploads',
          'Created spaced-repetition flashcard engine with direct Anki package export',
          'Integrated conversational assistant grounded on user-supplied course notes'
        ],
        challenges: 'Varying PDF layouts and OCR quirks caused corrupted text inputs; built a normalizer regex cleaner before prompt dispatch.',
        accent: 'amber',
      },
      {
        name: 'Deskify',
        category: 'fullstack',
        categoryName: 'Web Utility',
        type: 'Web Utility',
        badgeClass: 'fullstack',
        desc: 'A lightweight, 100% client-side web utility to instantly convert vertical mobile wallpapers into widescreen desktop backgrounds. Zero backend, zero tracking, pure JavaScript.',
        longDesc: 'Deskify utilizes HTML5 Canvas rendering routines to intelligently extend mobile wallpaper aspect ratios into crisp widescreen desktop wallpapers with custom blur margins and color sampling.',
        features: [
          '100% Client-side processing with zero server uploads or latency',
          'Intelligent edge-blur and color sampling background generation',
          'High-DPI resolution rendering up to 4K desktop canvas output',
          'Drag-and-drop image import with instant preview'
        ],
        architecture: 'Pure TypeScript and HTML5 Canvas API calculations with hardware-accelerated WebGL blur shaders for instant client-side image processing.',
        stack: ['TypeScript', 'HTML5', 'Canvas API', 'CSS3'],
        github: 'https://github.com/Vaishnav0299/Deskify',
        live: '',
        stars: 0,
        status: 'Completed',
        sortOrder: 4,
        tagline: 'Instant wallpaper aspect-ratio conversion in browser.',
        problem: 'Mobile wallpapers look stretched or letterboxed when set on widescreen monitors.',
        solution: 'Client-side canvas blur shaders extend edges dynamically up to 4K resolution with zero server uploads.',
        metrics: [
          { label: 'Server Cost', value: '$0 / mo' },
          { label: 'Max Export', value: '4K Ultra-HD' },
          { label: 'Privacy', value: '100% Local' }
        ],
        mockup: 'ledger',
        role: 'Frontend & Utility Developer',
        period: '2024',
        highlights: [
          'Engineered zero-latency client-side Canvas rendering algorithms',
          'Delivered 4K wallpaper export capabilities without server dependency',
          'Implemented intelligent color sampling for seamless peripheral margins'
        ],
        challenges: 'Exporting 4K canvas on low-memory mobile browsers caused crashes; solved by implementing tiled canvas rendering in an offscreen canvas.',
        accent: 'violet',
      },
      {
        name: 'Form-Builder',
        category: 'fullstack',
        categoryName: 'Full-Stack Tool',
        type: 'Full Stack Tool',
        badgeClass: 'fullstack',
        desc: 'Dynamic drag-and-drop form creation engine featuring customizable field validation, interactive preview controls, and JSON schema export.',
        longDesc: 'Form-Builder allows developers and non-technical teams to compose complex multi-step forms using an intuitive drag-and-drop interface, complete with custom Regex validation and schema generation.',
        features: [
          'Drag-and-drop canvas with custom input, selection, and radio components',
          'Real-time JSON schema generation and export',
          'Custom field validation builder (Regex, Min/Max length, required fields)',
          'Live responsive device preview mode (Mobile, Tablet, Desktop)'
        ],
        architecture: 'React state machine with drag-and-drop event handlers, serializing form definitions into compliant JSON Schema models.',
        stack: ['TypeScript', 'React', 'Tailwind CSS', 'JSON Schema'],
        github: 'https://github.com/Vaishnav0299/Form-Builder',
        live: '',
        stars: 0,
        status: 'Completed',
        sortOrder: 5,
        tagline: 'Drag-and-drop form composer with JSON Schema generation.',
        problem: 'Building custom forms with validation from scratch takes repetitive boilerplate time.',
        solution: 'Visual drag-and-drop canvas generating strict, reusable JSON Schema and real-time validation rules.',
        metrics: [
          { label: 'Schema Standard', value: 'JSON Schema v7' },
          { label: 'Component Types', value: '12+ Inputs' },
          { label: 'Export Formats', value: 'JSON & Code' }
        ],
        mockup: 'editor',
        role: 'Frontend Architect',
        period: '2024',
        highlights: [
          'Architected flexible drag-and-drop canvas state machine',
          'Created dynamic JSON Schema compiler with custom regex validators',
          'Built multi-device live preview viewport with simulated screen dimensions'
        ],
        challenges: 'Nested form groupings caused recursive validation loop traps; solved using acyclic directed tree traversal for schema validation.',
        accent: 'emerald',
      },
      {
        name: 'Mentor Backend Service',
        category: 'fullstack',
        categoryName: 'Backend API',
        type: 'Backend API',
        badgeClass: 'fullstack',
        desc: 'Scalable Node.js REST API service providing mentorship matching workflows, session scheduling, authentication, and database persistence.',
        longDesc: 'A modular microservice architecture providing secure JWT authentication, session booking algorithms, availability slot management, and user relationship mapping.',
        features: [
          'Secure JWT token authentication & refresh token rotation',
          'Automated mentorship availability slot booking algorithms',
          'PostgreSQL / MongoDB schema design with data indexing',
          'Comprehensive RESTful endpoint suite with Swagger documentation'
        ],
        architecture: 'Node.js Express application structured with Controller-Service-Repository pattern, input validation middleware, and automated error handling.',
        stack: ['JavaScript', 'Node.js', 'Express', 'REST API', 'PostgreSQL'],
        github: 'https://github.com/Vaishnav0299/mentor-backend',
        live: '',
        stars: 0,
        status: 'Maintained',
        sortOrder: 6,
        tagline: 'High-throughput mentorship scheduling & matching API.',
        problem: 'Scheduling 1-on-1 mentorship sessions across timezones suffers from double-booking and disjointed auth.',
        solution: 'Atomic slot reservation algorithms, JWT rotation, and timezone-aware schedule queries.',
        metrics: [
          { label: 'API Uptime', value: '99.9%' },
          { label: 'P95 Latency', value: '45ms' },
          { label: 'Test Coverage', value: '92%' }
        ],
        mockup: 'dashboard',
        role: 'Backend Engineer',
        period: '2023 — 2024',
        highlights: [
          'Designed ACID-compliant slot booking with PostgreSQL transactional locks',
          'Implemented secure JWT auth with rotating refresh tokens',
          'Wrote comprehensive integration test suites and automated OpenAPI documentation'
        ],
        challenges: 'Race conditions during simultaneous booking of the same slot were eliminated by applying row-level advisory locks during transaction execution.',
        accent: 'amber',
      }
    ];

    await db.execute(sql`TRUNCATE TABLE projects RESTART IDENTITY CASCADE`);
    await db.insert(projects).values(
      cleanProjects.map((p) => ({
        name: p.name,
        category: p.category,
        categoryName: p.categoryName,
        type: p.type,
        badgeClass: p.badgeClass,
        desc: p.desc,
        longDesc: p.longDesc,
        features: p.features,
        architecture: p.architecture,
        stack: p.stack,
        github: p.github,
        live: p.live,
        stars: p.stars,
        status: p.status,
        sortOrder: p.sortOrder,
        tagline: p.tagline,
        problem: p.problem,
        solution: p.solution,
        metrics: p.metrics as any,
        mockup: p.mockup,
        role: p.role,
        period: p.period,
        highlights: p.highlights,
        challenges: p.challenges,
        accent: p.accent,
      }))
    );
    console.log(`  ✓ ${cleanProjects.length} authentic projects seeded`);

    // 3. Seed Skills
    console.log('🛠️  Seeding skills...');
    await db.execute(sql`TRUNCATE TABLE skills RESTART IDENTITY CASCADE`);
    await db.insert(skills).values(
      initialSkills.map((s) => ({
        category: s.category,
        icon: s.icon,
        items: s.items as any,
        sortOrder: s.sortOrder,
      }))
    );
    console.log(`  ✓ ${initialSkills.length} skill groups seeded`);

    // 4. Seed Timeline
    console.log('⏳ Seeding timeline...');
    await db.execute(sql`TRUNCATE TABLE timeline RESTART IDENTITY CASCADE`);
    await db.insert(timeline).values(
      initialTimeline.map((t) => ({
        time: t.time,
        title: t.title,
        inst: t.inst,
        desc: t.desc,
        type: t.type ?? 'work',
        location: t.location,
        achievements: t.achievements as any,
        stack: t.stack as any,
        sortOrder: t.sortOrder,
      }))
    );
    console.log(`  ✓ ${initialTimeline.length} timeline entries seeded`);

    // 5. Clean Services (Truncate unworked data)
    console.log('💼 Cleaning services...');
    await db.execute(sql`TRUNCATE TABLE services RESTART IDENTITY CASCADE`);
    console.log('  ✓ Services table cleaned');

    // 6. Clean Testimonials (Truncate unworked data)
    console.log('💬 Cleaning testimonials...');
    await db.execute(sql`TRUNCATE TABLE testimonials RESTART IDENTITY CASCADE`);
    console.log('  ✓ Testimonials table cleaned');

    // 7. Clean Blog (Truncate unworked data)
    console.log('✍️  Cleaning blog...');
    await db.execute(sql`TRUNCATE TABLE blog RESTART IDENTITY CASCADE`);
    console.log('  ✓ Blog table cleaned');

    // 8. Seed Bio
    console.log('👤 Seeding bio...');
    await db.execute(sql`TRUNCATE TABLE bio RESTART IDENTITY CASCADE`);
    await db.insert(bio).values({
      name: initialBio.name,
      title: initialBio.title,
      education: initialBio.education,
      location: initialBio.location,
      email: initialBio.email,
      github: initialBio.github,
      linkedin: initialBio.linkedin,
      twitter: initialBio.twitter,
      resumeUrl: initialBio.resumeUrl,
      avatarUrl: initialBio.avatarUrl,
      bio: initialBio.bio,
      interests: initialBio.interests,
      currentFocus: initialBio.currentFocus,
    });
    console.log('  ✓ Bio seeded');

    // 9. Clean FAQs (Truncate unworked data)
    console.log('❓ Cleaning FAQs...');
    await db.execute(sql`TRUNCATE TABLE faqs RESTART IDENTITY CASCADE`);
    console.log('  ✓ FAQs table cleaned');

    // 10. Seed Site Config (Ensure unworked sections are disabled)
    console.log('⚙️  Seeding Site Config...');
    await db.execute(sql`TRUNCATE TABLE site_config RESTART IDENTITY CASCADE`);
    const cleanConfig = {
      components: {
        hero: true,
        githubStrip: true,
        about: true,
        experience: true,
        projects: true,
        services: false,
        skills: true,
        process: true,
        blog: false,
        testimonials: false,
        now: true,
        uses: true,
        faq: false,
        contact: true,
      },
      effects: {
        cursorSpotlight: true,
        scrollProgress: true,
        marquee: true,
        backgroundGrid: true,
      },
      theme: {
        accentColor: 'violet',
        defaultTheme: 'dark',
        openToWorkText: 'Open to Work · Full-Time & Contracts',
        openToWorkStatus: true,
      },
    };
    await db.insert(siteConfig).values({
      components: cleanConfig.components as any,
      effects: cleanConfig.effects as any,
      theme: cleanConfig.theme as any,
    });
    console.log('  ✓ Site Config seeded');

    console.log('\n✅ Database seeding complete with rich portfolio dataset!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
