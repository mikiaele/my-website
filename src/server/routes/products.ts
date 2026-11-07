import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import {
  products,
  productImages,
  categories,
  regions,
  woredas,
  cities,
  users,
} from '../../db/schema.ts';
import { eq, and, or, ilike, gte, lte, desc, asc, sql } from 'drizzle-orm';
import { requireAuth, requireSeller, AuthRequest } from '../../middleware/auth.ts';
import { migrateDatabase } from '../../db/migrate.ts';

export const productsRouter = Router();

// GET all products with filtering, search, sorting
productsRouter.get('/', async (req, res: Response) => {
  try {
    const {
      search,
      condition,
      categoryId,
      regionId,
      woredaId,
      cityId,
      minPrice,
      maxPrice,
      sort,
      sellerId,
      limit = '30',
      offset = '0',
    } = req.query;

    const conditions: any[] = [];

    // Filter by status (public view only sees active products, unless seller viewing own products)
    if (sellerId) {
      conditions.push(eq(products.sellerId, Number(sellerId)));
    } else {
      conditions.push(eq(products.status, 'active'));
    }

    // Condition filter: 'new' or 'used'
    if (condition && (condition === 'new' || condition === 'used')) {
      conditions.push(eq(products.condition, condition as string));
    }

    // Category filter
    if (categoryId && !isNaN(Number(categoryId))) {
      conditions.push(eq(products.categoryId, Number(categoryId)));
    }

    // Location filters
    if (regionId && !isNaN(Number(regionId))) {
      conditions.push(eq(products.regionId, Number(regionId)));
    }
    if (woredaId && !isNaN(Number(woredaId))) {
      conditions.push(eq(products.woredaId, Number(woredaId)));
    }
    if (cityId && !isNaN(Number(cityId))) {
      conditions.push(eq(products.cityId, Number(cityId)));
    }

    // Price range
    if (minPrice && !isNaN(Number(minPrice))) {
      conditions.push(gte(products.price, Number(minPrice)));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      conditions.push(lte(products.price, Number(maxPrice)));
    }

    // Text search in title or description
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const term = `%${search.trim()}%`;
      conditions.push(or(ilike(products.title, term), ilike(products.description, term)));
    }

    // Sorting
    let orderByClause: any = desc(products.createdAt);
    if (sort === 'price_asc') {
      orderByClause = asc(products.price);
    } else if (sort === 'price_desc') {
      orderByClause = desc(products.price);
    } else if (sort === 'popular') {
      orderByClause = desc(products.views);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        condition: products.condition,
        status: products.status,
        views: products.views,
        featured: products.featured,
        createdAt: products.createdAt,
        categoryId: products.categoryId,
        categoryNameAm: categories.nameAm,
        categoryNameEn: categories.nameEn,
        categoryNameTi: categories.nameTi,
        regionId: products.regionId,
        regionNameAm: regions.nameAm,
        regionNameEn: regions.nameEn,
        regionNameTi: regions.nameTi,
        woredaId: products.woredaId,
        woredaNameAm: woredas.nameAm,
        woredaNameEn: woredas.nameEn,
        woredaNameTi: woredas.nameTi,
        cityId: products.cityId,
        cityNameAm: cities.nameAm,
        cityNameEn: cities.nameEn,
        cityNameTi: cities.nameTi,
        sellerId: products.sellerId,
        sellerName: users.name,
        sellerPhone: users.phone,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(regions, eq(products.regionId, regions.id))
      .leftJoin(woredas, eq(products.woredaId, woredas.id))
      .leftJoin(cities, eq(products.cityId, cities.id))
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(Math.min(Number(limit), 100))
      .offset(Number(offset));

    let productList;
    try {
      productList = await query;
    } catch (dbErr: any) {
      if (process.env.DATABASE_URL) {
        console.log('Products query error, running auto-migration...', dbErr.message);
        await migrateDatabase();
        productList = await query;
      } else {
        throw dbErr;
      }
    }

    // Attach primary images
    const productIds = (productList || []).map((p) => p.id);
    let imagesMap: Record<number, string[]> = {};

    if (productIds.length > 0) {
      try {
        const allImages = await db
          .select()
          .from(productImages)
          .where(
            or(
              ...productIds.map((id) => eq(productImages.productId, id))
            )
          );

        for (const img of allImages) {
          if (!imagesMap[img.productId]) {
            imagesMap[img.productId] = [];
          }
          imagesMap[img.productId].push(img.imageUrl);
        }
      } catch {
        // Table migrating or empty
      }
    }

    const result = (productList || []).map((p) => ({
      ...p,
      images: imagesMap[p.id] || [],
      primaryImage: imagesMap[p.id]?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    }));

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching products, returning empty list:', error.message);
    res.json([]);
  }
});

