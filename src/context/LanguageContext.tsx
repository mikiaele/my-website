import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

export interface Translations {
  // Brand & Nav
  brand_name: string;
  brand_sub: string;
  search_placeholder: string;
  categories: string;
  all_categories: string;
  deals: string;
  sell: string;
  seller_dashboard: string;
  admin_dashboard: string;
  sign_in: string;
  register: string;
  sign_out: string;
  cart: string;
  orders: string;
  wishlist: string;
  my_account: string;
  welcome_user: string;

  // Hero
  hero_tag: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_description: string;
  browse_products: string;
  start_selling_now: string;
  fast_delivery_title: string;
  fast_delivery_desc: string;
  verified_quality_title: string;
  verified_quality_desc: string;
  secure_payments_title: string;
  secure_payments_desc: string;
  ethiopian_support_title: string;
  ethiopian_support_desc: string;

  // Products
  featured_products: string;
  featured_products_sub: string;
  trending_deals: string;
  trending_deals_sub: string;
  condition_label: string;
  condition_new: string;
  condition_used: string;
  condition_new_full: string;
  condition_used_full: string;
  add_to_cart: string;
  added_to_cart: string;
  view_details: string;
  in_stock: string;
  out_of_stock: string;
  currency: string;
  filter_all: string;
  filter_new: string;
  filter_used: string;
  filter_price: string;
  no_products_found: string;
  items_available: string;

  // Registration & Auth
  auth_register_title: string;
  auth_register_subtitle: string;
  auth_login_title: string;
  auth_login_subtitle: string;
  full_name: string;
  email: string;
  password: string;
  phone_number: string;
  city: string;
  select_city: string;
  register_button: string;
  login_button: string;
  already_have_account: string;
  need_an_account: string;
  register_once_note: string;
  seller_role_granted_note: string;
  demo_login: string;
  fill_all_fields: string;
  registration_successful: string;
  login_successful: string;

  // Seller Dashboard
  seller_hub: string;
  seller_hub_desc: string;
  instant_selling_notice: string;
  add_product: string;
  my_products: string;
  my_sales: string;
  total_inventory: string;
  total_sales: string;
  product_name: string;
  product_description: string;
  price_etb: string;
  category_select: string;
  product_images: string;
  product_images_help: string;
  image_url_placeholder: string;
  available_stock: string;
  product_condition: string;
  save_product: string;
  product_saved_success: string;
  product_deleted_success: string;
  edit_product: string;
  delete_product: string;
  confirm_delete: string;
  no_seller_products: string;
  start_adding_products: string;

  // Cart & Checkout
  shopping_cart: string;
  cart_empty: string;
  cart_empty_desc: string;
  subtotal: string;
  shipping: string;
  free_shipping: string;
  total: string;
  checkout: string;
  apply_coupon: string;
  coupon_placeholder: string;
  delivery_address: string;
  payment_method: string;
  place_order: string;
  order_success: string;
  order_success_desc: string;
  continue_shopping: string;

  // Admin & SQL
  admin_title: string;
  admin_desc: string;
  supabase_migration_tab: string;
  copy_sql: string;
  sql_copied: string;
  apply_migration_note: string;
  close: string;
}

