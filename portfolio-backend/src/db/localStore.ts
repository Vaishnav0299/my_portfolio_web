import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  config({ path: path.resolve(__dirname, '../../../.env') });
  config({ path: path.resolve(__dirname, '../../.env') });
  config({ path: path.resolve(__dirname, '../.env') });
} catch {
  // Ignore in bundled environments
}

export const isDbConfigured = Boolean(
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes('placeholder') &&
  process.env.DATABASE_URL.trim() !== ''
);

export interface LocalProject {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  type: string;
  badgeClass: string;
  desc: string;
  longDesc: string;
  features: string[];
  architecture: string;
  stack: string[];
  github: string;
  live: string;
  stars: number;
  status: string;
  sortOrder: number;
  tagline?: string;
  problem?: string;
  solution?: string;
  metrics?: Array<{ label: string; value: string }>;
  mockup?: 'dashboard' | 'chat' | 'editor' | 'ledger';
  role?: string;
  period?: string;
  highlights?: string[];
  challenges?: string;
  accent?: 'violet' | 'emerald' | 'amber';
  emoji?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocalSkill {
  id: number;
  category: string;
  icon: string;
  items: Array<{ name: string; val: string; level?: number }>;
  sortOrder: number;
  updatedAt?: string;
}

export interface LocalTimeline {
  id: number;
  time: string;
  title: string;
  inst: string;
  desc: string;
  type?: 'work' | 'education';
  location?: string;
  achievements?: string[];
  stack?: string[];
  sortOrder: number;
  updatedAt?: string;
}

export interface LocalService {
  id: number;
  title: string;
  description: string;
  bullets: string[];
  accent: 'violet' | 'emerald' | 'amber';
  icon: string;
  sortOrder: number;
}

export interface LocalTestimonial {
  id: number;
  quote: string;
  name: string;
  author?: string;
  title: string;
  role?: string;
  company: string;
  avatarInitials: string;
  avatar?: string;
  accent: 'violet' | 'emerald' | 'amber';
  rating: number;
  sortOrder: number;
}

export interface LocalBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  accent: 'violet' | 'emerald' | 'amber';
  body: any[];
  sortOrder: number;
}

