import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { regions, woredas, cities, administratorAuditLogs } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth, requireAdmin, AuthRequest } from '../../middleware/auth.ts';

import { migrateDatabase } from '../../db/migrate.ts';

export const locationsRouter = Router();

const DEFAULT_FALLBACK_LOCATIONS = [
  {
    id: 1,
    code: 'AA',
    nameAm: 'አዲስ አበባ',
    nameEn: 'Addis Ababa',
    nameTi: 'ኣዲስ ኣበባ',
    woredas: [
      {
        id: 1,
        regionId: 1,
        nameAm: 'ቦሌ',
        nameEn: 'Bole',
        nameTi: 'ቦሌ',
        cities: [
          { id: 1, woredaId: 1, nameAm: 'ቦሌ መድኃኔዓለም', nameEn: 'Bole Medhanealem', nameTi: 'ቦሌ መድኃኔዓለም' },
          { id: 2, woredaId: 1, nameAm: 'ገርጂ', nameEn: 'Gerji', nameTi: 'ገርጂ' },
        ],
      },
      {
        id: 2,
        regionId: 1,
        nameAm: 'ቂርቆስ',
        nameEn: 'Kirkos',
        nameTi: 'ቂርቆስ',
        cities: [
          { id: 3, woredaId: 2, nameAm: 'ካዛንቺስ', nameEn: 'Kazanchis', nameTi: 'ካዛንቺስ' },
        ],
      },
      {
        id: 3,
        regionId: 1,
        nameAm: 'የካ',
        nameEn: 'Yeka',
        nameTi: 'የካ',
        cities: [
          { id: 4, woredaId: 3, nameAm: 'መገናኛ', nameEn: 'Megenagna', nameTi: 'መገናኛ' },
        ],
      },
    ],
  },
  {
    id: 2,
    code: 'OR',
    nameAm: 'ኦሮሚያ',
    nameEn: 'Oromia',
    nameTi: 'ኦሮሚያ',
    woredas: [
      {
        id: 4,
        regionId: 2,
        nameAm: 'አዳማ',
        nameEn: 'Adama',
        nameTi: 'ኣዳማ',
        cities: [
          { id: 5, woredaId: 4, nameAm: 'አዳማ ከተማ (ናዝሬት)', nameEn: 'Adama City', nameTi: 'ኣዳማ ከተማ' },
        ],
      },
      {
        id: 5,
        regionId: 2,
        nameAm: 'ቢሾፍቱ',
        nameEn: 'Bishoftu',
        nameTi: 'ቢሾፍቱ',
        cities: [
          { id: 6, woredaId: 5, nameAm: 'ቢሾፍቱ ከተማ (ደብረ ዘይት)', nameEn: 'Bishoftu Town', nameTi: 'ቢሾፍቱ ከተማ' },
        ],
      },
    ],
  },
  {
    id: 3,
    code: 'AM',
    nameAm: 'አማራ',
    nameEn: 'Amhara',
    nameTi: 'ኣምሓራ',
    woredas: [
      {
        id: 6,
        regionId: 3,
        nameAm: 'ባሕር ዳር',
        nameEn: 'Bahir Dar',
        nameTi: 'ባሕር ዳር',
        cities: [
          { id: 7, woredaId: 6, nameAm: 'ቀበሌ 04', nameEn: 'Kebele 04', nameTi: 'ቀበሌ 04' },
          { id: 8, woredaId: 6, nameAm: 'ቀበሌ 11', nameEn: 'Kebele 11', nameTi: 'ቀበሌ 11' },
        ],
      },
    ],
  },
  {
    id: 4,
    code: 'TG',
    nameAm: 'ትግራይ',
    nameEn: 'Tigray',
    nameTi: 'ትግራይ',
    woredas: [
      {
        id: 7,
        regionId: 4,
        nameAm: 'መቐለ',
        nameEn: 'Mekelle',
        nameTi: 'መቐለ',
        cities: [
          { id: 9, woredaId: 7, nameAm: 'ሓወልቲ', nameEn: 'Hawelti', nameTi: 'ሓወልቲ' },
          { id: 10, woredaId: 7, nameAm: 'ዓዲ ሓውሲ', nameEn: 'Adi Hawsi', nameTi: 'ዓዲ ሓውሲ' },
        ],
      },
    ],
  },
];

