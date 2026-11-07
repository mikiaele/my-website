import bcrypt from 'bcryptjs';
import { db } from './index.ts';
import {
  users,
  categories,
  regions,
  woredas,
  cities,
  products,
  productImages,
  websiteSettings,
  administratorAuditLogs,
} from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seed() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      '⚠️ DATABASE_URL is not set in environment. Please configure DATABASE_URL in Google AI Studio Secrets with your Neon connection URL before seeding.'
    );
    return;
  }
  console.log('Starting Mela Market database seed...');

  // 1. Settings
  await db
    .insert(websiteSettings)
    .values([
      { key: 'admin_whatsapp_number', value: '+251911223344' },
      { key: 'site_name', value: 'Mela Market – መላ ገበያ' },
      { key: 'site_description', value: 'የኢትዮጵያ ታላቁ የመስመር ላይ የገበያ መድረክ' },
    ])
    .onConflictDoNothing();

  // 2. Admin & Sellers
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const sellerPassword = await bcrypt.hash('Seller@12345', 10);
  const customerPassword = await bcrypt.hash('Customer@12345', 10);

  const [adminUser] = await db
    .insert(users)
    .values({
      uid: 'admin_user_001',
      email: 'admin@melamarket.et',
      name: 'Mela Market Admin (ዋና አስተዳዳሪ)',
      phone: '+251911000111',
      role: 'admin',
      passwordHash: adminPassword,
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: { role: 'admin', passwordHash: adminPassword },
    })
    .returning();

  const [seller1] = await db
    .insert(users)
    .values({
      uid: 'seller_user_dawit',
      email: 'dawit@melamarket.et',
      name: 'ዳዊት ኤሌክትሮኒክስ (Dawit Electronics)',
      phone: '+251912345678',
      role: 'seller',
      passwordHash: sellerPassword,
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: { role: 'seller', passwordHash: sellerPassword },
    })
    .returning();

  const [seller2] = await db
    .insert(users)
    .values({
      uid: 'seller_user_selam',
      email: 'selam@melamarket.et',
      name: 'ሰላም የቤትና ፋሽን እቃዎች (Selam Furnishing)',
      phone: '+251922334455',
      role: 'seller',
      passwordHash: sellerPassword,
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: { role: 'seller', passwordHash: sellerPassword },
    })
    .returning();

  const [customer1] = await db
    .insert(users)
    .values({
      uid: 'customer_user_abebe',
      email: 'abebe@example.com',
      name: 'አበበ ከበደ (Abebe Kebede)',
      phone: '+251933445566',
      role: 'customer',
      passwordHash: customerPassword,
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: { role: 'customer', passwordHash: customerPassword },
    })
    .returning();

  // 3. Regions, Woredas, Cities
  const regionData = [
    { code: 'AA', nameAm: 'አዲስ አበባ', nameEn: 'Addis Ababa', nameTi: 'ኣዲስ ኣበባ' },
    { code: 'OR', nameAm: 'ኦሮሚያ', nameEn: 'Oromia', nameTi: 'ኦሮሚያ' },
    { code: 'AM', nameAm: 'አማራ', nameEn: 'Amhara', nameTi: 'ኣምሓራ' },
    { code: 'TG', nameAm: 'ትግራይ', nameEn: 'Tigray', nameTi: 'ትግራይ' },
    { code: 'SD', nameAm: 'ሲዳማ', nameEn: 'Sidama', nameTi: 'ሲዳማ' },
    { code: 'DD', nameAm: 'ድሬዳዋ', nameEn: 'Dire Dawa', nameTi: 'ድሬዳዋ' },
  ];

  for (const r of regionData) {
    const [reg] = await db
      .insert(regions)
      .values(r)
      .onConflictDoUpdate({ target: regions.code, set: { nameAm: r.nameAm } })
      .returning();

    if (r.code === 'AA') {
      const [woredaBole] = await db
        .insert(woredas)
        .values({
          regionId: reg.id,
          nameAm: 'ቦሌ',
          nameEn: 'Bole',
          nameTi: 'ቦሌ',
        })
        .returning();

      const [woredaKirkos] = await db
        .insert(woredas)
        .values({
          regionId: reg.id,
          nameAm: 'ቂርቆስ',
          nameEn: 'Kirkos',
          nameTi: 'ቂርቆስ',
        })
        .returning();

      const [woredaYeka] = await db
        .insert(woredas)
        .values({
          regionId: reg.id,
          nameAm: 'የካ',
          nameEn: 'Yeka',
          nameTi: 'የካ',
        })
        .returning();

      await db.insert(cities).values([
        { woredaId: woredaBole.id, nameAm: 'ቦሌ መድኃኔዓለም', nameEn: 'Bole Medhanealem', nameTi: 'ቦሌ መድኃኔዓለም' },
        { woredaId: woredaBole.id, nameAm: 'ገርጂ', nameEn: 'Gerji', nameTi: 'ገርጂ' },
        { woredaId: woredaKirkos.id, nameAm: 'ካዛንቺስ', nameEn: 'Kazanchis', nameTi: 'ካዛንቺስ' },
        { woredaId: woredaYeka.id, nameAm: 'መገናኛ', nameEn: 'Megenagna', nameTi: 'መገናኛ' },
      ]);
    } else if (r.code === 'OR') {
      const [woredaAdaa] = await db
        .insert(woredas)
        .values({
          regionId: reg.id,
          nameAm: 'አዳማ',
          nameEn: 'Adama',
          nameTi: 'ኣዳማ',
        })
        .returning();

      const [woredaBishoftu] = await db
        .insert(woredas)
        .values({
          regionId: reg.id,
          nameAm: 'ቢሾፍቱ',
          nameEn: 'Bishoftu',
          nameTi: 'ቢሾፍቱ',
        })
        .returning();

      await db.insert(cities).values([
        { woredaId: woredaAdaa.id, nameAm: 'አዳማ ከተማ (ናዝሬት)', nameEn: 'Adama City', nameTi: 'ኣዳማ ከተማ' },
        { woredaId: woredaBishoftu.id, nameAm: 'ቢሾፍቱ ከተማ (ደብረ ዘይት)', nameEn: 'Bishoftu Town', nameTi: 'ቢሾፍቱ ከተማ' },
      ]);
    } else if (r.code === 'AM') {
      const [woredaBahirDar] = await db
        .insert(woredas)
        .values({
          regionId: reg.id,
          nameAm: 'ባሕር ዳር',
          nameEn: 'Bahir Dar',
          nameTi: 'ባሕር ዳር',
        })
        .returning();

      await db.insert(cities).values([
        { woredaId: woredaBahirDar.id, nameAm: 'ቀበሌ 04', nameEn: 'Kebele 04', nameTi: 'ቀበሌ 04' },
        { woredaId: woredaBahirDar.id, nameAm: 'ቀበሌ 11', nameEn: 'Kebele 11', nameTi: 'ቀበሌ 11' },
      ]);
    } else if (r.code === 'TG') {
      const [woredaMekelle] = await db
        .insert(woredas)
        .values({
          regionId: reg.id,
          nameAm: 'መቐለ',
          nameEn: 'Mekelle',
          nameTi: 'መቐለ',
        })
        .returning();

      await db.insert(cities).values([
        { woredaId: woredaMekelle.id, nameAm: 'ሓወልቲ', nameEn: 'Hawelti', nameTi: 'ሓወልቲ' },
        { woredaId: woredaMekelle.id, nameAm: 'ዓዲ ሓውሲ', nameEn: 'Adi Hawsi', nameTi: 'ዓዲ ሓውሲ' },
      ]);
    }
  }

  // Fetch db references for products
  const dbCats = await db.select().from(categories);
  const dbRegions = await db.select().from(regions);
  const dbWoredas = await db.select().from(woredas);
  const dbCities = await db.select().from(cities);

  const elecCat = dbCats.find((c) => c.slug === 'electronics') || dbCats[0];
  const homeCat = dbCats.find((c) => c.slug === 'home-furniture') || dbCats[0];
  const vehCat = dbCats.find((c) => c.slug === 'vehicles') || dbCats[0];
  const fashCat = dbCats.find((c) => c.slug === 'fashion') || dbCats[0];

  const aaRegion = dbRegions.find((r) => r.code === 'AA') || dbRegions[0];
  const boleWoreda = dbWoredas.find((w) => w.nameEn === 'Bole') || dbWoredas[0];
  const boleCity = dbCities.find((c) => c.nameEn === 'Bole Medhanealem') || dbCities[0];

  const orRegion = dbRegions.find((r) => r.code === 'OR') || dbRegions[0];
  const adamaWoreda = dbWoredas.find((w) => w.nameEn === 'Adama') || dbWoredas[0];
  const adamaCity = dbCities.find((c) => c.nameEn === 'Adama City') || dbCities[0];

  // Seed Products (both New and Used conditions!)
  const sampleProducts = [
    {
      title: 'Samsung Galaxy S24 Ultra (512GB) - አዲስ ኦሪጅናል',
      description: 'በካርቶኑ ያልተከፈተ አዲስ ሳምሰንግ ጋላክሲ ስልከ። ሙሉ ካሜራ ጥራት፣ ፈጣን ቻርጀር እና 1 አመት ዋስትና ያለው።',
      price: 135000,
      condition: 'new',
      status: 'active',
      categoryId: elecCat.id,
      sellerId: seller1.id,
      regionId: aaRegion.id,
      woredaId: boleWoreda.id,
      cityId: boleCity.id,
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'HP Pavilion 15 Core i7 16GB RAM 512GB SSD - ያገለገለ ንጹህ',
      description: 'በጣም በጥሩ ይዞታ ላይ የሚገኝ ላፕቶፕ፣ ለግራፊክስ እና ለኮዲንግ ተመራጭ። ባትሪው ከ4 ሰዓት በላይ ያቆያል። ምንም ጭረት የለውም።',
      price: 58000,
      condition: 'used',
      status: 'active',
      categoryId: elecCat.id,
      sellerId: seller1.id,
      regionId: aaRegion.id,
      woredaId: boleWoreda.id,
      cityId: boleCity.id,
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'የቱርክ ሳሎን ሶፋ ስብስብ (L-Shape Sofa Set) - አዲስ',
      description: 'ከቱርክ የመጣ ዘመናዊ የሳሎን ሶፋ። እጅግ የሚያምር ጨርቅ እና ጠንካራ የእንጨት ፍሬም ያለው። ከነ ትራስ ጭምር።',
      price: 75000,
      condition: 'new',
      status: 'active',
      categoryId: homeCat.id,
      sellerId: seller2.id,
      regionId: aaRegion.id,
      woredaId: boleWoreda.id,
      cityId: boleCity.id,
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'የእንጨት መመገቢያ ጠረጴዛ ከ 6 ወንበሮች ጋር - ያገለገለ',
      description: 'ከወይራ እንጨት የተሰራ ጠንካራ የመመገቢያ ጠረጴዛ። ለ2 አመት የተጠቀመበት ነገር ግን ንጹህና ያልተሰበረ።',
      price: 32000,
      condition: 'used',
      status: 'active',
      categoryId: homeCat.id,
      sellerId: seller2.id,
      regionId: orRegion.id,
      woredaId: adamaWoreda.id,
      cityId: adamaCity.id,
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Toyota Vitz 2018 ሞዴል - ያገለገለች መኪና',
      description: 'አውቶማቲክ፣ ነጭ ቀለም፣ የመጀመሪያ እጅ፣ ምንም አደጋ ያልደረሰባት። በ100% ቴክኒካዊ ብቃት ላይ የምትገኝ።',
      price: 1850000,
      condition: 'used',
      status: 'active',
      categoryId: vehCat.id,
      sellerId: seller1.id,
      regionId: aaRegion.id,
      woredaId: boleWoreda.id,
      cityId: boleCity.id,
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'የባህል ጥልፍ የሐበሻ ቀሚስ - አዲስ',
      description: 'በእጅ የተጠለፈ ምርጥ የጥበብ ቀሚስ ለሰርግና ለበዓላት። ከነ ነጠላው የተሟላ። በሁሉም ሳይዝ ይገኛል።',
      price: 18000,
      condition: 'new',
      status: 'active',
      categoryId: fashCat.id,
      sellerId: seller2.id,
      regionId: aaRegion.id,
      woredaId: boleWoreda.id,
      cityId: boleCity.id,
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Sony Alpha A7 IV Mirrorless Camera - ያገለገለ',
      description: 'ለቪዲዮግራፊና ፎቶግራፊ ምርጥ ካሜራ። ከ 28-70mm ሌንስ እና 2 ተጨማሪ ባትሪዎች ጋር። ሻተር ካውንት 12,000 ብቻ።',
      price: 110000,
      condition: 'used',
      status: 'active',
      categoryId: elecCat.id,
      sellerId: seller1.id,
      regionId: aaRegion.id,
      woredaId: boleWoreda.id,
      cityId: boleCity.id,
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'ኦሪጅናል የቆዳ ጃኬት (Pure Leather Jacket) - አዲስ',
      description: 'ከእውነተኛ የኢትዮጵያ ቆዳ የተሰራ ጥቁር የወንዶች ጃኬት። ቅዝቃዜ የሚከላከል እና የሚያምር።',
      price: 12500,
      condition: 'new',
      status: 'active',
      categoryId: fashCat.id,
      sellerId: seller2.id,
      regionId: aaRegion.id,
      woredaId: boleWoreda.id,
      cityId: boleCity.id,
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const item of sampleProducts) {
    const { imageUrl, ...prodData } = item;
    const [insertedProd] = await db.insert(products).values(prodData).returning();
    await db.insert(productImages).values({
      productId: insertedProd.id,
      imageUrl: imageUrl,
      isPrimary: true,
    });
  }

  // Audit log
  await db.insert(administratorAuditLogs).values({
    adminId: adminUser.id,
    adminEmail: adminUser.email,
    action: 'SYSTEM_BOOTSTRAP',
    details: 'Initial seed of categories, locations, users, and marketplace products completed.',
    ipAddress: '127.0.0.1',
  });

  console.log('Mela Market database seed completed successfully!');
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