export const initialProjects: LocalProject[] = [
  {
    "id": 1,
    "name": "Sales Analytics & Customer Churn Prediction",
    "category": "data-analytics",
    "categoryName": "Data Analytics & ML",
    "type": "Data Analytics & ML",
    "badgeClass": "data",
    "desc": "An end-to-end data analytics & ML project: exploratory sales analysis, KPI/cohort reporting, and a customer churn prediction model with an interactive Streamlit app.",
    "longDesc": "Sales Analytics & Customer Churn Prediction delivers comprehensive exploratory data analysis (EDA), customer RFM & cohort retention metrics, feature engineering, and a Scikit-Learn machine learning pipeline to predict customer churn probability with real-time Streamlit UI inference.",
    "features": [
      "Exploratory Data Analysis (EDA) & sales KPI cohort retention breakdown",
      "Customer Churn Prediction Machine Learning model (Scikit-Learn pipeline)",
      "Interactive Streamlit web application for live model inference",
      "Exported executive report and reproducible Jupyter Notebook pipeline"
    ],
    "architecture": "Python analytical pipeline using Pandas, NumPy, Scikit-Learn, and Seaborn for EDA & ML modeling. Interactive inference UI served via Streamlit.",
    "stack": [
      "Python",
      "Scikit-Learn",
      "Pandas",
      "Streamlit",
      "Jupyter",
      "Seaborn"
    ],
    "github": "https://github.com/Vaishnav0299/Sales-Analytics-Customer-Churn-Prediction",
    "live": "",
    "stars": 0,
    "status": "Completed",
    "sortOrder": 1,
    "tagline": "End-to-end sales cohort analytics & churn prediction ML pipeline.",
    "problem": "Businesses struggle to detect churn signals early and identify high-risk customer cohorts before revenue loss occurs.",
    "solution": "Engineered an end-to-end RFM cohort pipeline and predictive Scikit-Learn classifier with interactive Streamlit exploration.",
    "metrics": [
      {
        "label": "Model Accuracy",
        "value": "89%"
      },
      {
        "label": "Inference Latency",
        "value": "<250ms"
      },
      {
        "label": "Cohorts Analyzed",
        "value": "12 Quarters"
      }
    ],
    "mockup": "dashboard",
    "role": "Data Scientist & ML Engineer",
    "period": "2024 — 2025",
    "highlights": [
      "Trained high-accuracy customer churn classification pipeline",
      "Deployed interactive Streamlit dashboard for real-time model inference",
      "Generated comprehensive cohort retention matrices and RFM segmentation"
    ],
    "challenges": "High class imbalance in customer churn labels was resolved by tuning loss class weights and applying SMOTE sampling to avoid false negatives.",
    "accent": "violet",
    "createdAt": "2026-09-19T06:21:22.336Z",
    "updatedAt": "2026-09-19T06:21:22.336Z"
  },
  {
    "id": 2,
    "name": "Productivity-Pro",
    "category": "fullstack",
    "categoryName": "Full-Stack Workspace",
    "type": "Full Stack Workspace",
    "badgeClass": "fullstack",
    "desc": "Enterprise collaborative workspace integrating kanban boards, live document synchronization, drag-and-drop workflows, and admin audit panels.",
    "longDesc": "Productivity-Pro is designed for engineering teams requiring sub-millisecond collaboration, live document synchronization, drag-and-drop workflow automation, and structured task management.",
    "features": [
      "Real-time document editing and collaborative presence indicators",
      "Custom Kanban task board with automated workflow triggers",
      "Granular role-based access control (RBAC) & admin audit logging",
      "Dark / light mode theme customization with responsive UI layout"
    ],
    "architecture": "Client built with React & Next.js using TypeScript. State managed via optimistic updates and WebSockets for low-latency multi-user sync. Styled with CSS modules and Tailwind CSS.",
    "stack": [
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Node.js",
      "WebSockets"
    ],
    "github": "https://github.com/Vaishnav0299/Productivity-Pro",
    "live": "",
    "stars": 0,
    "status": "Production Ready",
    "sortOrder": 2,
    "tagline": "Collaborative real-time engineering workspace.",
    "problem": "Distributed engineering teams struggled with fragmented tools for docs, tasks, and audit compliance.",
    "solution": "Unified workspaces, real-time board updates, document collaboration, and granular role-based access control.",
    "metrics": [
      {
        "label": "Live Sync",
        "value": "<50ms"
      },
      {
        "label": "Uptime",
        "value": "99.9%"
      },
      {
        "label": "RBAC Tiers",
        "value": "5 Roles"
      }
    ],
    "mockup": "editor",
    "role": "Full-Stack Developer",
    "period": "2024",
    "highlights": [
      "Built WebSocket synchronization engine for collaborative editing",
      "Designed drag-and-drop Kanban workflow with automated task state machines",
      "Implemented full responsive dark/light UI with zero layout shifts"
    ],
    "challenges": "Handling concurrent state edits across multiple open tabs was solved using optimistic UI updates coupled with server-ack reconciliation.",
    "accent": "emerald",
    "createdAt": "2026-09-19T06:21:22.336Z",
    "updatedAt": "2026-09-19T06:21:22.336Z"
  },
  {
    "id": 4,
    "name": "My Study Assistant",
    "category": "ai",
    "categoryName": "AI & Automation",
    "type": "AI & Automation",
    "badgeClass": "ai",
    "desc": "Intelligent study platform for note summarization, automated flashcards generation, topic quizzes, and interactive learning workflows.",
    "longDesc": "Leveraging LLM APIs and NLP processing, My Study Assistant transforms raw study materials, lecture slides, and notes into structured study guides, quiz sets, and flashcards instantly.",
    "features": [
      "Automated text summarization & topic keypoint extraction",
      "Instant flashcard deck creation with spaced repetition scheduling",
      "Interactive AI study assistant chatbot trained on user upload context",
      "Export study decks to Anki, JSON, and PDF formats"
    ],
    "architecture": "React interface communicating with an asynchronous Node.js microservice API. Uses prompt engineering pipelines and semantic text chunking for context retrieval.",
    "stack": [
      "JavaScript",
      "React",
      "Node.js",
      "AI API",
      "Tailwind CSS",
      "Express"
    ],
    "github": "https://github.com/Vaishnav0299/my-study-assistant",
    "live": "https://my-study-assistant-ten.vercel.app",
    "stars": 0,
    "status": "Active Development",
    "sortOrder": 4,
    "tagline": "AI-assisted note synthesis and flashcard generation.",
    "problem": "Students spend 70% of study time reformatting lecture slides instead of active recall.",
    "solution": "Automatic lecture chunking, spaced-repetition flashcard creation, and Anki/PDF deck exports.",
    "metrics": [
      {
        "label": "Deck Export",
        "value": "Anki & PDF"
      },
      {
        "label": "Generation Time",
        "value": "<3s"
      },
      {
        "label": "Active Users",
        "value": "250+"
      }
    ],
    "mockup": "chat",
    "role": "AI & Full-Stack Developer",
    "period": "2024 — 2025",
    "highlights": [
      "Implemented token-efficient semantic chunking for large PDF uploads",
      "Created spaced-repetition flashcard engine with direct Anki package export",
      "Integrated conversational assistant grounded on user-supplied course notes"
    ],
    "challenges": "Varying PDF layouts and OCR quirks caused corrupted text inputs; built a normalizer regex cleaner before prompt dispatch.",
    "accent": "amber",
    "createdAt": "2026-09-19T06:21:22.336Z",
    "updatedAt": "2026-09-19T06:21:22.336Z"
  },
  {
    "id": 5,
    "name": "Deskify",
    "category": "fullstack",
    "categoryName": "Web Utility",
    "type": "Web Utility",
    "badgeClass": "fullstack",
    "desc": "A lightweight, 100% client-side web utility to instantly convert vertical mobile wallpapers into widescreen desktop backgrounds. Zero backend, zero tracking, pure JavaScript.",
    "longDesc": "Deskify utilizes HTML5 Canvas rendering routines to intelligently extend mobile wallpaper aspect ratios into crisp widescreen desktop wallpapers with custom blur margins and color sampling.",
    "features": [
      "100% Client-side processing with zero server uploads or latency",
      "Intelligent edge-blur and color sampling background generation",
      "High-DPI resolution rendering up to 4K desktop canvas output",
      "Drag-and-drop image import with instant preview"
    ],
    "architecture": "Pure TypeScript and HTML5 Canvas API calculations with hardware-accelerated WebGL blur shaders for instant client-side image processing.",
    "stack": [
      "TypeScript",
      "HTML5",
      "Canvas API",
      "CSS3"
    ],
    "github": "https://github.com/Vaishnav0299/Deskify",
    "live": "",
    "stars": 0,
    "status": "Completed",
    "sortOrder": 5,
    "tagline": "Instant wallpaper aspect-ratio conversion in browser.",
    "problem": "Mobile wallpapers look stretched or letterboxed when set on widescreen monitors.",
    "solution": "Client-side canvas blur shaders extend edges dynamically up to 4K resolution with zero server uploads.",
    "metrics": [
      {
        "label": "Server Cost",
        "value": "$0 / mo"
      },
      {
        "label": "Max Export",
        "value": "4K Ultra-HD"
      },
      {
        "label": "Privacy",
        "value": "100% Local"
      }
    ],
    "mockup": "ledger",
    "role": "Frontend & Utility Developer",
    "period": "2024",
    "highlights": [
      "Engineered zero-latency client-side Canvas rendering algorithms",
      "Delivered 4K wallpaper export capabilities without server dependency",
      "Implemented intelligent color sampling for seamless peripheral margins"
    ],
    "challenges": "Exporting 4K canvas on low-memory mobile browsers caused crashes; solved by implementing tiled canvas rendering in an offscreen canvas.",
    "accent": "violet",
    "createdAt": "2026-09-19T06:21:22.336Z",
    "updatedAt": "2026-09-19T06:21:22.336Z"
  },
  {
    "id": 6,
    "name": "Form-Builder",
    "category": "fullstack",
    "categoryName": "Full-Stack Tool",
    "type": "Full Stack Tool",
    "badgeClass": "fullstack",
    "desc": "Dynamic drag-and-drop form creation engine featuring customizable field validation, interactive preview controls, and JSON schema export.",
    "longDesc": "Form-Builder allows developers and non-technical teams to compose complex multi-step forms using an intuitive drag-and-drop interface, complete with custom Regex validation and schema generation.",
    "features": [
      "Drag-and-drop canvas with custom input, selection, and radio components",
      "Real-time JSON schema generation and export",
      "Custom field validation builder (Regex, Min/Max length, required fields)",
      "Live responsive device preview mode (Mobile, Tablet, Desktop)"
    ],
    "architecture": "React state machine with drag-and-drop event handlers, serializing form definitions into compliant JSON Schema models.",
    "stack": [
      "TypeScript",
      "React",
      "Tailwind CSS",
      "JSON Schema"
    ],
    "github": "https://github.com/Vaishnav0299/Form-Builder",
    "live": "",
    "stars": 0,
    "status": "Completed",
    "sortOrder": 6,
    "tagline": "Drag-and-drop form composer with JSON Schema generation.",
    "problem": "Building custom forms with validation from scratch takes repetitive boilerplate time.",
    "solution": "Visual drag-and-drop canvas generating strict, reusable JSON Schema and real-time validation rules.",
    "metrics": [
      {
        "label": "Schema Standard",
        "value": "JSON Schema v7"
      },
      {
        "label": "Component Types",
        "value": "12+ Inputs"
      },
      {
        "label": "Export Formats",
        "value": "JSON & Code"
      }
    ],
    "mockup": "editor",
    "role": "Frontend Architect",
    "period": "2024",
    "highlights": [
      "Architected flexible drag-and-drop canvas state machine",
      "Created dynamic JSON Schema compiler with custom regex validators",
      "Built multi-device live preview viewport with simulated screen dimensions"
    ],
    "challenges": "Nested form groupings caused recursive validation loop traps; solved using acyclic directed tree traversal for schema validation.",
    "accent": "emerald",
    "createdAt": "2026-09-19T06:21:22.336Z",
    "updatedAt": "2026-09-19T06:21:22.336Z"
  },
  {
    "id": 7,
    "name": "Mentor Backend Service",
    "category": "fullstack",
    "categoryName": "Backend API",
    "type": "Backend API",
    "badgeClass": "fullstack",
    "desc": "Scalable Node.js REST API service providing mentorship matching workflows, session scheduling, authentication, and database persistence.",
    "longDesc": "A modular microservice architecture providing secure JWT authentication, session booking algorithms, availability slot management, and user relationship mapping.",
    "features": [
      "Secure JWT token authentication & refresh token rotation",
      "Automated mentorship availability slot booking algorithms",
      "PostgreSQL / MongoDB schema design with data indexing",
      "Comprehensive RESTful endpoint suite with Swagger documentation"
    ],
    "architecture": "Node.js Express application structured with Controller-Service-Repository pattern, input validation middleware, and automated error handling.",
    "stack": [
      "JavaScript",
      "Node.js",
      "Express",
      "REST API",
      "PostgreSQL"
    ],
    "github": "https://github.com/Vaishnav0299/mentor-backend",
    "live": "",
    "stars": 0,
    "status": "Maintained",
    "sortOrder": 7,
    "tagline": "High-throughput mentorship scheduling & matching API.",
    "problem": "Scheduling 1-on-1 mentorship sessions across timezones suffers from double-booking and disjointed auth.",
    "solution": "Atomic slot reservation algorithms, JWT rotation, and timezone-aware schedule queries.",
    "metrics": [
      {
        "label": "API Uptime",
        "value": "99.9%"
      },
      {
        "label": "P95 Latency",
        "value": "45ms"
      },
      {
        "label": "Test Coverage",
        "value": "92%"
      }
    ],
    "mockup": "dashboard",
    "role": "Backend Engineer",
    "period": "2023 — 2024",
    "highlights": [
      "Designed ACID-compliant slot booking with PostgreSQL transactional locks",
      "Implemented secure JWT auth with rotating refresh tokens",
      "Wrote comprehensive integration test suites and automated OpenAPI documentation"
    ],
    "challenges": "Race conditions during simultaneous booking of the same slot were eliminated by applying row-level advisory locks during transaction execution.",
    "accent": "amber",
    "createdAt": "2026-09-19T06:21:22.336Z",
    "updatedAt": "2026-09-19T06:21:22.336Z"
  }
];

