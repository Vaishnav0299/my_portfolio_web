import { Hono } from 'hono';
import { db } from '../db/client.js';
import { documents, bio } from '../db/schema.js';
import { documentDriveSchema, documentUpdateSchema } from '../shared/schemas.js';
import { authMiddleware } from '../middleware/auth.js';
import { eq, desc, asc, sql } from 'drizzle-orm';
import { isDbConfigured, localStore, type LocalDocument } from '../db/localStore.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const documentsRouter = new Hono();

// Determine root uploads directory
let uploadsDir: string;
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // Place uploads in portfolio-frontend/public/uploads so both dev server and production can serve directly
  uploadsDir = path.resolve(__dirname, '../../../portfolio-frontend/public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch {
  uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// ── Google Drive & Cloud URL Smart Parser ───────────────────────────────────
export function parseDocumentUrl(url: string) {
  if (!url || typeof url !== 'string') {
    return {
      fileId: null,
      sourceType: 'external_url' as const,
      previewUrl: url || '',
      downloadUrl: url || '',
    };
  }

  const cleanUrl = url.trim();

  // Match Google Drive Patterns
  const drivePatterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of drivePatterns) {
    const match = cleanUrl.match(pattern);
    if (match && match[1]) {
      const fileId = match[1];
      return {
        fileId,
        sourceType: 'gdrive_link' as const,
        previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      };
    }
  }

  // Generic direct URL
  return {
    fileId: null,
    sourceType: 'external_url' as const,
    previewUrl: cleanUrl,
    downloadUrl: cleanUrl,
  };
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper to sync primary resume to bio table
async function syncResumeToBio(resumeUrl: string) {
  localStore.bio.resumeUrl = resumeUrl;
  if (isDbConfigured) {
    try {
      await db.update(bio).set({
        resumeUrl,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.warn('[API/documents] Failed to update bio resumeUrl in DB:', (err as Error).message);
    }
  }
}

// ── PUBLIC: GET /api/documents ───────────────────────────────────────────────
documentsRouter.get('/', async (c) => {
  const category = c.req.query('category');

  if (isDbConfigured) {
    try {
      let rows;
      if (category) {
        rows = await db.select().from(documents).where(eq(documents.category, category)).orderBy(asc(documents.sortOrder), desc(documents.createdAt));
      } else {
        rows = await db.select().from(documents).orderBy(asc(documents.sortOrder), desc(documents.createdAt));
      }

      if (rows && rows.length > 0) {
        return c.json({ success: true, data: rows });
      }
    } catch (err) {
      console.warn('[API/documents] DB query failed, falling back to localStore:', (err as Error).message);
    }
  }

  let results = [...localStore.documents];
  if (category) {
    results = results.filter(d => d.category === category);
  }
  results.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return c.json({ success: true, data: results });
});

// ── PUBLIC: GET /api/documents/resume (Active Resume) ─────────────────────────
documentsRouter.get('/resume', async (c) => {
  if (isDbConfigured) {
    try {
      const [primary] = await db.select().from(documents).where(eq(documents.isPrimaryResume, true)).limit(1);
      if (primary) {
        return c.json({ success: true, data: primary });
      }
    } catch {
      // Fallback
    }
  }

  const primary = localStore.documents.find(d => d.isPrimaryResume) || localStore.documents[0];
  return c.json({ success: true, data: primary || null });
});

// ── ADMIN: Require authentication ────────────────────────────────────────────
documentsRouter.use('/admin', authMiddleware);
documentsRouter.use('/admin/*', authMiddleware);

// ── ADMIN: Parse Google Drive URL Preview / Test ─────────────────────────────
documentsRouter.post('/admin/parse-drive', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const url = body.url;
  if (!url) {
    return c.json({ success: false, error: 'URL is required' }, 400);
  }
  const parsed = parseDocumentUrl(url);
  return c.json({ success: true, data: parsed });
});

// ── ADMIN: POST /api/documents/admin/link (Google Drive / Cloud Link) ────────
documentsRouter.post('/admin/link', async (c) => {
  const raw = await c.req.json().catch(() => null);
  const result = documentDriveSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }

  const { title, category, description, driveUrl, isPrimaryResume, sortOrder } = result.data;
  const parsed = parseDocumentUrl(driveUrl);

  const newDoc: LocalDocument = {
    id: localStore.nextDocumentId++,
    title,
    category: category as any,
    description: description || '',
    sourceType: parsed.sourceType,
    fileUrl: driveUrl,
    driveUrl: driveUrl,
    downloadUrl: parsed.downloadUrl,
    previewUrl: parsed.previewUrl,
    fileName: `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
    fileSize: 'Cloud Document',
    mimeType: 'application/pdf',
    isPrimaryResume: Boolean(isPrimaryResume),
    sortOrder: sortOrder || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // If primary resume, unmark others
  if (newDoc.isPrimaryResume) {
    localStore.documents.forEach(d => { d.isPrimaryResume = false; });
    await syncResumeToBio(newDoc.downloadUrl || newDoc.fileUrl);
  }

  localStore.documents.unshift(newDoc);

  if (isDbConfigured) {
    try {
      if (newDoc.isPrimaryResume) {
        await db.update(documents).set({ isPrimaryResume: false });
      }
      const [inserted] = await db.insert(documents).values({
        title: newDoc.title,
        category: newDoc.category,
        description: newDoc.description,
        sourceType: newDoc.sourceType,
        fileUrl: newDoc.fileUrl,
        driveUrl: newDoc.driveUrl,
        downloadUrl: newDoc.downloadUrl,
        previewUrl: newDoc.previewUrl,
        fileName: newDoc.fileName,
        fileSize: newDoc.fileSize,
        mimeType: newDoc.mimeType,
        isPrimaryResume: newDoc.isPrimaryResume,
        sortOrder: newDoc.sortOrder,
      } as any).returning();

      if (inserted) {
        newDoc.id = inserted.id;
        return c.json({ success: true, data: inserted }, 201);
      }
    } catch (err) {
      console.warn('[API/documents] DB insert failed:', (err as Error).message);
    }
  }

  return c.json({ success: true, data: newDoc }, 201);
});

// ── ADMIN: POST /api/documents/admin/upload (Local File Upload) ──────────────
documentsRouter.post('/admin/upload', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || typeof file === 'string') {
      return c.json({ success: false, error: 'File is required' }, 400);
    }

    const title = (body['title'] as string) || (file as File).name.replace(/\.[^/.]+$/, '');
    const category = (body['category'] as string) || 'resume';
    const description = (body['description'] as string) || '';
    const rawPrimary = body['isPrimaryResume'];
    const isPrimaryResume = rawPrimary === 'true' || rawPrimary === '1' || (rawPrimary as any) === true;
    const sortOrder = Number(body['sortOrder']) || 0;

    const originalName = (file as File).name;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(sanitizedName) || '.pdf';
    const baseName = path.basename(sanitizedName, ext);
    const uniqueFileName = `${baseName}_${Date.now()}${ext}`;

    const filePath = path.join(uploadsDir, uniqueFileName);
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    const fileSizeFormatted = formatBytes(buffer.length);
    const mimeType = (file as File).type || 'application/pdf';

    const newDoc: LocalDocument = {
      id: localStore.nextDocumentId++,
      title,
      category: category as any,
      description,
      sourceType: 'local_upload',
      fileUrl: publicUrl,
      downloadUrl: publicUrl,
      previewUrl: publicUrl,
      fileName: originalName,
      fileSize: fileSizeFormatted,
      mimeType,
      isPrimaryResume,
      sortOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newDoc.isPrimaryResume) {
      localStore.documents.forEach(d => { d.isPrimaryResume = false; });
      await syncResumeToBio(publicUrl);
    }

    localStore.documents.unshift(newDoc);

    if (isDbConfigured) {
      try {
        if (newDoc.isPrimaryResume) {
          await db.update(documents).set({ isPrimaryResume: false });
        }
        const [inserted] = await db.insert(documents).values({
          title: newDoc.title,
          category: newDoc.category,
          description: newDoc.description,
          sourceType: newDoc.sourceType,
          fileUrl: newDoc.fileUrl,
          driveUrl: null,
          downloadUrl: newDoc.downloadUrl,
          previewUrl: newDoc.previewUrl,
          fileName: newDoc.fileName,
          fileSize: newDoc.fileSize,
          mimeType: newDoc.mimeType,
          isPrimaryResume: newDoc.isPrimaryResume,
          sortOrder: newDoc.sortOrder,
        } as any).returning();

        if (inserted) {
          newDoc.id = inserted.id;
          return c.json({ success: true, data: inserted }, 201);
        }
      } catch (err) {
        console.warn('[API/documents] DB insert failed:', (err as Error).message);
      }
    }

    return c.json({ success: true, data: newDoc }, 201);
  } catch (err) {
    console.error('[API/documents] File upload failed:', err);
    return c.json({ success: false, error: (err as Error).message || 'File upload failed' }, 500);
  }
});

// ── ADMIN: POST /api/documents/admin/:id/set-resume ──────────────────────────
documentsRouter.post('/admin/:id/set-resume', async (c) => {
  const id = Number(c.req.param('id'));
  const doc = localStore.documents.find(d => d.id === id);

  if (!doc) {
    return c.json({ success: false, error: 'Document not found' }, 404);
  }

  localStore.documents.forEach(d => {
    d.isPrimaryResume = d.id === id;
  });
  doc.isPrimaryResume = true;

  const activeUrl = doc.downloadUrl || doc.fileUrl;
  await syncResumeToBio(activeUrl);

  if (isDbConfigured) {
    try {
      await db.update(documents).set({ isPrimaryResume: false });
      await db.update(documents).set({ isPrimaryResume: true }).where(eq(documents.id, id));
    } catch (err) {
      console.warn('[API/documents] DB set-resume failed:', (err as Error).message);
    }
  }

  return c.json({ success: true, data: doc });
});

// ── ADMIN: PUT /api/documents/admin/:id ──────────────────────────────────────
documentsRouter.put('/admin/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const raw = await c.req.json().catch(() => null);
  const result = documentUpdateSchema.safeParse(raw);
  if (!result.success) {
    return c.json({ success: false, error: 'Validation failed', details: result.error.format() }, 400);
  }

  const body = result.data;
  const index = localStore.documents.findIndex(d => d.id === id);
  if (index === -1) {
    return c.json({ success: false, error: 'Document not found' }, 404);
  }

  if (body.driveUrl) {
    const parsed = parseDocumentUrl(body.driveUrl);
    body.downloadUrl = parsed.downloadUrl;
    body.previewUrl = parsed.previewUrl;
    body.fileUrl = body.driveUrl;
  }

  localStore.documents[index] = {
    ...localStore.documents[index],
    ...body,
    updatedAt: new Date().toISOString(),
  };

  if (body.isPrimaryResume) {
    localStore.documents.forEach(d => {
      if (d.id !== id) d.isPrimaryResume = false;
    });
    await syncResumeToBio(localStore.documents[index].downloadUrl || localStore.documents[index].fileUrl);
  }

  if (isDbConfigured) {
    try {
      if (body.isPrimaryResume) {
        await db.update(documents).set({ isPrimaryResume: false });
      }
      const [updated] = await db.update(documents).set({
        ...body,
        updatedAt: new Date(),
      } as any).where(eq(documents.id, id)).returning();

      if (updated) {
        return c.json({ success: true, data: updated });
      }
    } catch (err) {
      console.warn('[API/documents] DB update failed:', (err as Error).message);
    }
  }

  return c.json({ success: true, data: localStore.documents[index] });
});

// ── ADMIN: DELETE /api/documents/admin/:id ───────────────────────────────────
documentsRouter.delete('/admin/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const index = localStore.documents.findIndex(d => d.id === id);
  if (index === -1) {
    return c.json({ success: false, error: 'Document not found' }, 404);
  }

  const [deletedDoc] = localStore.documents.splice(index, 1);

  // If local file, attempt to delete from disk safely
  if (deletedDoc.sourceType === 'local_upload' && deletedDoc.fileUrl.startsWith('/uploads/')) {
    try {
      const fileName = path.basename(deletedDoc.fileUrl);
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.warn('[API/documents] Failed to remove local file:', (err as Error).message);
    }
  }

  if (isDbConfigured) {
    try {
      await db.delete(documents).where(eq(documents.id, id));
    } catch (err) {
      console.warn('[API/documents] DB delete failed:', (err as Error).message);
    }
  }

  return c.json({ success: true, message: 'Document deleted successfully' });
});

export default documentsRouter;