const translations: Record<Language, Translations> = {
  am: {
    // Brand & Nav
    brand_name: 'ሜላ ገበያ',
    brand_sub: 'የኢትዮጵያ ዲጂታል የገበያ አውታር',
    search_placeholder: 'ምርቶችን፣ ኤሌክትሮኒክስ፣ ባህላዊ ልብሶችን ፈልግ...',
    categories: 'የምርት ክፍሎች',
    all_categories: 'ሁሉንም ክፍሎች ይመልከቱ',
    deals: 'ቅናሾች',
    sell: 'ይሽጡ',
    seller_dashboard: 'የሻጭ ዳሽቦርድ',
    admin_dashboard: 'አስተዳዳሪ',
    sign_in: 'ይግቡ',
    register: 'ይመዝገቡ',
    sign_out: 'ይውጡ',
    cart: 'ጋሪ',
    orders: 'ትዕዛዞች',
    wishlist: 'የምኞት ዝርዝር',
    my_account: 'የእኔ መለያ',
    welcome_user: 'እንኳን ደህና መጡ',

    // Hero
    hero_tag: 'በኢትዮጵያ ቀዳሚ የገበያ ቦታ • MELA MARKET',
    hero_title_1: 'የሚፈልጉትን ሁሉ',
    hero_title_2: 'በጥራት እና በተመጣጣኝ ዋጋ ያግኙ',
    hero_description: 'ኤሌክትሮኒክስ፣ ታዋቂው የኢትዮጵያ ቡና፣ ባህላዊ አልባሳት፣ አዲስ እና በቅናሽ የቀረቡ ያገለገሉ እቃዎች በአስተማማኝ ሁኔታ ከቀጥታ ሻጮች።',
    browse_products: 'ምርቶችን ያስሱ',
    start_selling_now: 'ዕቃዎችን ይሽጡ',
    fast_delivery_title: 'ፈጣን ማድረስ',
    fast_delivery_desc: 'በአዲስ አበባ እና በክልል ከተሞች አስተማማኝ አድራሻ ማድረስ',
    verified_quality_title: 'የተረጋገጠ ጥራት',
    verified_quality_desc: 'አዲስ እና በታማኝነት የተፈተሹ ያገለገሉ ምርቶች',
    secure_payments_title: 'ደህንነቱ የተጠበቀ ክፍያ',
    secure_payments_desc: 'በቴሌብር፣ በሲቢኢ ብር ወይም ዕቃው ሲደርስ በጥሬ ገንዘብ',
    ethiopian_support_title: '24/7 የደንበኞች ድጋፍ',
    ethiopian_support_desc: 'በአማርኛ እና በእንግሊዝኛ ፈጣን የደንበኛ እገዛ',

    // Products
    featured_products: 'ተመራጭ ምርቶች',
    featured_products_sub: 'ጥራት ያላቸውና በገበያው ተወዳጅነትን ያተረፉ ዕቃዎች',
    trending_deals: 'ልዩ ቅናሾች',
    trending_deals_sub: 'ዛሬ ብቻ የሚገኙ ምርጥ የዋጋ ቅናሾች',
    condition_label: 'ሁኔታ',
    condition_new: 'አዲስ',
    condition_used: 'ያገለገለ',
    condition_new_full: 'አዲስ / Brand New',
    condition_used_full: 'ያገለገለ / Used',
    add_to_cart: 'ወደ ጋሪ ጨምር',
    added_to_cart: 'ወደ ጋሪ ተጨምሯል',
    view_details: 'ዝርዝር ይመልከቱ',
    in_stock: 'ክምችት አለ',
    out_of_stock: 'አልቋል',
    currency: 'ብር',
    filter_all: 'ሁሉም ምርቶች',
    filter_new: 'አዲስ ብቻ',
    filter_used: 'ያገለገሉ ብቻ',
    filter_price: 'ዋጋ',
    no_products_found: 'ምንም የተገኘ ምርት የለም',
    items_available: 'በክምችት ያለው ብዛት',

    // Registration & Auth
    auth_register_title: 'በሜላ ገበያ ይመዝገቡ',
    auth_register_subtitle: 'አንድ ጊዜ ብቻ ይመዝገቡ፤ ወዲያውኑ መግዛትም ሆነ መሸጥ ይችላሉ!',
    auth_login_title: 'ወደ መለያዎ ይግቡ',
    auth_login_subtitle: 'የተመዘገቡበትን ኢሜይል እና የይለፍ ቃል ያስገቡ',
    full_name: 'ሙሉ ስም',
    email: 'ኢሜይል አድራሻ',
    password: 'የይለፍ ቃል (Password)',
    phone_number: 'ስልክ ቁጥር (09... / 07...)',
    city: 'ከተማ',
    select_city: 'ከተማ ይምረጡ',
    register_button: 'መለያ ፍጠር (Register)',
    login_button: 'ግባ (Log In)',
    already_have_account: 'መለያ አለዎት? ይግቡ',
    need_an_account: 'መለያ የለዎትም? ይመዝገቡ',
    register_once_note: 'የተለየ ሱቅ መክፈት አያስፈልግም — መለያዎ በቀጥታ መሸጫ ፈቃድ ያገኛል!',
    seller_role_granted_note: 'ምዝገባዎ ሲጠናቀቅ ወዲያውኑ ወደ ሻጭ ዳሽቦርድ ገብተው ምርት ማከል ይችላሉ።',
    demo_login: 'የሙከራ መለያዎች',
    fill_all_fields: 'እባክዎ ሁሉንም ክፍሎች በትክክል ይሙሉ',
    registration_successful: 'ምዝገባው በተሳካ ሁኔታ ተጠናቋል! አሁን መሸጥ ይችላሉ።',
    login_successful: 'በተሳካ ሁኔታ ገብተዋል!',

    // Seller Dashboard
    seller_hub: 'የሻጭ ማዕከል (Seller Dashboard)',
    seller_hub_desc: 'የራስዎን ምርቶች ያስተዳድሩ፣ አዲስ ምርት ይጨምሩ፣ ሽያጭዎን ይከታተሉ።',
    instant_selling_notice: 'ምንም የተለየ ሱቅ መክፈት አያስፈልግዎትም! ከዚህ በታች አዲስ ምርት ወዲያውኑ ማስገባት ይችላሉ።',
    add_product: 'አዲስ ምርት ጨምር',
    my_products: 'የእኔ ምርቶች',
    my_sales: 'የትዕዛዝ ታሪክ',
    total_inventory: 'ጠቅላላ ምርቶች',
    total_sales: 'ጠቅላላ ሽያጭ',
    product_name: 'የምርት ስም (Title)',
    product_description: 'የምርት ማብራሪያ (Description)',
    price_etb: 'ዋጋ በብር (Price in ETB)',
    category_select: 'የምርት ምድብ (Category)',
    product_images: 'የምርት ፎቶ (Image URL)',
    product_images_help: 'የምስሉን URL ያስገቡ ወይም ዝግጁ የሆኑትን ናሙና ፎቶዎች ይጠቀሙ',
    image_url_placeholder: 'https://images.unsplash.com/...',
    available_stock: 'ያለው ብዛት (Stock Quantity)',
    product_condition: 'የምርት ሁኔታ (Condition)',
    save_product: 'ምርቱን አስቀምጥ',
    product_saved_success: 'ምርቱ በተሳካ ሁኔታ ተቀምጧል!',
    product_deleted_success: 'ምርቱ ተሰርዟል',
    edit_product: 'አስተካክል',
    delete_product: 'ሰርዝ',
    confirm_delete: 'ይህንን ምርት መሰረዝ እርግጠኛ ነዎት?',
    no_seller_products: 'እስካሁን ያከሉት ምርት የለም። የመጀመሪያውን ምርትዎን አሁን ያክሉ!',
    start_adding_products: 'ምርት ማከል ጀምር',

    // Cart & Checkout
    shopping_cart: 'የግዢ ጋሪ',
    cart_empty: 'ጋሪዎ ባዶ ነው',
    cart_empty_desc: 'የሚወዱትን ምርት መርጠው ወደ ጋሪ ያክሉ',
    subtotal: 'የምርቶች ድምር',
    shipping: 'የማድረሻ ክፍያ',
    free_shipping: 'ነፃ ማድረስ',
    total: 'ጠቅላላ ክፍያ',
    checkout: 'ትዕዛዝ ያጠናቁ',
    apply_coupon: 'የቅናሽ ኩፖን አስገባ',
    coupon_placeholder: 'ኮድ (ምሳሌ፡ MELA10)',
    delivery_address: 'የማድረሻ አድራሻ',
    payment_method: 'የክፍያ ዘዴ',
    place_order: 'ትዕዛዙን አረጋግጥ',
    order_success: 'ትዕዛዝዎ በተሳካ ሁኔታ ተላልፏል!',
    order_success_desc: 'የእቃውን ሁኔታ በኤስኤምኤስ እና በመለያዎ መከታተል ይችላሉ።',
    continue_shopping: 'ወደ ገበያው ተመለስ',

    // Admin & SQL
    admin_title: 'የሜላ ገበያ አስተዳዳሪ ማዕከል',
    admin_desc: 'የስርዓቱ ምርቶች፣ ትዕዛዞች፣ እና የዳታቤዝ ሁኔታ',
    supabase_migration_tab: 'የ Supabase ዳታቤዝ ማይግሬሽን (SQL)',
    copy_sql: 'SQL ኮድ ቅዳ',
    sql_copied: 'ኮዱ ተቀድቷል!',
    apply_migration_note: 'ይህንን SQL በ Supabase SQL Editor ውስጥ Paste በማድረግ Run ይበሉ።',
    close: 'ዝጋ',
  },
  en: {
    // Brand & Nav
    brand_name: 'MELA MARKET',
    brand_sub: "Ethiopia's Digital Marketplace",
    search_placeholder: 'Search products, electronics, traditional fashion...',
    categories: 'Categories',
    all_categories: 'Browse All Categories',
    deals: 'Hot Deals',
    sell: 'Sell',
    seller_dashboard: 'Seller Dashboard',
    admin_dashboard: 'Admin',
    sign_in: 'Sign In',
    register: 'Register',
    sign_out: 'Sign Out',
    cart: 'Cart',
    orders: 'Orders',
    wishlist: 'Wishlist',
    my_account: 'My Account',
    welcome_user: 'Welcome',

    // Hero
    hero_tag: "Ethiopia's Premier Marketplace • MELA MARKET",
    hero_title_1: 'Everything You Need',
    hero_title_2: 'At Unbeatable Ethiopian Prices',
    hero_description: 'Electronics, authentic Ethiopian coffee, handcrafted traditional fashion, brand new and verified pre-owned items delivered directly to your doorstep.',
    browse_products: 'Browse Products',
    start_selling_now: 'Start Selling Now',
    fast_delivery_title: 'Fast Nationwide Delivery',
    fast_delivery_desc: 'Reliable doorstep delivery in Addis Ababa and all major regional cities',
    verified_quality_title: 'Verified Quality',
    verified_quality_desc: 'Brand new and thoroughly inspected pre-owned products',
    secure_payments_title: 'Secure Payments',
    secure_payments_desc: 'Pay via Telebirr, CBE Birr, Bank Transfer, or Cash on Delivery',
    ethiopian_support_title: '24/7 Dedicated Support',
    ethiopian_support_desc: 'Fast customer assistance in Amharic and English',

    // Products
    featured_products: 'Featured Products',
    featured_products_sub: 'Handpicked quality products from verified Ethiopian sellers',
    trending_deals: 'Trending Deals',
    trending_deals_sub: 'Special discounts available today only',
    condition_label: 'Condition',
    condition_new: 'Brand New',
    condition_used: 'Used',
    condition_new_full: 'አዲስ / Brand New',
    condition_used_full: 'ያገለገለ / Used',
    add_to_cart: 'Add to Cart',
    added_to_cart: 'Added to Cart',
    view_details: 'View Details',
    in_stock: 'In Stock',
    out_of_stock: 'Out of Stock',
    currency: 'ETB',
    filter_all: 'All Products',
    filter_new: 'Brand New Only',
    filter_used: 'Used Only',
    filter_price: 'Price',
    no_products_found: 'No products found',
    items_available: 'Available in Stock',

    // Registration & Auth
    auth_register_title: 'Create Your Mela Account',
    auth_register_subtitle: 'Register once to both buy and sell directly on Mela Market!',
    auth_login_title: 'Welcome Back',
    auth_login_subtitle: 'Enter your credentials to access your account',
    full_name: 'Full Name',
    email: 'Email Address',
    password: 'Password',
    phone_number: 'Phone Number (09... / 07...)',
    city: 'City',
    select_city: 'Select City',
    register_button: 'Create Account',
    login_button: 'Sign In',
    already_have_account: 'Already have an account? Sign in',
    need_an_account: "Don't have an account? Register",
    register_once_note: 'No separate shop registration required — your account is immediately seller-ready!',
    seller_role_granted_note: 'You can immediately open the Seller Dashboard and list your products.',
    demo_login: 'Quick Demo Personas',
    fill_all_fields: 'Please fill in all required fields accurately',
    registration_successful: 'Account created successfully! You can now start selling.',
    login_successful: 'Logged in successfully!',

    // Seller Dashboard
    seller_hub: 'Seller Dashboard',
    seller_hub_desc: 'Manage your listings, add products, and track your customer orders.',
    instant_selling_notice: 'No separate store registration needed! Add your products below and they go live immediately.',
    add_product: 'Add New Product',
    my_products: 'My Product Listings',
    my_sales: 'Orders & Sales',
    total_inventory: 'Total Products',
    total_sales: 'Total Revenue',
    product_name: 'Product Name',
    product_description: 'Product Description',
    price_etb: 'Price in ETB',
    category_select: 'Category',
    product_images: 'Product Image (URL)',
    product_images_help: 'Enter image URL or select from our curated stock imagery',
    image_url_placeholder: 'https://images.unsplash.com/...',
    available_stock: 'Available Stock',
    product_condition: 'Product Condition',
    save_product: 'Publish Product',
    product_saved_success: 'Product published successfully!',
    product_deleted_success: 'Product removed from listings',
    edit_product: 'Edit',
    delete_product: 'Delete',
    confirm_delete: 'Are you sure you want to delete this listing?',
    no_seller_products: "You haven't listed any products yet. Post your first product now!",
    start_adding_products: 'Add Your First Product',

    // Cart & Checkout
    shopping_cart: 'Shopping Cart',
    cart_empty: 'Your cart is empty',
    cart_empty_desc: 'Browse our catalog and add items to your shopping cart',
    subtotal: 'Subtotal',
    shipping: 'Delivery Fee',
    free_shipping: 'Free Delivery',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    apply_coupon: 'Apply Voucher',
    coupon_placeholder: 'Promo code (e.g. MELA10)',
    delivery_address: 'Delivery Address',
    payment_method: 'Payment Method',
    place_order: 'Confirm & Place Order',
    order_success: 'Order Placed Successfully!',
    order_success_desc: 'You will receive updates via SMS and in your customer order history.',
    continue_shopping: 'Continue Shopping',

    // Admin & SQL
    admin_title: 'Mela Market Admin Suite',
    admin_desc: 'System oversight, inventory, order processing, and Supabase integration',
    supabase_migration_tab: 'Supabase Database Migration (SQL)',
    copy_sql: 'Copy SQL Migration',
    sql_copied: 'SQL Copied to Clipboard!',
    apply_migration_note: 'Paste and run this migration in your Supabase SQL Editor.',
    close: 'Close',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  formatPrice: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mela_language');
    return (saved === 'en' || saved === 'am') ? saved : 'am'; // Amharic default for authentic Ethiopian marketplace
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mela_language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const formatPrice = (amount: number): string => {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(amount);
    return language === 'am' ? `${formatted} ብር` : `${formatted} ETB`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