export const initialSkills: LocalSkill[] = [
  {
    "id": 1,
    "category": "Frontend Architecture",
    "icon": "Layout",
    "items": [
      {
        "name": "React.js / Next.js",
        "val": "95%",
        "level": 95
      },
      {
        "name": "TypeScript / JavaScript",
        "val": "92%",
        "level": 92
      },
      {
        "name": "Tailwind CSS / HTML5 / CSS3",
        "val": "95%",
        "level": 95
      }
    ],
    "sortOrder": 1,
    "updatedAt": "2026-09-19T06:21:23.093Z"
  },
  {
    "id": 2,
    "category": "Backend & Cloud APIs",
    "icon": "Server",
    "items": [
      {
        "name": "Node.js / Express / Hono",
        "val": "90%",
        "level": 90
      },
      {
        "name": "Python / FastAPI",
        "val": "92%",
        "level": 92
      },
      {
        "name": "RESTful & GraphQL APIs",
        "val": "88%",
        "level": 88
      }
    ],
    "sortOrder": 2,
    "updatedAt": "2026-09-19T06:21:23.093Z"
  },
  {
    "id": 3,
    "category": "Databases & Infrastructure",
    "icon": "Database",
    "items": [
      {
        "name": "PostgreSQL / MongoDB",
        "val": "88%",
        "level": 88
      },
      {
        "name": "Vector DBs (ChromaDB / Redis)",
        "val": "85%",
        "level": 85
      },
      {
        "name": "Docker / CI/CD Actions / AWS",
        "val": "82%",
        "level": 82
      }
    ],
    "sortOrder": 3,
    "updatedAt": "2026-09-19T06:21:23.093Z"
  },
  {
    "id": 4,
    "category": "AI, ML & Data Science",
    "icon": "Cpu",
    "items": [
      {
        "name": "LangChain / Ollama Multi-Agent",
        "val": "90%",
        "level": 90
      },
      {
        "name": "Scikit-Learn / TensorFlow",
        "val": "86%",
        "level": 86
      },
      {
        "name": "Pandas / NumPy / Jupyter EDA",
        "val": "92%",
        "level": 92
      }
    ],
    "sortOrder": 4,
    "updatedAt": "2026-09-19T06:21:23.093Z"
  }
];

