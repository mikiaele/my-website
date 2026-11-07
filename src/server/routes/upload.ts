import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { requireAuth, requireSeller } from '../../middleware/auth.ts';

export const uploadRouter = Router();

// Store camera-captured photo
uploadRouter.post('/camera-capture', requireAuth, requireSeller, async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    const matches = imageBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid image format. Must be JPEG, PNG, or WebP base64' });
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Max 6MB
    if (buffer.length > 6 * 1024 * 1024) {
      return res.status(400).json({ error: 'Captured photo exceeds 6MB limit' });
    }

    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `mela_cam_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;
    res.json({
      success: true,
      imageUrl,
      filename,
      sizeBytes: buffer.length,
    });
  } catch (error: any) {
    console.error('Error saving camera capture:', error);
    res.status(500).json({ error: 'Failed to process camera image' });
  }
});