// GET single product by ID
productsRouter.get('/:id', async (req, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Increment views safely
    await db
      .update(products)
      .set({ views: sql`${products.views} + 1` })
      .where(eq(products.id, id));

    const rows = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        condition: products.condition,
        status: products.status,
        views: products.views,
        featured: products.featured,
        createdAt: products.createdAt,
        categoryId: products.categoryId,
        categoryNameAm: categories.nameAm,
        categoryNameEn: categories.nameEn,
        categoryNameTi: categories.nameTi,
        regionId: products.regionId,
        regionNameAm: regions.nameAm,
        regionNameEn: regions.nameEn,
        regionNameTi: regions.nameTi,
        woredaId: products.woredaId,
        woredaNameAm: woredas.nameAm,
        woredaNameEn: woredas.nameEn,
        woredaNameTi: woredas.nameTi,
        cityId: products.cityId,
        cityNameAm: cities.nameAm,
        cityNameEn: cities.nameEn,
        cityNameTi: cities.nameTi,
        sellerId: products.sellerId,
        sellerName: users.name,
        sellerEmail: users.email,
        sellerPhone: users.phone,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(regions, eq(products.regionId, regions.id))
      .leftJoin(woredas, eq(products.woredaId, woredas.id))
      .leftJoin(cities, eq(products.cityId, cities.id))
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(eq(products.id, id))
      .limit(1);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const prod = rows[0];
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id));

    res.json({
      ...prod,
      images: images.map((img) => img.imageUrl),
    });
  } catch (error: any) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Failed to retrieve product details' });
  }
});

// CREATE new product (Seller or Admin)
productsRouter.post('/', requireAuth, requireSeller, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      condition,
      categoryId,
      regionId,
      woredaId,
      cityId,
      images,
    } = req.body;

    // Validate required fields
    if (!title || !description || price === undefined || !condition) {
      return res.status(400).json({ error: 'Title, description, price, and condition are required' });
    }

    if (condition !== 'new' && condition !== 'used') {
      return res.status(400).json({ error: "Condition must be either 'new' or 'used'" });
    }

    if (!regionId || !woredaId || !cityId) {
      return res.status(400).json({ error: 'Sale location (region, woreda, and city) is required' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number in ETB' });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'At least one photo captured with the camera is required' });
    }

    const sellerId = req.user!.id;

    // Insert product
    const [newProduct] = await db
      .insert(products)
      .values({
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        condition,
        status: 'active',
        categoryId: categoryId ? Number(categoryId) : null,
        sellerId,
        regionId: Number(regionId),
        woredaId: Number(woredaId),
        cityId: Number(cityId),
      })
      .returning();

    // Insert images
    for (let i = 0; i < images.length; i++) {
      await db.insert(productImages).values({
        productId: newProduct.id,
        imageUrl: images[i],
        isPrimary: i === 0,
      });
    }

    res.status(201).json({
      success: true,
      productId: newProduct.id,
      product: newProduct,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message || 'Failed to create product listing' });
  }
});

// UPDATE product
productsRouter.put('/:id', requireAuth, requireSeller, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = existing[0];
    if (req.user!.role !== 'admin' && product.sellerId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own products' });
    }

    const {
      title,
      description,
      price,
      condition,
      status,
      categoryId,
      regionId,
      woredaId,
      cityId,
      images,
      featured,
    } = req.body;

    const updateData: any = { updatedAt: new Date() };
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (condition && (condition === 'new' || condition === 'used')) updateData.condition = condition;
    if (status) updateData.status = status;
    if (categoryId) updateData.categoryId = Number(categoryId);
    if (regionId) updateData.regionId = Number(regionId);
    if (woredaId) updateData.woredaId = Number(woredaId);
    if (cityId) updateData.cityId = Number(cityId);
    if (req.user!.role === 'admin' && featured !== undefined) updateData.featured = Boolean(featured);

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    // If images supplied, update
    if (images && Array.isArray(images) && images.length > 0) {
      await db.delete(productImages).where(eq(productImages.productId, id));
      for (let i = 0; i < images.length; i++) {
        await db.insert(productImages).values({
          productId: id,
          imageUrl: images[i],
          isPrimary: i === 0,
        });
      }
    }

    res.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message || 'Failed to update product' });
  }
});

// DELETE product
productsRouter.delete('/:id', requireAuth, requireSeller, async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = existing[0];
    if (req.user!.role !== 'admin' && product.sellerId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own products' });
    }

    await db.delete(products).where(eq(products.id, id));
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});
