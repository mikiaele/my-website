import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { categories, products, administratorAuditLogs } from '../../db/schema.ts';
import { eq, sql } from 'drizzle-orm';
import { requireAuth, requireAdmin, AuthRequest } from '../../middleware/auth.ts';

import { migrateDatabase } from '../../db/migrate.ts';

export const categoriesRouter = Router();

const DEFAULT_FALLBACK_CATEGORIES = [
  { id: 1, nameAm: 'ኤሌክትሮኒክስ', nameEn: 'Electronics', nameTi: 'ኤሌክትሮኒክስ', slug: 'electronics', icon: 'Smartphone', productCount: 0 },
  { id: 2, nameAm: 'የቤትና ቢሮ እቃዎች', nameEn: 'Home & Furniture', nameTi: 'ናይ ቤት ኣቑሑ', slug: 'home-furniture', icon: 'Home', productCount: 0 },
  { id: 3, nameAm: 'ተሽከርካሪዎች', nameEn: 'Vehicles', nameTi: 'ተሽከርከርቲ', slug: 'vehicles', icon: 'Car', productCount: 0 },
  { id: 4, nameAm: 'ፋሽንና አልባሳት', nameEn: 'Fashion', nameTi: 'ፋሽንን ክዳውንትን', slug: 'fashion', icon: 'Shirt', productCount: 0 },
  { id: 5, nameAm: 'ስልኮችና ታብሌቶች', nameEn: 'Mobile Phones', nameTi: 'ስልካትን ታብሌታትን', slug: 'mobile-phones', icon: 'Smartphone', productCount: 0 },
  { id: 6, nameAm: 'ኮምፒውተርና ላፕቶፕ', nameEn: 'Computers & Laptops', nameTi: 'ኮምፒውተራትን ላፕቶፓትን', slug: 'computers-laptops', icon: 'Laptop', productCount: 0 },
  { id: 7, nameAm: 'እርሻና ኢንዱስትሪ', nameEn: 'Agriculture & Industry', nameTi: 'ሕርሻን ኢንዱስትሪን', slug: 'agriculture-industry', icon: 'Wrench', productCount: 0 },
  { id: 8, nameAm: 'አገልግሎቶች', nameEn: 'Services', nameTi: 'ኣገልግሎታት', slug: 'services', icon: 'Briefcase', productCount: 0 },
];

// GET all categories
categoriesRouter.get('/', async (req, res: Response) => {
  try {
    let list;
    try {
      list = await db.select().from(categories);
    } catch (dbErr: any) {
      if (process.env.DATABASE_URL) {
        console.log('Categories query error, running auto-migration...', dbErr.message);
        await migrateDatabase();
        list = await db.select().from(categories);
      } else {
        throw dbErr;
      }
    }

    if (!list || list.length === 0) {
      return res.json(DEFAULT_FALLBACK_CATEGORIES);
    }

    // Get count of products for each category
    let countsMap = new Map<number, number>();
    try {
      const counts = await db
        .select({
          categoryId: products.categoryId,
          count: sql<number>`count(*)`,
        })
        .from(products)
        .where(eq(products.status, 'active'))
        .groupBy(products.categoryId);

      countsMap = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));
    } catch {
      // Products table might be empty or migrating
    }

    const result = list.map((cat) => ({
      ...cat,
      productCount: countsMap.get(cat.id) || 0,
    }));

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching categories, serving default fallback:', error.message);
    res.json(DEFAULT_FALLBACK_CATEGORIES);
  }
});

// Admin: Add new category
categoriesRouter.post('/', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { nameAm, nameEn, nameTi, slug, icon } = req.body;
    if (!nameAm || !nameEn || !slug) {
      return res.status(400).json({ error: 'Amharic name, English name, and slug are required' });
    }

    const [newCat] = await db
      .insert(categories)
      .values({
        nameAm,
        nameEn,
        nameTi: nameTi || nameAm,
        slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
        icon: icon || 'Package',
      })
      .returning();

    await db.insert(administratorAuditLogs).values({
      adminId: req.user!.id,
      adminEmail: req.user!.email,
      action: 'ADD_CATEGORY',
      details: `Created category ${nameEn} (${slug})`,
    });

    res.status(201).json(newCat);
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message || 'Failed to create category' });
  }
});
