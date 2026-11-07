import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or internal unique identifier
  email: text('email').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  role: text('role').notNull().default('customer'), // 'customer' | 'seller' | 'admin'
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  nameAm: text('name_am').notNull(),
  nameEn: text('name_en').notNull(),
  nameTi: text('name_ti').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull().default('Package'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const regions = pgTable('regions', {
  id: serial('id').primaryKey(),
  nameAm: text('name_am').notNull(),
  nameEn: text('name_en').notNull(),
  nameTi: text('name_ti').notNull(),
  code: text('code').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const woredas = pgTable('woredas', {
  id: serial('id').primaryKey(),
  regionId: integer('region_id')
    .references(() => regions.id, { onDelete: 'cascade' })
    .notNull(),
  nameAm: text('name_am').notNull(),
  nameEn: text('name_en').notNull(),
  nameTi: text('name_ti').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  woredaId: integer('woreda_id')
    .references(() => woredas.id, { onDelete: 'cascade' })
    .notNull(),
  nameAm: text('name_am').notNull(),
  nameEn: text('name_en').notNull(),
  nameTi: text('name_ti').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // in Ethiopian Birr (ETB)
  condition: text('condition').notNull(), // 'new' | 'used'
  status: text('status').notNull().default('active'), // 'active' | 'pending' | 'sold' | 'archived'
  categoryId: integer('category_id').references(() => categories.id),
  sellerId: integer('seller_id')
    .references(() => users.id)
    .notNull(),
  regionId: integer('region_id').references(() => regions.id),
  woredaId: integer('woreda_id').references(() => woredas.id),
  cityId: integer('city_id').references(() => cities.id),
  views: integer('views').notNull().default(0),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  imageUrl: text('image_url').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  customerId: integer('customer_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  message: text('message').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'replied' | 'closed'
  sellerId: integer('seller_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  customerId: integer('customer_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  deliveryAddress: text('delivery_address'),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: integer('total_price').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  sellerId: integer('seller_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const websiteSettings = pgTable('website_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const administratorAuditLogs = pgTable('administrator_audit_logs', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').references(() => users.id),
  adminEmail: text('admin_email'),
  action: text('action').notNull(),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  inquiries: many(inquiries),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const regionsRelations = relations(regions, ({ many }) => ({
  woredas: many(woredas),
  products: many(products),
}));

export const woredasRelations = relations(woredas, ({ one, many }) => ({
  region: one(regions, {
    fields: [woredas.regionId],
    references: [regions.id],
  }),
  cities: many(cities),
  products: many(products),
}));

export const citiesRelations = relations(cities, ({ one, many }) => ({
  woreda: one(woredas, {
    fields: [cities.woredaId],
    references: [woredas.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  region: one(regions, {
    fields: [products.regionId],
    references: [regions.id],
  }),
  woreda: one(woredas, {
    fields: [products.woredaId],
    references: [woredas.id],
  }),
  city: one(cities, {
    fields: [products.cityId],
    references: [cities.id],
  }),
  images: many(productImages),
  inquiries: many(inquiries),
  orders: many(orders),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  product: one(products, {
    fields: [inquiries.productId],
    references: [products.id],
  }),
  customer: one(users, {
    fields: [inquiries.customerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [inquiries.sellerId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
  }),
}));