export const initialTimeline: LocalTimeline[] = [
  {
    "id": 1,
    "time": "2026",
    "title": "Full-Stack Developer & AI Systems Engineer",
    "inst": "Lift LLP & Open Source",
    "desc": "Architecting full-stack web applications, microservices pipelines, specialized workflow routines for startup deployment, and implementing predictive semantic caching configurations.",
    "type": "work",
    "location": "Pune, India",
    "achievements": [
      "Architecting full-stack web applications & microservices pipelines",
      "Implementing predictive semantic caching and vector database retrieval",
      "Contributing to open-source developer tooling and automation workflows"
    ],
    "stack": [
      "Next.js",
      "React",
      "Node.js",
      "Python",
      "Docker"
    ],
    "sortOrder": 1,
    "updatedAt": "2026-09-19T06:21:23.844Z"
  },
  {
    "id": 2,
    "time": "2025",
    "title": "AI, Machine Learning & Advanced Data Structures",
    "inst": "Independent Engineering & Projects",
    "desc": "Focused on agentic AI frameworks (LangChain, Ollama), vector databases (ChromaDB), and algorithmic optimization to build intelligent assistants and predictive analytics applications.",
    "type": "work",
    "location": "Pune, India",
    "achievements": [
      "Built multi-agent AI assistants using LangChain and local Ollama models",
      "Implemented vector search systems with ChromaDB and pgvector",
      "Engineered data analytics and predictive ML pipelines with Scikit-Learn"
    ],
    "stack": [
      "Python",
      "LangChain",
      "Ollama",
      "Scikit-Learn",
      "ChromaDB"
    ],
    "sortOrder": 2,
    "updatedAt": "2026-09-19T06:21:23.844Z"
  },
  {
    "id": 3,
    "time": "2024",
    "title": "Full-Stack Web Foundations",
    "inst": "Undergraduate Engineering",
    "desc": "Mastered core full-stack engineering principles with React, Node.js, Express, PostgreSQL, and MongoDB. Built responsive interfaces and REST APIs.",
    "type": "education",
    "location": "Pune, India",
    "achievements": [
      "Built and deployed 5+ full-stack web applications with React and Node.js",
      "Designed relational database schemas in PostgreSQL and document stores in MongoDB",
      "Constructed RESTful API microservices with JWT authentication"
    ],
    "stack": [
      "React",
      "Node.js",
      "Express",
      "PostgreSQL",
      "MongoDB"
    ],
    "sortOrder": 3,
    "updatedAt": "2026-09-19T06:21:23.844Z"
  },
  {
    "id": 4,
    "time": "2023",
    "title": "Programming & Data Science Foundations",
    "inst": "Academic Journey",
    "desc": "Started deep dive into Python, C/C++, core algorithms, data structures, and statistical data analysis.",
    "type": "education",
    "location": "Pune, India",
    "achievements": [
      "Deep-dive into Python, C/C++, core algorithms, and algorithmic complexity",
      "Exploratory data analysis and statistics with NumPy, Pandas, and Matplotlib",
      "Foundation in discrete math and computational systems"
    ],
    "stack": [
      "Python",
      "C/C++",
      "Pandas",
      "NumPy",
      "Data Structures"
    ],
    "sortOrder": 4,
    "updatedAt": "2026-09-19T06:21:23.844Z"
  }
];

