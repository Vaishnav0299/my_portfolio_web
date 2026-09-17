/**
 * Database Seed Script
 * Seeds all tables from the static portfolioData.js fallback data.
 * Idempotent: uses ON CONFLICT DO NOTHING — safe to run multiple times.
 *
 * Usage: pnpm --filter @portfolio/api seed
 */
import 'dotenv/config';
import { db } from './client.js';
import { projects, skills, timeline, bio } from './schema.js';
import { sql } from 'drizzle-orm';

// ─── Seed Data (sourced from static portfolioData.js) ───────────────────────

const projectsSeed = [
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
      'Exported executive report and reproducible Jupyter Notebook pipeline',
    ],
    architecture: 'Python analytical pipeline using Pandas, NumPy, Scikit-Learn, and Seaborn for EDA & ML modeling. Interactive inference UI served via Streamlit.',
    stack: ['Python', 'Scikit-Learn', 'Pandas', 'Streamlit', 'Jupyter', 'Seaborn'],
    github: 'https://github.com/Vaishnav0299/Sales-Analytics-Customer-Churn-Prediction',
    live: 'https://github.com/Vaishnav0299/Sales-Analytics-Customer-Churn-Prediction',
    stars: 1,
    status: 'Completed',
    sortOrder: 1,
  },
  {
    name: 'Productivity-Pro',
    category: 'fullstack',
    categoryName: 'Full-Stack Workspace',
    type: 'Full Stack Workspace',
    badgeClass: 'fullstack',
    desc: 'Enterprise-ready collaborative real-time workspace application integrating workspaces, kanban boards, collaborative documents, presence indicators, and administrative audit panels.',
    longDesc: 'Productivity-Pro is designed for engineering teams requiring sub-millisecond collaboration, live document synchronization, drag-and-drop workflow automation, and structured task management.',
    features: [
      'Real-time document editing and collaborative presence indicators',
      'Custom Kanban task board with automated workflow triggers',
      'Granular role-based access control (RBAC) & admin audit logging',
      'Dark / light mode theme customization with responsive UI layout',
    ],
    architecture: 'Client built with React & Next.js using TypeScript. State managed via optimistic updates and WebSockets for low-latency multi-user sync. Styled with CSS modules and Tailwind CSS.',
    stack: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Node.js', 'WebSockets'],
    github: 'https://github.com/Vaishnav0299/Productivity-Pro',
    live: 'https://productivity-pro-bay.vercel.app',
    stars: 12,
    status: 'Production Ready',
    sortOrder: 2,
  },
  {
    name: 'My Study Assistant',
    category: 'ai',
    categoryName: 'AI & Automation',
    type: 'AI & Automation',
    badgeClass: 'ai',
    desc: 'An intelligent study platform designed for note organization, automated flashcards generation, topic summaries, and interactive learning workflows.',
    longDesc: 'Leveraging LLM APIs and NLP processing, My Study Assistant transforms raw study materials, lecture slides, and notes into structured study guides, quiz sets, and flashcards instantly.',
    features: [
      'Automated text summarization & topic keypoint extraction',
      'Instant flashcard deck creation with spaced repetition scheduling',
      'Interactive AI study assistant chatbot trained on user upload context',
      'Export study decks to Anki, JSON, and PDF formats',
    ],
    architecture: 'React interface communicating with an asynchronous Node.js microservice API. Uses prompt engineering pipelines and semantic text chunking for context retrieval.',
    stack: ['JavaScript', 'React', 'Node.js', 'AI API', 'Tailwind CSS', 'Express'],
    github: 'https://github.com/Vaishnav0299/my-study-assistant',
    live: 'https://my-study-assistant-ten.vercel.app',
    stars: 18,
    status: 'Active Development',
    sortOrder: 3,
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
      'Drag-and-drop image import with instant preview',
    ],
    architecture: 'Pure TypeScript and HTML5 Canvas API calculations with hardware-accelerated WebGL blur shaders for instant client-side image processing.',
    stack: ['TypeScript', 'HTML5', 'Canvas API', 'CSS3'],
    github: 'https://github.com/Vaishnav0299/Deskify',
    live: 'https://github.com/Vaishnav0299/Deskify',
    stars: 9,
    status: 'Completed',
    sortOrder: 4,
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
      'Live responsive device preview mode (Mobile, Tablet, Desktop)',
    ],
    architecture: 'React state machine with drag-and-drop event handlers, serializing form definitions into compliant JSON Schema models.',
    stack: ['TypeScript', 'React', 'Tailwind CSS', 'JSON Schema'],
    github: 'https://github.com/Vaishnav0299/Form-Builder',
    live: 'https://github.com/Vaishnav0299/Form-Builder',
    stars: 7,
    status: 'Completed',
    sortOrder: 5,
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
      'Comprehensive RESTful endpoint suite with Swagger documentation',
    ],
    architecture: 'Node.js Express application structured with Controller-Service-Repository pattern, input validation middleware, and automated error handling.',
    stack: ['JavaScript', 'Node.js', 'Express', 'REST API', 'PostgreSQL'],
    github: 'https://github.com/Vaishnav0299/mentor-backend',
    live: 'https://github.com/Vaishnav0299/mentor-backend',
    stars: 11,
    status: 'Maintained',
    sortOrder: 6,
  },
];

