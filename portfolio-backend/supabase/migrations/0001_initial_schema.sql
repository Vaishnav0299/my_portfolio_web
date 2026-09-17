-- ============================================================================
-- Supabase Initial Schema & Migration for Vaishnav Gaware Portfolio CMS
-- ============================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_name TEXT NOT NULL,
  type TEXT NOT NULL,
  badge_class TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  long_desc TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  architecture TEXT NOT NULL,
  stack JSONB NOT NULL DEFAULT '[]'::jsonb,
  github TEXT NOT NULL,
  live TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timeline (
  id SERIAL PRIMARY KEY,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  inst TEXT NOT NULL,
  "desc" TEXT NOT NULL,
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
  resume_url TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  bio TEXT NOT NULL,
  interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_focus TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_log (
  operation_id UUID PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  url TEXT NOT NULL,
  method TEXT NOT NULL
);

-- 2. Grants for Supabase Roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE bio ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Public read projects" ON projects;
CREATE POLICY "Public read projects" ON projects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read skills" ON skills;
CREATE POLICY "Public read skills" ON skills FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read timeline" ON timeline;
CREATE POLICY "Public read timeline" ON timeline FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read bio" ON bio;
CREATE POLICY "Public read bio" ON bio FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public insert messages" ON messages;
CREATE POLICY "Public insert messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 5. Seed Initial Data
INSERT INTO projects (name, category, category_name, type, badge_class, "desc", long_desc, features, architecture, stack, github, live, stars, status, sort_order)
VALUES
(
  'Sales Analytics & Customer Churn Prediction',
  'data-analytics',
  'Data Analytics & ML',
  'Data Analytics & ML',
  'data',
  'An end-to-end data analytics & ML project: exploratory sales analysis, KPI/cohort reporting, and a customer churn prediction model with an interactive Streamlit app.',
  'Sales Analytics & Customer Churn Prediction delivers comprehensive exploratory data analysis (EDA), customer RFM & cohort retention metrics, feature engineering, and a Scikit-Learn machine learning pipeline to predict customer churn probability with real-time Streamlit UI inference.',
  '["Exploratory Data Analysis (EDA) & sales KPI cohort retention breakdown", "Customer Churn Prediction Machine Learning model (Scikit-Learn pipeline)", "Interactive Streamlit web application for live model inference", "Exported executive report and reproducible Jupyter Notebook pipeline"]'::jsonb,
  'Python analytical pipeline using Pandas, NumPy, Scikit-Learn, and Seaborn for EDA & ML modeling. Interactive inference UI served via Streamlit.',
  '["Python", "Scikit-Learn", "Pandas", "Streamlit", "Jupyter", "Seaborn"]'::jsonb,
  'https://github.com/Vaishnav0299/Sales-Analytics-Customer-Churn-Prediction',
  'https://github.com/Vaishnav0299/Sales-Analytics-Customer-Churn-Prediction',
  1,
  'Completed',
  1
),
(
  'Productivity-Pro',
  'fullstack',
  'Full-Stack Workspace',
  'Full Stack Workspace',
  'fullstack',
  'Enterprise-ready collaborative real-time workspace application integrating workspaces, kanban boards, collaborative documents, presence indicators, and administrative audit panels.',
  'Productivity-Pro is designed for engineering teams requiring sub-millisecond collaboration, live document synchronization, drag-and-drop workflow automation, and structured task management.',
  '["Real-time document editing and collaborative presence indicators", "Custom Kanban task board with automated workflow triggers", "Granular role-based access control (RBAC) & admin audit logging", "Dark / light mode theme customization with responsive UI layout"]'::jsonb,
  'Client built with React & Next.js using TypeScript. State managed via optimistic updates and WebSockets for low-latency multi-user sync. Styled with CSS modules and Tailwind CSS.',
  '["TypeScript", "React", "Next.js", "Tailwind CSS", "Node.js", "WebSockets"]'::jsonb,
  'https://github.com/Vaishnav0299/Productivity-Pro',
  'https://productivity-pro-bay.vercel.app',
  12,
  'Production Ready',
  2
),
(
  'My Study Assistant',
  'ai',
  'AI & Automation',
  'AI & Automation',
  'ai',
  'An intelligent study platform designed for note organization, automated flashcards generation, topic summaries, and interactive learning workflows.',
  'Leveraging LLM APIs and NLP processing, My Study Assistant transforms raw study materials, lecture slides, and notes into structured study guides, quiz sets, and flashcards instantly.',
  '["Automated text summarization & topic keypoint extraction", "Instant flashcard deck creation with spaced repetition scheduling", "Interactive AI study assistant chatbot trained on user upload context", "Export study decks to Anki, JSON, and PDF formats"]'::jsonb,
  'React interface communicating with an asynchronous Node.js microservice API. Uses prompt engineering pipelines and semantic text chunking for context retrieval.',
  '["JavaScript", "React", "Node.js", "AI API", "Tailwind CSS", "Express"]'::jsonb,
  'https://github.com/Vaishnav0299/my-study-assistant',
  'https://my-study-assistant-ten.vercel.app',
  18,
  'Active Development',
  3
),
(
  'Deskify',
  'fullstack',
  'Web Utility',
  'Web Utility',
  'fullstack',
  'A lightweight, 100% client-side web utility to instantly convert vertical mobile wallpapers into widescreen desktop backgrounds. Zero backend, zero tracking, pure JavaScript.',
  'Deskify utilizes HTML5 Canvas rendering routines to intelligently extend mobile wallpaper aspect ratios into crisp widescreen desktop wallpapers with custom blur margins and color sampling.',
  '["100% Client-side processing with zero server uploads or latency", "Intelligent edge-blur and color sampling background generation", "High-DPI resolution rendering up to 4K desktop canvas output", "Drag-and-drop image import with instant preview"]'::jsonb,
  'Pure TypeScript and HTML5 Canvas API calculations with hardware-accelerated WebGL blur shaders for instant client-side image processing.',
  '["TypeScript", "HTML5", "Canvas API", "CSS3"]'::jsonb,
  'https://github.com/Vaishnav0299/Deskify',
  'https://github.com/Vaishnav0299/Deskify',
  9,
  'Completed',
  4
),
(
  'Form-Builder',
  'fullstack',
  'Full-Stack Tool',
  'Full Stack Tool',
  'fullstack',
  'Dynamic drag-and-drop form creation engine featuring customizable field validation, interactive preview controls, and JSON schema export.',
  'Form-Builder allows developers and non-technical teams to compose complex multi-step forms using an intuitive drag-and-drop interface, complete with custom Regex validation and schema generation.',
  '["Drag-and-drop canvas with custom input, selection, and radio components", "Real-time JSON schema generation and export", "Custom field validation builder (Regex, Min/Max length, required fields)", "Live responsive device preview mode (Mobile, Tablet, Desktop)"]'::jsonb,
  'React state machine with drag-and-drop event handlers, serializing form definitions into compliant JSON Schema models.',
  '["TypeScript", "React", "Tailwind CSS", "JSON Schema"]'::jsonb,
  'https://github.com/Vaishnav0299/Form-Builder',
  'https://github.com/Vaishnav0299/Form-Builder',
  7,
  'Completed',
  5
),
(
  'Mentor Backend Service',
  'fullstack',
  'Backend API',
  'Backend API',
  'fullstack',
  'Scalable Node.js REST API service providing mentorship matching workflows, session scheduling, authentication, and database persistence.',
  'A modular microservice architecture providing secure JWT authentication, session booking algorithms, availability slot management, and user relationship mapping.',
  '["Secure JWT token authentication & refresh token rotation", "Automated mentorship availability slot booking algorithms", "PostgreSQL / MongoDB schema design with data indexing", "Comprehensive RESTful endpoint suite with Swagger documentation"]'::jsonb,
  'Node.js Express application structured with Controller-Service-Repository pattern, input validation middleware, and automated error handling.',
  '["JavaScript", "Node.js", "Express", "REST API", "PostgreSQL"]'::jsonb,
  'https://github.com/Vaishnav0299/mentor-backend',
  'https://github.com/Vaishnav0299/mentor-backend',
  11,
  'Maintained',
  6
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (category, icon, items, sort_order)
VALUES
(
  'Frontend Architecture',
  'Layout',
  '[{"name": "React.js / Next.js", "val": "95%"}, {"name": "TypeScript / JavaScript", "val": "92%"}, {"name": "Tailwind CSS / HTML5 / CSS3", "val": "95%"}]'::jsonb,
  1
),
(
  'Backend & Cloud APIs',
  'Server',
  '[{"name": "Node.js / Express / Hono", "val": "90%"}, {"name": "Python / FastAPI", "val": "92%"}, {"name": "RESTful & GraphQL APIs", "val": "88%"}]'::jsonb,
  2
),
(
  'Databases & Infrastructure',
  'Database',
  '[{"name": "PostgreSQL / MongoDB", "val": "88%"}, {"name": "Vector DBs (ChromaDB / Redis)", "val": "85%"}, {"name": "Docker / CI/CD Actions / AWS", "val": "82%"}]'::jsonb,
  3
),
(
  'AI, ML & Data Science',
  'Cpu',
  '[{"name": "LangChain / Ollama Multi-Agent", "val": "90%"}, {"name": "Scikit-Learn / TensorFlow", "val": "86%"}, {"name": "Pandas / NumPy / Jupyter EDA", "val": "92%"}]'::jsonb,
  4
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO timeline (time, title, inst, "desc", sort_order)
VALUES
(
  '2026',
  'Full-Stack Developer & AI Systems Engineer',
  'Lift LLP & Open Source',
  'Architecting full-stack web applications, microservices pipelines, specialized workflow routines for startup deployment, and implementing predictive semantic caching configurations.',
  1
),
(
  '2025',
  'AI, Machine Learning & Advanced Data Structures',
  'Independent Engineering & Projects',
  'Focused on agentic AI frameworks (LangChain, Ollama), vector databases (ChromaDB), and algorithmic optimization to build intelligent assistants and predictive analytics applications.',
  2
),
(
  '2024',
  'Full-Stack Web Foundations',
  'Undergraduate Engineering',
  'Mastered core full-stack engineering principles with React, Node.js, Express, PostgreSQL, and MongoDB. Built responsive interfaces and REST APIs.',
  3
),
(
  '2023',
  'Programming & Data Science Foundations',
  'Academic Journey',
  'Started deep dive into Python, C/C++, core algorithms, data structures, and statistical data analysis.',
  4
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO bio (id, name, title, education, location, email, github, linkedin, resume_url, avatar_url, bio, interests, current_focus)
VALUES
(
  1,
  'Vaishnav Gaware',
  'Full-Stack Developer and AI & Data Science Student',
  'B.E. Artificial Intelligence & Data Science',
  'Pune, India',
  'vaishnavgaware1@gmail.com',
  'https://github.com/Vaishnav0299',
  'https://www.linkedin.com/in/vaishnav-gaware-107799315/',
  'https://github.com/Vaishnav0299',
  'https://avatars.githubusercontent.com/u/166599134?v=4',
  'Full-Stack Developer and AI & Data Science undergraduate building production-grade web applications, ML-driven systems, and data pipelines. Comfortable across the stack — React, Next.js, and Node.js on the JavaScript/TypeScript side, Python for data science, machine learning, and AI tooling.',
  '["Full-Stack Web Development — React, Next.js, Node.js", "Artificial Intelligence & Agentic AI Workflows", "Data Science, Machine Learning & Predictive Analytics", "Open-Source Software & Developer Utilities"]'::jsonb,
  'Deepening expertise in Linux system administration and server management, and building automated, scalable deployment pipelines with Docker, Kubernetes, and CI/CD.'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  education = EXCLUDED.education,
  location = EXCLUDED.location,
  email = EXCLUDED.email,
  github = EXCLUDED.github,
  linkedin = EXCLUDED.linkedin,
  resume_url = EXCLUDED.resume_url,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  interests = EXCLUDED.interests,
  current_focus = EXCLUDED.current_focus,
  updated_at = NOW();