export const initialServices: LocalService[] = [];

export const initialTestimonials: LocalTestimonial[] = [];

export const initialBlog: LocalBlogPost[] = [];

export const initialBio = {
  "id": 1,
  "name": "Vaishnav Gaware",
  "title": "Full-Stack Developer and AI & Data Science Student",
  "education": "B.E. Artificial Intelligence & Data Science",
  "location": "Pune, India",
  "email": "vaishnavgaware1@gmail.com",
  "github": "https://github.com/Vaishnav0299",
  "linkedin": "https://www.linkedin.com/in/vaishnav-gaware-107799315/",
  "twitter": "https://twitter.com/vaishnav0299",
  "website": "https://github.com/Vaishnav0299",
  "resumeUrl": "https://github.com/Vaishnav0299",
  "avatarUrl": "https://avatars.githubusercontent.com/u/166599134?v=4",
  "bio": "Full-Stack Developer and AI & Data Science undergraduate building production-grade web applications, ML-driven systems, and data pipelines. Comfortable across the stack — React, Next.js, and Node.js on the JavaScript/TypeScript side, Python for data science, machine learning, and AI tooling.",
  "interests": [
    "Full-Stack Web Development — React, Next.js, Node.js",
    "Artificial Intelligence & Agentic AI Workflows",
    "Data Science, Machine Learning & Predictive Analytics",
    "Open-Source Software & Developer Utilities"
  ],
  "currentFocus": "Deepening expertise in Linux system administration and server management, and building automated, scalable deployment pipelines with Docker, Kubernetes, and CI/CD.",
  "headlinePrefix": "Crafting Systems & Software",
  "heroDescription": "Full-Stack Developer and AI & Data Science undergraduate building production-grade web applications, ML-driven systems, and data pipelines.",
  "typewriterPhrases": [
    "building scalable full-stack web applications.",
    "training predictive machine learning pipelines.",
    "crafting high-performance modern web interfaces.",
    "orchestrating multi-agent AI workflows.",
    "designing resilient backend API microservices."
  ],
  "footerTagline": "Built with passion & precision.",
  "updatedAt": "2026-09-19T06:21:26.863Z"
};