const skillsSeed = [
  {
    category: 'Frontend Architecture',
    icon: 'Layout',
    items: [
      { name: 'React.js / Next.js', val: '95%' },
      { name: 'TypeScript / JavaScript', val: '92%' },
      { name: 'Tailwind CSS / HTML5 / CSS3', val: '95%' },
    ],
    sortOrder: 1,
  },
  {
    category: 'Backend & Cloud APIs',
    icon: 'Server',
    items: [
      { name: 'Node.js / Express / Hono', val: '90%' },
      { name: 'Python / FastAPI', val: '92%' },
      { name: 'RESTful & GraphQL APIs', val: '88%' },
    ],
    sortOrder: 2,
  },
  {
    category: 'Databases & Infrastructure',
    icon: 'Database',
    items: [
      { name: 'PostgreSQL / MongoDB', val: '88%' },
      { name: 'Vector DBs (ChromaDB / Redis)', val: '85%' },
      { name: 'Docker / CI/CD Actions / AWS', val: '82%' },
    ],
    sortOrder: 3,
  },
  {
    category: 'AI, ML & Data Science',
    icon: 'Cpu',
    items: [
      { name: 'LangChain / Ollama Multi-Agent', val: '90%' },
      { name: 'Scikit-Learn / TensorFlow', val: '86%' },
      { name: 'Pandas / NumPy / Jupyter EDA', val: '92%' },
    ],
    sortOrder: 4,
  },
];

const timelineSeed = [
  {
    time: '2026',
    title: 'Full-Stack Developer & AI Systems Engineer',
    inst: 'Lift LLP & Open Source',
    desc: 'Architecting full-stack web applications, microservices pipelines, specialized workflow routines for startup deployment, and implementing predictive semantic caching configurations.',
    sortOrder: 1,
  },
  {
    time: '2025',
    title: 'AI, Machine Learning & Advanced Data Structures',
    inst: 'Independent Engineering & Projects',
    desc: 'Focused on agentic AI frameworks (LangChain, Ollama), vector databases (ChromaDB), and algorithmic optimization to build intelligent assistants and predictive analytics applications.',
    sortOrder: 2,
  },
  {
    time: '2024',
    title: 'Full-Stack Web Foundations',
    inst: 'Undergraduate Engineering',
    desc: 'Mastered core full-stack engineering principles with React, Node.js, Express, PostgreSQL, and MongoDB. Built responsive interfaces and REST APIs.',
    sortOrder: 3,
  },
  {
    time: '2023',
    title: 'Programming & Data Science Foundations',
    inst: 'Academic Journey',
    desc: 'Started deep dive into Python, C/C++, core algorithms, data structures, and statistical data analysis.',
    sortOrder: 4,
  },
];

const bioSeed = {
  name:         'Vaishnav Gaware',
  title:        'Full-Stack Developer and AI & Data Science Student',
  education:    'B.E. Artificial Intelligence & Data Science',
  location:     'Pune, India',
  email:        'vaishnavgaware1@gmail.com',
  github:       'https://github.com/Vaishnav0299',
  linkedin:     'https://www.linkedin.com/in/vaishnav-gaware-107799315/',
  resumeUrl:    'https://github.com/Vaishnav0299',
  avatarUrl:    'https://avatars.githubusercontent.com/u/166599134?v=4',
  bio:          'Full-Stack Developer and AI & Data Science undergraduate building production-grade web applications, ML-driven systems, and data pipelines. Comfortable across the stack — React, Next.js, and Node.js on the JavaScript/TypeScript side, Python for data science, machine learning, and AI tooling.',
  interests:    [
    'Full-Stack Web Development — React, Next.js, Node.js',
    'Artificial Intelligence & Agentic AI Workflows',
    'Data Science, Machine Learning & Predictive Analytics',
    'Open-Source Software & Developer Utilities',
  ],
  currentFocus: 'Deepening expertise in Linux system administration and server management, and building automated, scalable deployment pipelines with Docker, Kubernetes, and CI/CD.',
};

async function seed() {
  console.log('🌱 Creating database tables if needed...\n');

  try {
    // Ensure all tables exist before seeding
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
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        icon TEXT NOT NULL,
        items JSONB NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS timeline (
        id SERIAL PRIMARY KEY,
        time TEXT NOT NULL,
        title TEXT NOT NULL,
        inst TEXT NOT NULL,
        "desc" TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
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
        resume_url TEXT NOT NULL,
        avatar_url TEXT NOT NULL,
        bio TEXT NOT NULL,
        interests JSONB NOT NULL,
        current_focus TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sync_log (
        operation_id UUID PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT NOW(),
        url TEXT NOT NULL,
        method TEXT NOT NULL
      );
    `);

    console.log('  ✓ Schema created/verified');

    // Seed projects (skip if already seeded)
    console.log('📦 Seeding projects...');
    await db.insert(projects).values(projectsSeed).onConflictDoNothing();
    console.log(`  ✓ ${projectsSeed.length} projects seeded`);

    // Seed skills
    console.log('🛠️  Seeding skills...');
    await db.insert(skills).values(skillsSeed).onConflictDoNothing();
    console.log(`  ✓ ${skillsSeed.length} skill categories seeded`);

    // Seed timeline
    console.log('⏳ Seeding timeline...');
    await db.insert(timeline).values(timelineSeed).onConflictDoNothing();
    console.log(`  ✓ ${timelineSeed.length} timeline entries seeded`);

    // Seed bio (single row — truncate and re-insert for idempotency)
    console.log('👤 Seeding bio...');
    await db.execute(sql`TRUNCATE TABLE bio RESTART IDENTITY`);
    await db.insert(bio).values(bioSeed);
    console.log('  ✓ Bio seeded');

    console.log('\n✅ Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
