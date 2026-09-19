import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { notFound } from './middleware/errorHandler.js';
import healthRouter   from './routes/health.js';
import authRouter     from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import skillsRouter   from './routes/skills.js';
import timelineRouter from './routes/timeline.js';
import bioRouter      from './routes/bio.js';
import contactRouter      from './routes/contact.js';
import syncRouter         from './routes/sync.js';
import servicesRouter     from './routes/services.js';
import testimonialsRouter from './routes/testimonials.js';
import blogRouter         from './routes/blog.js';
import metaRouter         from './routes/meta.js';
import configRouter       from './routes/config.js';
import faqRouter          from './routes/faq.js';

const app = new Hono().basePath('/api');

// ── Global Middleware ────────────────────────────────────────────────────────
// Log all requests except health pings
app.use('*', async (c, next) => {
  if (c.req.path === '/api/health' || c.req.path === '/health' || c.req.path.endsWith('/health')) return next();
  const start = Date.now();
  console.log(`  <-- ${c.req.method} ${c.req.path}`);
  await next();
  console.log(`  --> ${c.req.method} ${c.req.path} ${c.res.status} ${Date.now() - start}ms`);
});
app.use('*', cors({
  origin: process.env.ALLOWED_ORIGIN ?? '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ── Routes ───────────────────────────────────────────────────────────────────
app.route('/health',       healthRouter);
app.route('/auth',         authRouter);
app.route('/projects',     projectsRouter);
app.route('/skills',       skillsRouter);
app.route('/timeline',     timelineRouter);
app.route('/bio',          bioRouter);
app.route('/contact',      contactRouter);
app.route('/sync',         syncRouter);
app.route('/services',     servicesRouter);
app.route('/testimonials', testimonialsRouter);
app.route('/blog',         blogRouter);
app.route('/meta',         metaRouter);
app.route('/config',       configRouter);
app.route('/faq',          faqRouter);

// ── 404 fallback ────────────────────────────────────────────────────────────
app.notFound(notFound);

export default app;
