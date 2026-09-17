import { Hono } from 'hono';
import { db } from '../db/client.js';
import { messages } from '../db/schema.js';
import { contactSchema, type ContactInput } from '../shared/schemas.js';
import { isDbConfigured, localStore } from '../db/localStore.js';

const contact = new Hono();

// -- PUBLIC: POST /api/contact ------------------------------------------------
contact.post('/', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = contactSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }
  const { name, email, message } = result.data as ContactInput;

  // 1. Save to database or local store
  if (isDbConfigured) {
    try {
      await db.insert(messages).values({ name, email, message });
    } catch (err) {
      console.warn('[API/contact] Database error, storing message locally:', (err as Error).message);
      localStore.messages.push({
        id: ++localStore.nextMessageId,
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
      });
    }
  } else {
    localStore.messages.push({
      id: ++localStore.nextMessageId,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    });
  }

  // 2. Forward to Web3Forms (fire-and-forget, non-blocking)
  const accessKey = process.env.VITE_WEB3FORMS_ACCESS_KEY;
  if (accessKey && accessKey.trim() !== '') {
    const payload = new FormData();
    payload.append('access_key', accessKey);
    payload.append('name', name);
    payload.append('email', email);
    payload.append('message', message);
    payload.append('from_name', 'Portfolio Contact Form');
    payload.append('subject', `[Portfolio Message] New message from ${name}`);

    fetch('https://api.web3forms.com/submit', { method: 'POST', body: payload }).catch((err) =>
      console.warn('[Contact] Web3Forms forwarding failed:', (err as Error).message)
    );
  }

  return c.json({
    success: true,
    message: "Message received! I'll get back to you soon.",
  });
});

export default contact;
