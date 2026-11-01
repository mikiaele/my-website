import { Category, Product } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'coffee-spices',
    name_en: 'Coffee & Spices',
    name_am: 'ቡና እና ቅመማ ቅመም',
    icon: 'Coffee',
    display_order: 1,
  },
  {
    id: 'traditional-wear',
    name_en: 'Traditional Wear & Kemis',
    name_am: 'የሀበሻ ቀሚስ እና ባህላዊ አልባሳት',
    icon: 'Shirt',
    display_order: 2,
  },
  {
    id: 'electronics',
    name_en: 'Electronics & Phones',
    name_am: 'ኤሌክትሮኒክስ እና ስልኮች',
    icon: 'Smartphone',
    display_order: 3,
  },
  {
    id: 'home-crafts',
    name_en: 'Home, Mesob & Jebena',
    name_am: 'መሶብ፣ ጀበና እና የቤት እቃዎች',
    icon: 'Home',
    display_order: 4,
  },
  {
    id: 'leather-goods',
    name_en: 'Ethiopian Leather & Shoes',
    name_am: 'የቆዳ ውጤቶች እና ጫማዎች',
    icon: 'Briefcase',
    display_order: 5,
  },
  {
    id: 'teff-food',
    name_en: 'Teff & Natural Food',
    name_am: 'ጤፍ እና የተፈጥሮ ምግቦች',
    icon: 'Wheat',
    display_order: 6,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    seller_id: 'seller-abebe',
    seller_name: 'Abebe Bikila Coffee Exporters',
    title: 'Yirgacheffe Grade 1 Specialty Roast Coffee (1kg)',
    title_am: 'የይርጋጨፌ አንደኛ ደረጃ የቆላ ቡና (1 ኪ.ግ)',
    description: 'Freshly roasted whole bean Ethiopian Yirgacheffe specialty coffee. Floral aroma with citrus and jasmine notes, freshly packed in Addis Ababa.',
    price: 950,
    category_id: 'coffee-spices',
    category_name: 'Coffee & Spices',
    images: [
      'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 45,
    condition: 'new', // አዲስ / Brand New
    is_featured: true,
    rating: 4.9,
    reviews_count: 84,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'prod-2',
    seller_id: 'seller-selam',
    seller_name: 'Selam Habesha Weavers',
    title: 'Hand-Woven Royal Habesha Kemis with Tilf Embroidery',
    title_am: 'በእጅ የተሸመነ የሀበሻ ቀሚስ ከጥልፍ ጋር',
    description: 'Authentic Ethiopian cotton dress (Habesha Kemis) with intricate gold and green border embroidery. Includes matching Netela scarf.',
    price: 8500,
    category_id: 'traditional-wear',
    category_name: 'Traditional Wear & Kemis',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 8,
    condition: 'new', // አዲስ / Brand New
    is_featured: true,
    rating: 5.0,
    reviews_count: 32,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'prod-3',
    seller_id: 'seller-solomon',
    seller_name: 'Solomon Tech Bole',
    title: 'Samsung Galaxy S22 Ultra 256GB Phantom Black',
    title_am: 'ሳምሰንግ ጋላክሲ S22 Ultra 256GB',
    description: 'Carefully inspected used smartphone. Battery health 93%, dual SIM, no scratches, original box and fast charger included.',
    price: 36000,
    category_id: 'electronics',
    category_name: 'Electronics & Phones',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 2,
    condition: 'used', // ያገለገለ / Used
    is_featured: true,
    rating: 4.7,
    reviews_count: 14,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'prod-4',
    seller_id: 'seller-chaltu',
    seller_name: 'Chaltu Traditional Arts',
    title: 'Traditional Black Clay Ethiopian Jebena (Coffee Pot)',
    title_am: 'ባህላዊ የሸክላ ጀበና ከማስቀመጫው ጋር',
    description: 'Handmade clay Jebena pot with traditional braided grass base ring. Tested fire-safe, perfect for traditional coffee ceremonies.',
    price: 750,
    category_id: 'home-crafts',
    category_name: 'Home, Mesob & Jebena',
    images: [
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 28,
    condition: 'new', // አዲስ / Brand New
    is_featured: true,
    rating: 4.8,
    reviews_count: 51,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: 'prod-5',
    seller_id: 'seller-tadesse',
    seller_name: 'Tadesse Leather Crafts',
    title: 'Genuine Ethiopian Pull-Up Leather Laptop Bag',
    title_am: 'ከእውነተኛ የኢትዮጵያ ቆዳ የተሰራ የላፕቶፕ ቦርሳ',
    description: 'Premium Ethiopian cowhide leather briefcase for 15.6" laptops. Hand-stitched with brass buckles and adjustable shoulder strap.',
    price: 3400,
    category_id: 'leather-goods',
    category_name: 'Ethiopian Leather & Shoes',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 12,
    condition: 'new', // አዲስ / Brand New
    is_featured: true,
    rating: 4.9,
    reviews_count: 42,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'prod-6',
    seller_id: 'seller-solomon',
    seller_name: 'Solomon Tech Bole',
    title: 'HP EliteBook 840 G6 Intel i7 16GB RAM 512GB SSD',
    title_am: 'HP EliteBook 840 G6 i7 16GB ራም (ያገለገለ)',
    description: 'Clean business laptop in excellent condition. Battery lasts 5+ hours, backlit keyboard, genuine Windows 11 Pro.',
    price: 28500,
    category_id: 'electronics',
    category_name: 'Electronics & Phones',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 3,
    condition: 'used', // ያገለገለ / Used
    is_featured: true,
    rating: 4.6,
    reviews_count: 9,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: 'prod-7',
    seller_id: 'seller-abebe',
    seller_name: 'Abebe Bikila Coffee Exporters',
    title: 'Sidama Organic Washed Green Coffee Beans (2kg)',
    title_am: 'የሲዳማ ኦርጋኒክ ጥሬ ቡና (2 ኪ.ግ)',
    description: 'Unroasted specialty green coffee beans sourced directly from farmer cooperatives in Hawassa / Sidama region.',
    price: 1400,
    category_id: 'coffee-spices',
    category_name: 'Coffee & Spices',
    images: [
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 30,
    condition: 'new', // አዲስ / Brand New
    is_featured: false,
    rating: 4.8,
    reviews_count: 22,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
  {
    id: 'prod-8',
    seller_id: 'seller-chaltu',
    seller_name: 'Chaltu Traditional Arts',
    title: 'Vibrant Colorful Woven Ethiopian Mesob Dining Basket',
    title_am: 'በባህል ጥልፍ የተሰራ ባለቀለም መሶብ',
    description: 'Large centerpiece hand-woven Mesob basket used for serving Injera. Made with natural dried grass and dyed threads.',
    price: 4800,
    category_id: 'home-crafts',
    category_name: 'Home, Mesob & Jebena',
    images: [
      'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 5,
    condition: 'new', // አዲስ / Brand New
    is_featured: true,
    rating: 5.0,
    reviews_count: 18,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 'prod-9',
    seller_id: 'seller-selam',
    seller_name: 'Selam Habesha Weavers',
    title: 'Four-Layer Hand-Woven Cotton Men’s Gabi (ጋቢ)',
    title_am: 'አራት እጥፍ ንፁህ የጥጥ የሀበሻ ጋቢ',
    description: 'Thick, ultra-soft hand-spun Ethiopian cotton blanket with colorful Tibeb hem. Keeps you warm during cold Addis evenings.',
    price: 2900,
    category_id: 'traditional-wear',
    category_name: 'Traditional Wear & Kemis',
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 14,
    condition: 'new', // አዲስ / Brand New
    is_featured: true,
    rating: 4.9,
    reviews_count: 29,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11).toISOString(),
  },
  {
    id: 'prod-10',
    seller_id: 'seller-tadesse',
    seller_name: 'Tadesse Leather Crafts',
    title: 'Anbessa Handcrafted Men’s Dress Leather Shoes',
    title_am: 'የወንዶች ክላሲክ የቆዳ ጫማ',
    description: '100% full-grain calf leather formal shoes with durable Goodyear welted sole. Handcrafted in Addis Ababa.',
    price: 3800,
    category_id: 'leather-goods',
    category_name: 'Ethiopian Leather & Shoes',
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80'
    ],
    stock: 9,
    condition: 'new', // አዲስ / Brand New
    is_featured: true,
    rating: 4.7,
    reviews_count: 36,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  }
];
