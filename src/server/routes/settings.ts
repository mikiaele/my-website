import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { websiteSettings, administratorAuditLogs } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth, requireAdmin, AuthRequest } from '../../middleware/auth.ts';

export const settingsRouter = Router();

// Public: Get public site settings (like administrator WhatsApp number)
settingsRouter.get('/public', async (req, res: Response) => {
  try {
    const list = await db.select().from(websiteSettings);
    const settingsMap: Record<string, string> = {};
    for (const item of list) {
      settingsMap[item.key] = item.value;
    }

    res.json({
      admin_whatsapp_number: settingsMap['admin_whatsapp_number'] || '@brmiki21',
      site_name: settingsMap['site_name'] || 'Mela Market – መላ ገበያ',
      site_description: settingsMap['site_description'] || 'Ethiopian Online Marketplace',
    });
  } catch (error: any) {
    console.error('Error fetching public settings:', error);
    res.json({
      admin_whatsapp_number: '@brmiki21',
      site_name: 'Mela Market – መላ ገበያ',
      site_description: 'Ethiopian Online Marketplace',
    });
  }
});

// Admin: Get all settings
settingsRouter.get('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const list = await db.select().from(websiteSettings);
    res.json(list);
  } catch (error: any) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Admin: Update setting
settingsRouter.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Setting key is required' });
    }

    const [updated] = await db
      .insert(websiteSettings)
      .values({
        key,
        value: String(value ?? '').trim(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: websiteSettings.key,
        set: {
          value: String(value ?? '').trim(),
          updatedAt: new Date(),
        },
      })
      .returning();

    await db.insert(administratorAuditLogs).values({
      adminId: req.user!.id,
      adminEmail: req.user!.email,
      action: 'UPDATE_SETTING',
      details: `Updated setting '${key}' to '${value}'`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, setting: updated });
  } catch (error: any) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});
