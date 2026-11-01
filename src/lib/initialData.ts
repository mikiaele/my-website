import { Category, Product, User, Order } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-coffee',
    name_am: 'ቡና እና ቅመማቅመም',
    name_en: 'Coffee & Spices',
    slug: 'coffee-spices',
    icon: 'Coffee',
    description: 'Authentic Ethiopian Yirgacheffe, Sidama, Harar coffee beans, berbere and korarima.'
  },
  {
    id: 'cat-clothing',
    name_am: 'ባህላዊ አልባሳት',
    name_en: 'Traditional Clothing',
    slug: 'clothing',
    icon: 'Shirt',
    description: 'Handwoven Habesha kemis, netela, gabi, and Ethiopian cultural attire.'
  },
  {
    id: 'cat-electronics',
    name_am: 'ኤሌክትሮኒክስ እና መገልገያዎች',
    name_en: 'Electronics & Gadgets',
    slug: 'electronics',
    icon: 'Smartphone',
    description: 'Smartphones, laptops, accessories, and solar appliances with local warranty.'
  },
  {
    id: 'cat-crafts',
    name_am: 'የእጅ ስራዎች እና ሸክላ',
    name_en: 'Handcrafts & Pottery',
    slug: 'crafts',
    icon: 'Palette',
    description: 'Clay jebena, traditional wooden mesob, leather crafts, and Ethiopian cross art.'
  },
  {
    id: 'cat-food',
    name_am: 'የእህል እና የግብርና ምርቶች',
    name_en: 'Food & Grains',
    slug: 'food-grains',
    icon: 'Wheat',
    description: 'Pure Magna Teff, honey from Tigray/Gonder, and organic spices.'
  },
  {
    id: 'cat-beauty',
    name_am: 'የተፈጥሮ ጤና እና ውበት',
    name_en: 'Health & Beauty',
    slug: 'beauty',
    icon: 'Sparkles',
    description: 'Organic Ethiopian butter, black seed oil, herbal soaps, and frankincense.'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title_am: 'የይርጋጨፌ የተቆላ ቡና (1 ኪ.ግ ፕሪሚየም)',
    title_en: 'Yirgacheffe Grade 1 Roasted Coffee Beans (1kg)',
    price: 950,
    stock: 45,
    category_id: 'cat-coffee',
    condition: 'Brand New',
    description: 'Organic single-origin Ethiopian washed Arabica coffee grown in the high altitudes of Yirgacheffe. Floral aroma with citrus and jasmine tasting notes. Freshly medium-roasted in Addis Ababa.',
    image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
    seller_id: 'seller-1',
    seller_name: 'Buna Heritage Roastery',
    seller_phone: '0911223344',
    status: 'approved',
    created_at: '2026-10-25T08:30:00Z',
    rating: 4.9,
    reviews_count: 84
  },
  {
    id: 'prod-2',
    title_am: 'የባህላዊ ጥልፍ የሐበሻ ቀሚስ ከነጠላ ጋር',
    title_en: 'Handmade Habesha Kemis with Embroidered Netela',
    price: 8500,
    stock: 8,
    category_id: 'cat-clothing',
    condition: 'Brand New',
    description: 'Authentic 100% Ethiopian handwoven cotton (shemane) dress with intricate Tilet embroidery in gold, green, and burgundy. Includes matching Netela scarf.',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    seller_id: 'seller-2',
    seller_name: 'Sheba Traditional Designs',
    seller_phone: '0912445566',
    status: 'approved',
    created_at: '2026-10-27T11:15:00Z',
    rating: 5.0,
    reviews_count: 32
  },
  {
    id: 'prod-3',
    title_am: 'የሸክላ ጀበና እና ሲኒ ማስቀመጫ ስብስብ',
    title_en: 'Traditional Clay Coffee Jebena Set with Saucers',
    price: 1200,
    stock: 19,
    category_id: 'cat-crafts',
    condition: 'Brand New',
    description: 'Locally handcrafted black clay jebena kettle designed for traditional Ethiopian coffee ceremonies. Includes 6 decorated ceramic kini cups and clay burner base.',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    seller_id: 'seller-3',
    seller_name: 'Entoto Artisan Collective',
    seller_phone: '0920112233',
    status: 'approved',
    created_at: '2026-10-28T14:20:00Z',
    rating: 4.8,
    reviews_count: 47
  },
  {
    id: 'prod-4',
    title_am: 'የደብረዘይት ነጭ ማኛ ጤፍ (25 ኪ.ግ በከረጢት)',
    title_en: 'Debre Zeit Magna White Teff Flour (25kg Bag)',
    price: 3600,
    stock: 60,
    category_id: 'cat-food',
    condition: 'Brand New',
    description: 'First grade 100% pure white Magna Teff grown in fertile Debre Zeit volcanic soil. Cleaned, destoned, and finely milled for soft, nutritious authentic injera.',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    seller_id: 'seller-1',
    seller_name: 'Buna Heritage Roastery',
    seller_phone: '0911223344',
    status: 'approved',
    created_at: '2026-10-29T09:40:00Z',
    rating: 4.9,
    reviews_count: 65
  },
  {
    id: 'prod-5',
    title_am: 'ሳምሰንግ ጋላክሲ ኤ55 5ጂ (128 ጊባ / 8 ጊባ ራም)',
    title_en: 'Samsung Galaxy A55 5G (128GB / 8GB RAM)',
    price: 39500,
    stock: 12,
    category_id: 'cat-electronics',
    condition: 'Brand New',
    description: 'Original brand new Samsung Galaxy A55 with 6.6-inch Super AMOLED 120Hz display, 50MP OIS camera, 5000mAh battery. 1-year local warranty in Addis Ababa.',
    image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    seller_id: 'seller-4',
    seller_name: 'Bole Digital Electronics',
    seller_phone: '0933778899',
    status: 'approved',
    created_at: '2026-10-30T16:00:00Z',
    rating: 4.7,
    reviews_count: 19
  },
  {
    id: 'prod-6',
    title_am: 'የተመረጠ ኦርጋኒክ የበረበሬ ቅመም (2 ኪ.ግ)',
    title_en: 'Artisanal Organic Berbere Spice Blend (2kg)',
    price: 1100,
    stock: 35,
    category_id: 'cat-coffee',
    condition: 'Brand New',
    description: 'Authentic Ethiopian red pepper berbere seasoned with korarima, garlic, ginger, rue, and sacred herbs. Sun-dried and stone pounded.',
    image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    seller_id: 'seller-3',
    seller_name: 'Entoto Artisan Collective',
    seller_phone: '0920112233',
    status: 'approved',
    created_at: '2026-10-31T10:00:00Z',
    rating: 4.9,
    reviews_count: 42
  },
  {
    id: 'prod-7',
    title_am: 'አፕል ማክቡክ ፕሮ ኤም 2 (16 ጊባ / 512 ጊባ ኤስኤስዲ)',
    title_en: 'Apple MacBook Pro M2 (16GB / 512GB SSD) Space Gray',
    price: 115000,
    stock: 3,
    category_id: 'cat-electronics',
    condition: 'Used',
    description: 'Gently used MacBook Pro 14-inch in pristine condition (98% battery health). Includes original 67W MagSafe fast charger and protective sleeve. Clean iCloud.',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    seller_id: 'seller-4',
    seller_name: 'Bole Digital Electronics',
    seller_phone: '0933778899',
    status: 'pending',
    created_at: '2026-11-01T09:10:00Z',
    rating: 5.0,
    reviews_count: 7
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    email: 'mikiaelebrhane@gmail.com',
    full_name: 'Mikiael Elebrhane (Lead Admin)',
    role: 'admin',
    phone: '0911002233',
    city: 'Addis Ababa',
    is_verified: true,
    created_at: '2026-09-01T00:00:00Z'
  },
  {
    id: 'seller-1',
    email: 'buna.heritage@mela.et',
    full_name: 'Buna Heritage Roastery',
    role: 'seller',
    phone: '0911223344',
    city: 'Addis Ababa (Kazanchis)',
    is_verified: true,
    created_at: '2026-09-10T10:00:00Z'
  },
  {
    id: 'seller-2',
    email: 'sheba.designs@mela.et',
    full_name: 'Sheba Traditional Designs',
    role: 'seller',
    phone: '0912445566',
    city: 'Addis Ababa (Shiro Meda)',
    is_verified: true,
    created_at: '2026-09-15T14:30:00Z'
  },
  {
    id: 'seller-3',
    email: 'entoto.artisans@mela.et',
    full_name: 'Entoto Artisan Collective',
    role: 'seller',
    phone: '0920112233',
    city: 'Addis Ababa (Entoto)',
    is_verified: true,
    created_at: '2026-09-20T09:00:00Z'
  },
  {
    id: 'seller-4',
    email: 'bole.digital@mela.et',
    full_name: 'Bole Digital Electronics',
    role: 'seller',
    phone: '0933778899',
    city: 'Addis Ababa (Bole Medhanialem)',
    is_verified: true,
    created_at: '2026-09-25T11:45:00Z'
  },
  {
    id: 'usr-cust-1',
    email: 'alemu.tadesse@gmail.com',
    full_name: 'Alemu Tadesse',
    role: 'customer',
    phone: '0944556677',
    city: 'Hawassa',
    is_verified: true,
    created_at: '2026-10-05T12:00:00Z'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2026-9081',
    customer_name: 'Hanna Mengistu',
    customer_email: 'hanna.m@yahoo.com',
    customer_phone: '0911789012',
    delivery_city: 'Addis Ababa (Bole)',
    delivery_address: 'House #412, Behind Edna Mall',
    payment_method: 'telebirr',
    total_etb: 9450,
    status: 'processing',
    created_at: '2026-10-31T14:22:00Z',
    items: [
      {
        product_id: 'prod-1',
        title_en: 'Yirgacheffe Grade 1 Roasted Coffee Beans (1kg)',
        title_am: 'የይርጋጨፌ የተቆላ ቡና (1 ኪ.ግ ፕሪሚየም)',
        price: 950,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80'
      },
      {
        product_id: 'prod-2',
        title_en: 'Handmade Habesha Kemis with Embroidered Netela',
        title_am: 'የባህላዊ ጥልፍ የሐበሻ ቀሚስ ከነጠላ ጋር',
        price: 8500,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80'
      }
    ],
    notes: 'Please call before arrival'
  },
  {
    id: 'ORD-2026-9082',
    customer_name: 'Yared Bekele',
    customer_email: 'yared.bek@gmail.com',
    customer_phone: '0922334455',
    delivery_city: 'Addis Ababa (CMC)',
    delivery_address: 'Michael Roundabout, Bldg 4, Apt 2',
    payment_method: 'cbe_birr',
    total_etb: 4800,
    status: 'delivered',
    created_at: '2026-10-30T10:15:00Z',
    items: [
      {
        product_id: 'prod-4',
        title_en: 'Debre Zeit Magna White Teff Flour (25kg Bag)',
        title_am: 'የደብረዘይት ነጭ ማኛ ጤፍ (25 ኪ.ግ በከረጢት)',
        price: 3600,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80'
      },
      {
        product_id: 'prod-3',
        title_en: 'Traditional Clay Coffee Jebena Set with Saucers',
        title_am: 'የሸክላ ጀበና እና ሲኒ ማስቀመጫ ስብስብ',
        price: 1200,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
      }
    ]
  }
];
