import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '../types';

interface Translations {
  [key: string]: {
    en: string;
    am: string;
  };
}

export const DICTIONARY: Translations = {
  // Brand
  brandName: { en: 'Mela Market', am: 'መላ ገበያ' },
  brandTagline: { en: 'Ethiopian E-Commerce Marketplace', am: 'የኢትዮጵያ የኦንላይን የገበያ አውታር' },
  
  // Navigation
  navHome: { en: 'Home', am: 'ዋና ገጽ' },
  navCategories: { en: 'Categories', am: 'ምድቦች' },
  navAllProducts: { en: 'All Products', am: 'ሁሉም ምርቶች' },
  navSell: { en: 'Start Selling', am: 'መሸጥ ጀምር' },
  navDashboard: { en: 'Seller Dashboard', am: 'የሻጭ ዳሽቦርድ' },
  navAdmin: { en: 'Admin Portal', am: 'የአስተዳዳሪ ክፍል' },
  navLogin: { en: 'Sign In', am: 'ግባ' },
  navRegister: { en: 'Register', am: 'ተመዝገብ' },
  navLogout: { en: 'Sign Out', am: 'ውጣ' },
  navSearchPlaceholder: { en: 'Search coffee, clothes, electronics, crafts in ETB...', am: 'ቡና፣ ልብሶች፣ ኤሌክትሮኒክስ፣ ባህላዊ እቃዎች ይፈልጉ...' },
  navCart: { en: 'Cart', am: 'ጋሪ' },
  
  // Hero Banner
  heroBadge: { en: '🇪🇹 Direct from Ethiopian Sellers & Artisans', am: '🇪🇹 በቀጥታ ከኢትዮጵያውያን ነጋዴዎች እና አምራቾች' },
  heroTitle: { en: 'Buy & Sell Verified Goods Across Ethiopia', am: 'ጥራት ያላቸውን እቃዎች በመላው ኢትዮጵያ ይግዙ እና ይሽጡ' },
  heroSubtitle: { en: 'One single registration unlocks both shopping and selling. Authentic Ethiopian coffee, handmade habesha kemis, electronics, and daily essentials with secure ETB payments.', am: 'አንድ ጊዜ ብቻ በመመዝገብ መግዛትም ሆነ መሸጥ ይችላሉ። የይርጋጨፌ ቡና፣ የሀበሻ ቀሚስ፣ ስልኮች እና የቤት እቃዎችን በቀላሉ ይገበያዩ።' },
  heroCtaShop: { en: 'Explore Featured Items', am: 'ተወዳጅ ምርቶችን ይመልከቱ' },
  heroCtaSell: { en: 'Start Selling Instantly', am: 'ወዲያውኑ መሸጥ ጀምር' },

  // Homepage Sections
  featuredHeading: { en: 'Featured Products', am: 'ተወዳጅ ምርቶች' },
  featuredSubheading: { en: 'Handpicked authentic products with verified quality and fast delivery in Ethiopia', am: 'ጥራታቸው የተረጋገጠ እና ፈጣን አቅርቦት ያላቸው ምርጥ እቃዎች' },
  allProductsHeading: { en: 'Latest Marketplace Listings', am: 'አዳዲስ የገበያ ዝርዝሮች' },
  previousItems: { en: 'Previous', am: 'ወደኋላ' },
  nextItems: { en: 'Next', am: 'ቀጣይ' },

  // Product Condition Labels (CRITICAL REQUIREMENT)
  conditionLabel: { en: 'Condition', am: 'ሁኔታ' },
  conditionNew: { en: 'አዲስ / Brand New', am: 'አዲስ / Brand New' },
  conditionUsed: { en: 'ያገለገለ / Used', am: 'ያገለገለ / Used' },

  // Product Card & Details
  priceEtb: { en: 'ETB', am: 'ብር' },
  addToCart: { en: 'Add to Cart', am: 'ወደ ጋሪ ጨምር' },
  addedToCart: { en: 'Added!', am: 'ተጨምሯል!' },
  inStock: { en: 'In Stock', am: 'አለቀረም' },
  outOfStock: { en: 'Out of Stock', am: 'አልቋል' },
  leftInStock: { en: 'left in stock', am: 'ቀሪ እቃዎች' },
  sellerLabel: { en: 'Seller', am: 'ሻጭ' },
  viewDetails: { en: 'View Details', am: 'ዝርዝሩን ይመልከቱ' },
  close: { en: 'Close', am: 'ዝጋ' },

  // Registration (CRITICAL REQUIREMENT - ONE STEP ONLY)
  registerTitle: { en: 'Create Your Account', am: 'አዲስ መለያ ይፍጠሩ' },
  registerSubtitle: { en: 'Register once to buy and start selling products immediately. No separate shop setup needed!', am: 'አንድ ጊዜ ብቻ ይመዝገቡ! ወዲያውኑ መግዛትም ሆነ ምርቶችን በነፃ መሸጥ ይችላሉ። የተለየ ሱቅ መመዝገብ አያስፈልግዎትም።' },
  fullName: { en: 'Full Name', am: 'ሙሉ ስም' },
  fullNamePlaceholder: { en: 'e.g. Almaz Bekele', am: 'ለምሳሌ፡ አልማዝ በቀለ' },
  emailLabel: { en: 'Email Address', am: 'ኢሜይል አድራሻ' },
  emailPlaceholder: { en: 'you@domain.com', am: 'you@domain.com' },
  passwordLabel: { en: 'Password', am: 'የይለፍ ቃል' },
  passwordPlaceholder: { en: 'At least 6 characters', am: 'ቢያንስ 6 ፊደላት' },
  phoneLabel: { en: 'Phone Number', am: 'ስልክ ቁጥር' },
  phonePlaceholder: { en: '0911 234 567 or +251 9...', am: '0911 234 567 ወይም +251 9...' },
  cityLabel: { en: 'City / Region', am: 'ከተማ / ክልል' },
  cityPlaceholder: { en: 'Addis Ababa', am: 'አዲስ አበባ' },
  registerBtn: { en: 'Register & Enable Selling', am: 'ተመዝገብና መሸጥ ጀምር' },
  alreadyHaveAccount: { en: 'Already have an account?', am: 'ቀደም ሲል መለያ አለዎት?' },
  signInLink: { en: 'Sign in here', am: 'እዚህ ይግቡ' },
  registerSuccess: { en: 'Welcome to Mela Market! Your seller account is active. You can now add products directly.', am: 'እንኳን ወደ መላ ገበያ በደህና መጡ! የሻጭ መለያዎ ዝግጁ ነው። አሁን ምርቶችን በቀጥታ መመዝገብ ይችላሉ።' },

  // Sign In
  signInTitle: { en: 'Welcome Back', am: 'እንኳን በደህና ተመለሱ' },
  signInSubtitle: { en: 'Sign in to access your cart, seller dashboard, and orders.', am: 'ጋሪዎን፣ የሻጭ ዳሽቦርድዎን እና ትዕዛዞችዎን ለማግኘት ይግቡ።' },
  signInBtn: { en: 'Sign In', am: 'ግባ' },
  noAccountYet: { en: "Don't have an account?", am: 'መለያ የለዎትም?' },
  registerLink: { en: 'Register now (Free selling)', am: 'አሁኑኑ ይመዝገቡ (ነፃ መሸጫ)' },

  // Seller Dashboard
  dashboardTitle: { en: 'Seller Dashboard', am: 'የሻጭ ዳሽቦርድ' },
  dashboardSubtitle: { en: 'Manage your inventory, monitor sales, and list new products for Ethiopian buyers.', am: 'ምርቶችዎን ያስተዳድሩ፣ ሽያጭዎን ይከታተሉ እና አዳዲስ እቃዎችን ይጨምሩ።' },
  addProductBtn: { en: '+ Add New Product', am: '+ አዲስ ምርት ጨምር' },
  myProductsTab: { en: 'My Product Listings', am: 'የእኔ ምርቶች ዝርዝር' },
  statsTotalProducts: { en: 'Active Listings', am: 'ንቁ ምርቶች' },
  statsTotalValue: { en: 'Inventory Value', am: 'የእቃዎች ዋጋ ድምር' },
  statsTotalStock: { en: 'Total Units', am: 'አጠቃላይ እቃዎች' },
  noProductsYet: { en: "You haven't listed any products yet. Click 'Add New Product' to start selling!", am: 'እስካሁን ምንም ምርት አልጨመሩም። መሸጥ ለመጀመር "አዲስ ምርት ጨምር" የሚለውን ይጫኑ!' },
  editBtn: { en: 'Edit', am: 'አስተካክል' },
  deleteBtn: { en: 'Delete', am: 'ሰርዝ' },
  confirmDelete: { en: 'Are you sure you want to delete this product? This action cannot be undone.', am: 'ይህን ምርት ለመሰረዝ እርግጠኛ ነዎት? ከተሰረዘ በኋላ መመለስ አይቻልም።' },

  // Add / Edit Product Form
  formAddHeading: { en: 'Add Product to Mela Market', am: 'ምርት ወደ መላ ገበያ ጨምር' },
  formEditHeading: { en: 'Update Product Details', am: 'የምርት መረጃን አሻሽል' },
  formProductName: { en: 'Product Title', am: 'የምርት ስም' },
  formProductNamePlaceholder: { en: 'e.g. Yirgacheffe Specialty Coffee Beans (1kg)', am: 'ለምሳሌ፡ የይርጋጨፌ አንደኛ ደረጃ የቆላ ቡና' },
  formDescription: { en: 'Description & Details', am: 'ዝርዝር ማብራሪያ' },
  formDescriptionPlaceholder: { en: 'Describe origin, specifications, size, material, or included accessories...', am: 'ስለ እቃው ጥራት፣ መጠን፣ እውነተኛነት እና ይዘት ያብራሩ...' },
  formPrice: { en: 'Price in ETB (Ethiopian Birr)', am: 'ዋጋ በብር (ETB)' },
  formPricePlaceholder: { en: 'e.g. 1500', am: 'ለምሳሌ፡ 1500' },
  formCategory: { en: 'Select Category', am: 'ምድብ ይምረጡ' },
  formStock: { en: 'Available Stock Quantity', am: 'ያለዎት ብዛት (ክምችት)' },
  formStockPlaceholder: { en: 'e.g. 10', am: 'ለምሳሌ፡ 10' },
  formConditionRequiredNotice: { en: 'Select exactly one condition for this product:', am: 'የእቃውን ትክክለኛ ሁኔታ ይምረጡ፡' },
  formImageUrl: { en: 'Product Image (URL or pick sample)', am: 'የምርት ፎቶ (የፎቶ ሊንክ ወይም ምሳሌ ይምረጡ)' },
  formImageUrlPlaceholder: { en: 'https://...', am: 'https://...' },
  formQuickPhotos: { en: 'Or choose a photo preset:', am: 'ወይም ከተዘጋጁ ፎቶዎች ይምረጡ፡' },
  formSubmitAdd: { en: 'Publish Product Instantly', am: 'ምርቱን ወዲያውኑ ለጥፍ' },
  formSubmitUpdate: { en: 'Save Changes', am: 'ለውጦቹን መዝግብ' },
  formCancel: { en: 'Cancel', am: 'ተው' },

  // Cart & Checkout
  cartTitle: { en: 'Your Shopping Cart', am: 'የእርስዎ የገበያ ጋሪ' },
  cartEmpty: { en: 'Your cart is empty. Discover great Ethiopian goods on the homepage!', am: 'ጋሪዎ ባዶ ነው። በመነሻ ገጹ ላይ ያሉ ምርጥ እቃዎችን ይመልከቱ!' },
  cartSubtotal: { en: 'Subtotal', am: 'አጠቃላይ ድምር' },
  cartDeliveryFee: { en: 'Delivery Fee', am: 'የማጓጓዣ ክፍያ' },
  freeDelivery: { en: 'Free in Addis Ababa', am: 'በአዲስ አበባ በነፃ' },
  proceedToCheckout: { en: 'Proceed to Checkout', am: 'ወደ ክፍያ ሂድ' },
  checkoutTitle: { en: 'Complete Your Order', am: 'ትዕዛዝዎን ያጠናቅቁ' },
  deliveryAddress: { en: 'Specific Delivery Address / Neighborhood', am: 'የመኖሪያ ወይም የስራ አድራሻ (ሰፈር)' },
  deliveryAddressPlaceholder: { en: 'e.g. Bole Medhanialem, Next to Edna Mall, House 402', am: 'ለምሳሌ፡ ቦሌ መድኃኔዓለም፣ ኤድና ሞል አጠገብ' },
  paymentMethod: { en: 'Payment Option in Ethiopia', am: 'የክፍያ አማራጭ' },
  telebirr: { en: 'Telebirr (ቴሌብር)', am: 'ቴሌብር (Telebirr)' },
  cbeBirr: { en: 'CBE Birr (የኢትዮጵያ ንግድ ባንክ)', am: 'የኢትዮጵያ ንግድ ባንክ (CBE Birr)' },
  cashOnDelivery: { en: 'Cash on Delivery (ሲደርስ የሚከፈል)', am: 'እቃው ሲደርስ የሚከፈል (Cash on Delivery)' },
  placeOrderBtn: { en: 'Confirm Order in ETB', am: 'ትዕዛዙን አረጋግጥ' },
  orderSuccessTitle: { en: 'Order Placed Successfully!', am: 'ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል!' },
  orderSuccessMsg: { en: 'The seller has received your order and will contact your phone shortly.', am: 'ሻጩ ትዕዛዝዎን ተቀብሏል፤ በቅርቡ በስልክዎ ይደውልልዎታል።' },

  // Categories dedicated page / modal
  categoriesPageTitle: { en: 'Browse by Category', am: 'በምድቦች ያስሱ' },
  categoriesPageSubtitle: { en: 'Explore authentic Ethiopian merchandise organized by department', am: 'የተመረጡ የኢትዮጵያ እቃዎችን በየምድባቸው ያግኙ' },
  filterByCondition: { en: 'Filter by Condition:', am: 'በእቃው ሁኔታ ለይ:' },
  filterAllConditions: { en: 'All Conditions', am: 'ሁሉም' },
  filterBrandNew: { en: 'Brand New (አዲስ)', am: 'አዲስ ብቻ' },
  filterUsed: { en: 'Used (ያገለገለ)', am: 'ያገለገለ ብቻ' },
  sortBy: { en: 'Sort by:', am: 'ቅደም ተከተል:' },
  sortPriceAsc: { en: 'Price: Low to High', am: 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ' },
  sortPriceDesc: { en: 'Price: High to Low', am: 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ' },
  clearFilters: { en: 'Reset Filters', am: 'ማጣሪያውን አጥፋ' },
  noMatchingProducts: { en: 'No products match your search or filter criteria.', am: 'ከፍለጋዎ ጋር የሚዛመድ ምርት አልተገኘም።' },

  // Admin
  adminTitle: { en: 'Mela Market Admin Portal', am: 'የመላ ገበያ የአስተዳዳሪ ማዕከል' },
  adminSubtitle: { en: 'Oversee all seller listings, review compliance, and monitor platform health.', am: 'ሁሉንም የሻጮች ምርቶች፣ ስርዓቱን እና ደንበኞችን ይቆጣጠሩ።' },
  adminAllListings: { en: 'All Marketplace Listings', am: 'አጠቃላይ የገበያ ዝርዝሮች' },
  adminToggleStatus: { en: 'Toggle Status', am: 'ሁኔታ ቀይር' },

  // Table headers & listings
  thProduct: { en: 'Product', am: 'ምርት' },
  thCategory: { en: 'Category', am: 'ምድብ' },
  thCondition: { en: 'Condition', am: 'ሁኔታ' },
  thPrice: { en: 'Price', am: 'ዋጋ' },
  thStock: { en: 'Stock', am: 'ክምችት' },
  thActions: { en: 'Actions', am: 'ተግባራት' },
  loadingListings: { en: 'Loading listings...', am: 'ምርቶች በመጫን ላይ ናቸው...' },
  activeSellerBadge: { en: 'Active Seller Account', am: 'ንቁ የሻጭ መለያ' },
  backToMarketplace: { en: 'Back to Marketplace', am: 'ወደ መነሻ ገጽ ተመለስ' },

  // Validation
  valNameRequired: { en: 'Please enter your full name.', am: 'እባክዎ ሙሉ ስምዎን ያስገቡ።' },
  valEmailRequired: { en: 'Please enter a valid email address.', am: 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ።' },
  valPasswordLength: { en: 'Password must be at least 6 characters.', am: 'የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት።' },
  valPhoneRequired: { en: 'Please enter your phone number.', am: 'እባክዎ ስልክ ቁጥርዎን ያስገቡ።' },
  valProductTitle: { en: 'Please provide a product title.', am: 'እባክዎ የምርት ስም ያስገቡ።' },
  valProductPrice: { en: 'Price must be a valid number greater than 0 ETB.', am: 'ዋጋ ከ0 ብር በላይ የሆነ ቁጥር መሆን አለበት።' },
  valProductCondition: { en: 'Please select condition: Brand New or Used.', am: 'እባክዎ የምርቱን ሁኔታ ይምረጡ፡ አዲስ ወይም ያገለገለ።' },
  valProductStock: { en: 'Stock must be 0 or more.', am: 'የእቃው ብዛት 0 ወይም ከዚያ በላይ መሆን አለበት።' },
  successSaved: { en: 'Product saved successfully!', am: 'ምርቱ በተሳካ ሁኔታ ተቀምጧል!' },
  successDeleted: { en: 'Product removed from listings.', am: 'ምርቱ ከዝርዝሩ ተሰርዟል።' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof DICTIONARY) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('mela_language');
      return (saved === 'am' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('mela_language', lang);
    } catch {}
  };

  const t = (key: keyof typeof DICTIONARY): string => {
    const entry = DICTIONARY[key];
    if (!entry) return String(key);
    return entry[language] || entry.en || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