export const usesData = [
  {
    category: 'Editor & Terminal',
    items: [
      { name: 'VS Code', note: 'Primary editor with Vim keybindings' },
      { name: 'JetBrains Mono', note: 'Font for code & terminal' },
      { name: 'Warp / PowerShell', note: 'Daily terminal setup' },
      { name: 'zsh + starship', note: 'Prompt with git status & Node version' },
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'React / Next.js', note: 'Component architectures & SSR/edge' },
      { name: 'TypeScript', note: 'Strict typing across entire stack' },
      { name: 'Tailwind CSS', note: 'Design tokens via CSS variables' },
      { name: 'Framer Motion', note: 'Micro-interactions & transitions' },
    ],
  },
  {
    category: 'Backend & Data',
    items: [
      { name: 'Node.js + Hono / Express', note: 'REST APIs & WebSocket gateways' },
      { name: 'PostgreSQL & pgvector', note: 'Relational data & vector embeddings' },
      { name: 'Prisma / Drizzle ORM', note: 'Type-safe queries & migrations' },
      { name: 'Redis', note: 'Caching, streaming queues, rate limits' },
    ],
  },
  {
    category: 'Tools & Infrastructure',
    items: [
      { name: 'Git & GitHub', note: 'Trunk-based commits & clean PRs' },
      { name: 'GitHub Actions', note: 'CI/CD lint, test & auto-deploy' },
      { name: 'Docker', note: 'Local container parity with production' },
      { name: 'Vercel', note: 'Edge deployments & preview branches' },
    ],
  },
];