// GET entire location tree (Regions -> Woredas -> Cities)
locationsRouter.get('/hierarchy', async (req, res: Response) => {
  try {
    let allRegions, allWoredas, allCities;
    try {
      allRegions = await db.select().from(regions);
      allWoredas = await db.select().from(woredas);
      allCities = await db.select().from(cities);
    } catch (dbErr: any) {
      if (process.env.DATABASE_URL) {
        console.log('Locations query error, running auto-migration...', dbErr.message);
        await migrateDatabase();
        allRegions = await db.select().from(regions);
        allWoredas = await db.select().from(woredas);
        allCities = await db.select().from(cities);
      } else {
        throw dbErr;
      }
    }

    if (!allRegions || allRegions.length === 0) {
      return res.json(DEFAULT_FALLBACK_LOCATIONS);
    }

    const hierarchy = allRegions.map((reg) => ({
      ...reg,
      woredas: (allWoredas || [])
        .filter((w) => w.regionId === reg.id)
        .map((w) => ({
          ...w,
          cities: (allCities || []).filter((c) => c.woredaId === w.id),
        })),
    }));

    res.json(hierarchy);
  } catch (error: any) {
    console.error('Error fetching locations hierarchy, serving default fallback:', error.message);
    res.json(DEFAULT_FALLBACK_LOCATIONS);
  }
});

// Admin: Add new region
locationsRouter.post('/regions', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { nameAm, nameEn, nameTi, code } = req.body;
    if (!nameAm || !nameEn || !code) {
      return res.status(400).json({ error: 'Region name and code are required' });
    }

    const [newReg] = await db
      .insert(regions)
      .values({
        nameAm,
        nameEn,
        nameTi: nameTi || nameAm,
        code: code.toUpperCase().trim(),
      })
      .returning();

    await db.insert(administratorAuditLogs).values({
      adminId: req.user!.id,
      adminEmail: req.user!.email,
      action: 'ADD_REGION',
      details: `Added region ${nameEn} (${code})`,
    });

    res.status(201).json(newReg);
  } catch (error: any) {
    console.error('Error adding region:', error);
    res.status(500).json({ error: error.message || 'Failed to add region' });
  }
});

// Admin: Add new woreda
locationsRouter.post('/woredas', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { regionId, nameAm, nameEn, nameTi } = req.body;
    if (!regionId || !nameAm || !nameEn) {
      return res.status(400).json({ error: 'Region ID, Amharic name and English name are required' });
    }

    const [newWoreda] = await db
      .insert(woredas)
      .values({
        regionId: Number(regionId),
        nameAm,
        nameEn,
        nameTi: nameTi || nameAm,
      })
      .returning();

    await db.insert(administratorAuditLogs).values({
      adminId: req.user!.id,
      adminEmail: req.user!.email,
      action: 'ADD_WOREDA',
      details: `Added woreda ${nameEn} to region ID ${regionId}`,
    });

    res.status(201).json(newWoreda);
  } catch (error: any) {
    console.error('Error adding woreda:', error);
    res.status(500).json({ error: error.message || 'Failed to add woreda' });
  }
});

// Admin: Add new city
locationsRouter.post('/cities', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { woredaId, nameAm, nameEn, nameTi } = req.body;
    if (!woredaId || !nameAm || !nameEn) {
      return res.status(400).json({ error: 'Woreda ID, Amharic name and English name are required' });
    }

    const [newCity] = await db
      .insert(cities)
      .values({
        woredaId: Number(woredaId),
        nameAm,
        nameEn,
        nameTi: nameTi || nameAm,
      })
      .returning();

    await db.insert(administratorAuditLogs).values({
      adminId: req.user!.id,
      adminEmail: req.user!.email,
      action: 'ADD_CITY',
      details: `Added city/town ${nameEn} to woreda ID ${woredaId}`,
    });

    res.status(201).json(newCity);
  } catch (error: any) {
    console.error('Error adding city:', error);
    res.status(500).json({ error: error.message || 'Failed to add city' });
  }
});
