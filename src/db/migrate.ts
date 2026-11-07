import { pool, isDatabaseConfigured } from './index.ts';

let migrationPromise: Promise<boolean> | null = null;
let migrationCompleted = false;

/**
 * Ensures all required PostgreSQL tables, columns, constraints, and default data
 * exist in the Neon database. Idempotent and safe to run on every startup or request.
 */
export async function migrateDatabase(): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    console.warn('⚠️ DATABASE_URL is not set. Skipping Neon schema migration.');
    return false;
  }

  if (migrationCompleted) {
    return true;
  }

  if (migrationPromise) {
    return migrationPromise;
  }

  migrationPromise = (async () => {
    console.log('🔄 Checking and applying Neon PostgreSQL database schema migrations...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Table: website_settings
      await client.query(`
        CREATE TABLE IF NOT EXISTS website_settings (
          id SERIAL PRIMARY KEY,
          key TEXT NOT NULL UNIQUE,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // 2. Table: categories
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name_am TEXT NOT NULL DEFAULT '',
          name_en TEXT NOT NULL DEFAULT '',
          name_ti TEXT NOT NULL DEFAULT '',
          slug TEXT NOT NULL UNIQUE,
          icon TEXT NOT NULL DEFAULT 'Package',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Ensure all category columns exist if table pre-existed with older columns
      await client.query(`
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_am TEXT NOT NULL DEFAULT '';
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en TEXT NOT NULL DEFAULT '';
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ti TEXT NOT NULL DEFAULT '';
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug TEXT;
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT 'Package';
        ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      `);

      // If legacy 'name' column exists without Amharic/English names populated
      await client.query(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'name') THEN
            UPDATE categories SET name_am = name WHERE (name_am = '' OR name_am IS NULL) AND name IS NOT NULL;
            UPDATE categories SET name_en = name WHERE (name_en = '' OR name_en IS NULL) AND name IS NOT NULL;
            UPDATE categories SET name_ti = name WHERE (name_ti = '' OR name_ti IS NULL) AND name IS NOT NULL;
          END IF;
        END $$;
      `);

      // 3. Table: users
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uid TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          role TEXT NOT NULL DEFAULT 'customer',
          password_hash TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS uid TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
      `);

      // 4. Table: regions
      await client.query(`
        CREATE TABLE IF NOT EXISTS regions (
          id SERIAL PRIMARY KEY,
          name_am TEXT NOT NULL DEFAULT '',
          name_en TEXT NOT NULL DEFAULT '',
          name_ti TEXT NOT NULL DEFAULT '',
          code TEXT NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      await client.query(`
        ALTER TABLE regions ADD COLUMN IF NOT EXISTS name_am TEXT NOT NULL DEFAULT '';
        ALTER TABLE regions ADD COLUMN IF NOT EXISTS name_en TEXT NOT NULL DEFAULT '';
        ALTER TABLE regions ADD COLUMN IF NOT EXISTS name_ti TEXT NOT NULL DEFAULT '';
        ALTER TABLE regions ADD COLUMN IF NOT EXISTS code TEXT;
        ALTER TABLE regions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      `);

      // 5. Table: woredas
      await client.query(`
        CREATE TABLE IF NOT EXISTS woredas (
          id SERIAL PRIMARY KEY,
          region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
          name_am TEXT NOT NULL DEFAULT '',
          name_en TEXT NOT NULL DEFAULT '',
          name_ti TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      await client.query(`
        ALTER TABLE woredas ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE;
        ALTER TABLE woredas ADD COLUMN IF NOT EXISTS name_am TEXT NOT NULL DEFAULT '';
        ALTER TABLE woredas ADD COLUMN IF NOT EXISTS name_en TEXT NOT NULL DEFAULT '';
        ALTER TABLE woredas ADD COLUMN IF NOT EXISTS name_ti TEXT NOT NULL DEFAULT '';
        ALTER TABLE woredas ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      `);

      // 6. Table: cities
      await client.query(`
        CREATE TABLE IF NOT EXISTS cities (
          id SERIAL PRIMARY KEY,
          woreda_id INTEGER NOT NULL REFERENCES woredas(id) ON DELETE CASCADE,
          name_am TEXT NOT NULL DEFAULT '',
          name_en TEXT NOT NULL DEFAULT '',
          name_ti TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      await client.query(`
        ALTER TABLE cities ADD COLUMN IF NOT EXISTS woreda_id INTEGER REFERENCES woredas(id) ON DELETE CASCADE;
        ALTER TABLE cities ADD COLUMN IF NOT EXISTS name_am TEXT NOT NULL DEFAULT '';
        ALTER TABLE cities ADD COLUMN IF NOT EXISTS name_en TEXT NOT NULL DEFAULT '';
        ALTER TABLE cities ADD COLUMN IF NOT EXISTS name_ti TEXT NOT NULL DEFAULT '';
        ALTER TABLE cities ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
      `);

      // 7. Table: products
      await client.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price INTEGER NOT NULL,
          condition TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          category_id INTEGER REFERENCES categories(id),
          seller_id INTEGER NOT NULL REFERENCES users(id),
          region_id INTEGER REFERENCES regions(id),
          woreda_id INTEGER REFERENCES woredas(id),
          city_id INTEGER REFERENCES cities(id),
          views INTEGER NOT NULL DEFAULT 0,
          featured BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      await client.query(`
        ALTER TABLE products ADD COLUMN IF NOT EXISTS condition TEXT NOT NULL DEFAULT 'new';
        ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
        ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);
        ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id INTEGER REFERENCES users(id);
        ALTER TABLE products ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES regions(id);
        ALTER TABLE products ADD COLUMN IF NOT EXISTS woreda_id INTEGER REFERENCES woredas(id);
        ALTER TABLE products ADD COLUMN IF NOT EXISTS city_id INTEGER REFERENCES cities(id);
        ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
      `);

      // 8. Table: product_images
      await client.query(`
        CREATE TABLE IF NOT EXISTS product_images (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          is_primary BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // 9. Table: inquiries
      await client.query(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          customer_id INTEGER REFERENCES users(id),
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_email TEXT,
          message TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          seller_id INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // 10. Table: orders
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id),
          customer_id INTEGER REFERENCES users(id),
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          delivery_address TEXT,
          quantity INTEGER NOT NULL DEFAULT 1,
          total_price INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          seller_id INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // 11. Table: administrator_audit_logs
      await client.query(`
        CREATE TABLE IF NOT EXISTS administrator_audit_logs (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER REFERENCES users(id),
          admin_email TEXT,
          action TEXT NOT NULL,
          details TEXT,
          ip_address TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // -------------------------------------------------------------
      // Seed default essential records if tables are empty
      // -------------------------------------------------------------

      // Default Website Settings
      await client.query(`
        INSERT INTO website_settings (key, value)
        VALUES 
          ('admin_whatsapp_number', '@brmiki21'),
          ('site_name', 'Mela Market – መላ ገበያ'),
          ('site_description', 'የኢትዮጵያ ታላቁ የመስመር ላይ የገበያ መድረክ')
        ON CONFLICT (key) DO NOTHING;
      `);

      // Default Categories if none exist
      const catCountRes = await client.query('SELECT count(*) as count FROM categories');
      if (Number(catCountRes.rows[0]?.count) === 0) {
        console.log('🌱 Seeding initial marketplace categories in Amharic, English and Tigrinya...');
        await client.query(`
          INSERT INTO categories (name_am, name_en, name_ti, slug, icon)
          VALUES
            ('ኤሌክትሮኒክስ', 'Electronics', 'ኤሌክትሮኒክስ', 'electronics', 'Smartphone'),
            ('የቤትና ቢሮ እቃዎች', 'Home & Furniture', 'ናይ ቤት ኣቑሑ', 'home-furniture', 'Home'),
            ('ተሽከርካሪዎች', 'Vehicles', 'ተሽከርከርቲ', 'vehicles', 'Car'),
            ('ፋሽንና አልባሳት', 'Fashion', 'ፋሽንን ክዳውንትን', 'fashion', 'Shirt'),
            ('ስልኮችና ታብሌቶች', 'Mobile Phones', 'ስልካትን ታብሌታትን', 'mobile-phones', 'Smartphone'),
            ('ኮምፒውተርና ላፕቶፕ', 'Computers & Laptops', 'ኮምፒውተራትን ላፕቶፓትን', 'computers-laptops', 'Laptop'),
            ('እርሻና ኢንዱስትሪ', 'Agriculture & Industry', 'ሕርሻን ኢንዱስትሪን', 'agriculture-industry', 'Wrench'),
            ('አገልግሎቶች', 'Services', 'ኣገልግሎታት', 'services', 'Briefcase')
          ON CONFLICT (slug) DO NOTHING;
        `);
      }

      // Default Regions, Woredas, Cities if none exist
      const regCountRes = await client.query('SELECT count(*) as count FROM regions');
      if (Number(regCountRes.rows[0]?.count) === 0) {
        console.log('🌱 Seeding initial Ethiopian regions, woredas and cities...');
        await client.query(`
          INSERT INTO regions (code, name_am, name_en, name_ti)
          VALUES
            ('AA', 'አዲስ አበባ', 'Addis Ababa', 'ኣዲስ ኣበባ'),
            ('OR', 'ኦሮሚያ', 'Oromia', 'ኦሮሚያ'),
            ('AM', 'አማራ', 'Amhara', 'ኣምሓራ'),
            ('TG', 'ትግራይ', 'Tigray', 'ትግራይ'),
            ('SD', 'ሲዳማ', 'Sidama', 'ሲዳማ'),
            ('DD', 'ድሬዳዋ', 'Dire Dawa', 'ድሬዳዋ')
          ON CONFLICT (code) DO NOTHING;
        `);

        // Get Addis Ababa ID
        const aaRes = await client.query("SELECT id FROM regions WHERE code = 'AA'");
        if (aaRes.rows[0]?.id) {
          const aaId = aaRes.rows[0].id;
          const wBoleRes = await client.query(`
            INSERT INTO woredas (region_id, name_am, name_en, name_ti)
            VALUES (${aaId}, 'ቦሌ', 'Bole', 'ቦሌ')
            RETURNING id;
          `);
          const wKirkosRes = await client.query(`
            INSERT INTO woredas (region_id, name_am, name_en, name_ti)
            VALUES (${aaId}, 'ቂርቆስ', 'Kirkos', 'ቂርቆስ')
            RETURNING id;
          `);
          const wYekaRes = await client.query(`
            INSERT INTO woredas (region_id, name_am, name_en, name_ti)
            VALUES (${aaId}, 'የካ', 'Yeka', 'የካ')
            RETURNING id;
          `);

          const boleId = wBoleRes.rows[0]?.id;
          const kirkosId = wKirkosRes.rows[0]?.id;
          const yekaId = wYekaRes.rows[0]?.id;

          if (boleId) {
            await client.query(`
              INSERT INTO cities (woreda_id, name_am, name_en, name_ti)
              VALUES 
                (${boleId}, 'ቦሌ መድኃኔዓለም', 'Bole Medhanealem', 'ቦሌ መድኃኔዓለም'),
                (${boleId}, 'ገርጂ', 'Gerji', 'ገርጂ');
            `);
          }
          if (kirkosId) {
            await client.query(`
              INSERT INTO cities (woreda_id, name_am, name_en, name_ti)
              VALUES (${kirkosId}, 'ካዛንቺስ', 'Kazanchis', 'ካዛንቺስ');
            `);
          }
          if (yekaId) {
            await client.query(`
              INSERT INTO cities (woreda_id, name_am, name_en, name_ti)
              VALUES (${yekaId}, 'መገናኛ', 'Megenagna', 'መገናኛ');
            `);
          }
        }
      }

      await client.query('COMMIT');
      console.log('✅ Neon PostgreSQL database schema verified and migrated successfully.');
      migrationCompleted = true;
      return true;
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('❌ Failed to run Neon schema migration:', err);
      migrationPromise = null;
      throw err;
    } finally {
      client.release();
    }
  })();

  return migrationPromise;
}