export const nowData = [
  { text: 'Architecting multi-tenant SaaS dashboards handling 4.2M events/day.', tag: 'shipping' },
  { text: 'Going deep on RAG systems — pgvector, re-rankers, and grounded citations.', tag: 'learning' },
  { text: 'Revisiting "Designing Data-Intensive Applications" for distributed patterns.', tag: 'reading' },
  { text: 'Open for Senior Full-Stack roles (remote-first or Pune-based).', tag: 'available' },
  { text: 'Writing technical teardowns on CRDTs, RAG reliability, and PostgreSQL RLS.', tag: 'writing' },
];

export const githubStats = [
  { label: 'Public Repos', value: '10', icon: 'FolderGit2' },
  { label: 'Contributions', value: '947', icon: 'GitCommit' },
];

export interface SiteConfig {
  components: {
    hero: boolean;
    githubStrip: boolean;
    about: boolean;
    experience: boolean;
    projects: boolean;
    services: boolean;
    skills: boolean;
    process: boolean;
    blog: boolean;
    testimonials: boolean;
    now: boolean;
    uses: boolean;
    faq: boolean;
    contact: boolean;
    [key: string]: boolean;
  };
  subcomponents?: {
    [key: string]: boolean;
  };
  effects: {
    cursorSpotlight: boolean;
    scrollProgress: boolean;
    marquee: boolean;
    backgroundGrid: boolean;
    [key: string]: boolean;
  };
  theme: {
    accentColor: string;
    defaultTheme: string;
    openToWorkText: string;
    openToWorkStatus: boolean;
    [key: string]: any;
  };
  updatedAt?: string;
}

export const initialSiteConfig: SiteConfig = {
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
  updatedAt: new Date().toISOString(),
};

export interface LocalFaq {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
}

export const initialFaqs: LocalFaq[] = [];

export interface LocalDocument {
  id: number;
  title: string;
  category: 'resume' | 'certificate' | 'transcript' | 'whitepaper' | 'recommendation' | 'other';
  description?: string;
  sourceType: 'local_upload' | 'gdrive_link' | 'external_url';
  fileUrl: string;
  driveUrl?: string;
  downloadUrl: string;
  previewUrl?: string;
  fileName: string;
  fileSize?: string;
  mimeType?: string;
  isPrimaryResume: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export const initialDocuments: LocalDocument[] = [
  {
    id: 1,
    title: 'Vaishnav Gaware — Full-Stack & AI Engineer Resume',
    category: 'resume',
    description: 'Current technical resume covering full-stack architecture, machine learning systems, and cloud infrastructure.',
    sourceType: 'local_upload',
    fileUrl: '/resume.pdf',
    downloadUrl: '/resume.pdf',
    previewUrl: '/resume.pdf',
    fileName: 'Vaishnav_Gaware_Resume.pdf',
    fileSize: '180 KB',
    mimeType: 'application/pdf',
    isPrimaryResume: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// In-Memory store instances for local development & fallback
class LocalStore {
  projects: LocalProject[] = [...initialProjects];
  skills: LocalSkill[] = [...initialSkills];
  timeline: LocalTimeline[] = [...initialTimeline];
  services: LocalService[] = [...initialServices];
  testimonials: LocalTestimonial[] = [...initialTestimonials];
  blog: LocalBlogPost[] = [...initialBlog];
  bio = { ...initialBio };
  uses = [...usesData];
  now = [...nowData];
  faqs: LocalFaq[] = [...initialFaqs];
  documents: LocalDocument[] = [...initialDocuments];
  siteConfig: SiteConfig = { ...initialSiteConfig };
  githubStats = [...githubStats];
  messages: Array<{ id: number; name: string; email: string; message: string; role?: string; createdAt: string }> = [];
  syncLog = new Set<string>();

  nextProjectId = 100;
  nextSkillId = 100;
  nextTimelineId = 100;
  nextServiceId = 100;
  nextTestimonialId = 100;
  nextBlogId = 100;
  nextFaqId = 100;
  nextNowId = 100;
  nextDocumentId = 100;
  nextMessageId = 1;
}

export const localStore = new LocalStore();

