import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'am' | 'en';

export interface Translations {
  [key: string]: {
    am: string;
    en: string;
  };
}

export const TRANSLATIONS: Translations = {
  // Brand & Navigation
  brandName: { am: 'ሜላ ገበያ', en: 'MELA MARKET' },
  brandTagline: { am: 'የበርካታ ነጋዴዎች የገበያ ማዕከል', en: 'Multi-Vendor Marketplace' },
  home: { am: 'ዋና ገጽ', en: 'Home' },
  shop: { am: 'ምርቶች በሙሉ', en: 'All Products' },
  categories: { am: 'የምርት ምድቦች', en: 'Categories' },
  about: { am: 'ስለ እኛ', en: 'About Us' },
  contact: { am: 'ያግኙን', en: 'Contact' },
  cart: { am: 'የግዢ ቅርጫት', en: 'Cart' },
  wishlist: { am: 'የምኞት ዝርዝር', en: 'Wishlist' },
  signIn: { am: 'ግባ / ተመዝገብ', en: 'Sign In' },
  signOut: { am: 'ውጣ', en: 'Sign Out' },
  myProfile: { am: 'የእኔ መለያ', en: 'My Profile' },
  myOrders: { am: 'የእኔ ትዕዛዞች', en: 'My Orders' },
  trackOrder: { am: 'ትዕዛዝ መከታተያ', en: 'Track Order' },
  adminDashboard: { am: 'የአስተዳዳሪ ክፍል', en: 'Admin Dashboard' },
  sellerDashboard: { am: 'የሻጭ ዳሽቦርድ', en: 'Seller Dashboard' },
  becomeSeller: { am: 'ሻጭ ይሁኑ / ሱቅ ይክፈቱ', en: 'Become a Seller' },
  openShop: { am: 'የእርስዎን ሱቅ ይክፈቱ', en: 'Open Your Shop' },
  allSellers: { am: 'የተመዘገቡ ሻጮች', en: 'Marketplace Sellers' },
  searchPlaceholder: { am: 'ምርቶችን፣ የሻጭ ሱቆችን እና እቃዎችን ይፈልጉ...', en: 'Search products, shops, brands...' },

  // Top banner
  promoNotice: { am: 'የኢትዮጵያ ታማኝ የገበያ መድረክ — ጥራት ያላቸው እቃዎች በቀጥታ ከሻጮች', en: 'Verified Ethiopian Marketplace — Authentic products direct from sellers' },

  // Hero Section
  heroBadge: { am: 'የተመረጠ ጥራት ያለው የገበያ ማዕከል', en: 'Curated Specialty Marketplace' },
  heroTitle1: { am: 'የጥራት እቃዎች፣', en: 'Elevated Living,' },
  heroTitle2: { am: 'የታመኑ ነጋዴዎች ገበያ።', en: 'Verified Sellers.' },
  heroSubtitle: { am: 'የኢትዮጵያ ምርጥ የይርጋጨፌ ቡና፣ ጥራት ያላቸው የቆዳ ውጤቶች፣ ዘመናዊ ቴክኖሎጂ እና ልብሶችን ከዋና ሻጮች በቀጥታ ይሸምቱ።', en: 'Shop single-origin specialty coffees, bespoke leathercraft, electronics, and sustainable apparel direct from vetted independent sellers.' },
  exploreCatalog: { am: 'ገበያውን ያስሱ', en: 'Explore Marketplace' },
  startSelling: { am: 'እቃዎችን መሸጥ ይጀምሩ', en: 'Start Selling Today' },
  limitedDeals: { am: 'የተመረጡ ቅናሾች', en: 'Flash Deals' },
  dealOfTheDay: { am: 'የዕለቱ ልዩ ቅናሽ', en: 'Deal of the Day' },
  limitedQuantity: { am: 'ውስን ክምችት ብቻ ቀርቷል', en: 'Limited Quantity Available' },
  promotionEndsIn: { am: 'ቅናሹ የሚያበቃው በ፡', en: 'Promotion ends in:' },
  claimDealNow: { am: 'ቅናሹን አሁኑኑ ያግኙ', en: 'Claim Deal Now' },
  hours: { am: 'ሰዓታት', en: 'Hours' },
  mins: { am: 'ደቂቃዎች', en: 'Mins' },
  secs: { am: 'ሰከንዶች', en: 'Secs' },

  // Stats
  satisfiedCustomers: { am: 'ደስተኛ ደንበኞች', en: 'Satisfied Customers' },
  verifiedReviews: { am: 'የተረጋገጡ አስተያየቶች', en: 'Verified Reviews' },
  verifiedSellers: { am: 'የተረጋገጡ ሻጮች', en: 'Verified Sellers' },
  activeBuyers: { am: 'ንቁ ደንበኞች', en: 'Active Buyers' },
  fastDispatch: { am: 'ፈጣን ማድረሻ', en: 'Express Dispatch' },

  // Departments & Categories
  marketCatalog: { am: 'የምርት ካታሎግ', en: 'Market Catalog' },
  shopByDepartment: { am: 'በምርት ምድብ ይሸምቱ', en: 'Shop by Department' },
  browseDepartments: { am: 'ሁሉንም ክፍሎች ይመልከቱ', en: 'Browse All Departments' },
  viewAllCategories: { am: 'ሁሉንም ምድቦች ይመልከቱ', en: 'View All Categories' },
  allCategories: { am: 'ሁሉም ምድቦች', en: 'All Categories' },
  itemsCount: { am: 'ምርቶች', en: 'items' },
  explore: { am: 'ያስሱ', en: 'Explore' },
  curatedSelection: { am: 'የተመረጡ ምርቶች', en: 'Curated Selection' },
  featuredCollections: { am: 'ተለይተው የቀረቡ ስብስቦች', en: 'Featured Collections' },
  featuredGoods: { am: 'ተወዳጅ ምርቶች', en: 'Featured Goods' },
  trendingNow: { am: 'አሁን ተፈላጊ የሆኑ', en: 'Trending Now' },
  specialOffers: { am: 'ልዩ ቅናሾች', en: 'Special Offers' },
  viewAllProducts: { am: 'ሁሉንም ምርቶች ይመልከቱ', en: 'View All Products' },

  // Multi-Vendor Storefront
  verifiedVendors: { am: 'የተረጋገጡ የገበያ ነጋዴዎች', en: 'Verified Marketplace Vendors' },
  shopDirectFromMerchants: { am: 'በቀጥታ ከተመረጡ ነጋዴዎች ይግዙ', en: 'Shop Direct from Independent Merchant Storefronts' },
  shopDirectDesc: { am: 'ከአዲስ አበባ እደ-ጥበብ ሌዘር እስከ ይርጋጨፌ ተራራማ ቡና እና ዘመናዊ ኤሌክትሮኒክስ በቀጥታ ከእውነተኛ አቅራቢዎች።', en: 'Discover bespoke Florentine leather, single-origin highland coffees, and studio acoustics direct from registered sellers.' },
  openOwnShopBtn: { am: 'የራስዎን ሱቅ ይክፈቱ (ነጋዴ ይሁኑ)', en: 'Open Your Own Shop (Become a Seller)' },
  soldBy: { am: 'ሻጭ ሱቅ፡', en: 'Sold by:' },
  visitShop: { am: 'የሻጩን ሱቅ ጎብኝ', en: 'Visit Shop' },
  sellerRating: { am: 'የሻጭ ደረጃ', en: 'Seller Rating' },
  verifiedSellerBadge: { am: 'የተረጋገጠ ሻጭ', en: 'Verified Seller' },
  pendingApproval: { am: 'ማረጋገጫ በመጠባበቅ ላይ', en: 'Pending Approval' },
  shopLocation: { am: 'የሱቅ መገኛ', en: 'Shop Location' },
  backToAllProducts: { am: 'ወደ ሁሉም ምርቶች ተመለስ', en: 'Back to All Products' },

  // Product Details
  addToCart: { am: 'ወደ ቅርጫት ጨምር', en: 'Add to Cart' },
  buyNow: { am: 'አሁኑኑ ይግዙ', en: 'Buy Now' },
  addedToCart: { am: 'ወደ ቅርጫት ገብቷል!', en: 'Added to Cart!' },
  inStock: { am: 'በክምችት አለ', en: 'In Stock' },
  lowStock: { am: 'ጥቂት ቀርቷል', en: 'Low Stock' },
  outOfStock: { am: 'አልቋል', en: 'Out of Stock' },
  quantity: { am: 'ብዛት', en: 'Quantity' },
  save: { am: 'ቅናሽ', en: 'Save' },
  customerReviews: { am: 'የደንበኞች አስተያየት', en: 'Customer Reviews' },
  specifications: { am: 'ዝርዝር መግለጫ', en: 'Specifications' },
  description: { am: 'የምርት ማብራሪያ', en: 'Description' },
  shippingDelivery: { am: 'ማድረሻ እና ዋስትና', en: 'Shipping & Returns' },
  writeReview: { am: 'አስተያየት ይጻፉ', en: 'Write a Review' },
  shareReview: { am: 'አስተያየት አስቀምጥ', en: 'Post Customer Review' },
  yourRating: { am: 'የእርስዎ ደረጃ አሰጣጥ፡', en: 'Your Rating:' },
  yourReview: { am: 'የእርስዎ አስተያየት...', en: 'Your review...' },
  submitReview: { am: 'አስተያየት ላክ', en: 'Submit Review' },
  relatedProducts: { am: 'ተመሳሳይ ምርቶች', en: 'Related Products' },
  reviewsCount: { am: 'አስተያየቶች', en: 'reviews' },
  shareProduct: { am: 'ይህንን ምርት ያጋሩ', en: 'Share Product' },

  // Cart & Drawer
  yourCart: { am: 'የእርስዎ የግዢ ቅርጫት', en: 'Your Shopping Cart' },
  cartEmpty: { am: 'የግዢ ቅርጫትዎ ባዶ ነው', en: 'Your shopping cart is empty' },
  cartEmptyDesc: { am: 'እስካሁን ምንም አይነት እቃ ወደ ቅርጫትዎ አላስገቡም። የተመረጡ ጥራት ያላቸውን ምርቶቻችንን ያስሱ።', en: 'Your cart is waiting for something extraordinary. Explore our curated catalog of products.' },
  subtotal: { am: 'ንዑስ ድምር', en: 'Subtotal' },
  discount: { am: 'የቫውቸር ቅናሽ', en: 'Voucher Discount' },
  shipping: { am: 'የማድረሻ ክፍያ', en: 'Shipping Fee' },
  freeShipping: { am: 'ነፃ ማድረሻ', en: 'FREE' },
  tax: { am: 'የሽያጭ ታክስ (8%)', en: 'Sales Tax (8%)' },
  totalDue: { am: 'አጠቃላይ የሚከፈል', en: 'Total Due' },
  proceedToCheckout: { am: 'ወደ ክፍያ ይቀጥሉ', en: 'Proceed to Checkout' },
  continueShopping: { am: 'ግዢዎን ይቀጥሉ', en: 'Continue Shopping' },
  clearCart: { am: 'ቅርጫት አጽዳ', en: 'Clear Cart' },
  promoCode: { am: 'የቅናሽ ኮድ', en: 'Promo code' },
  apply: { am: 'ተግብር', en: 'Apply' },
  freeShippingUnlocked: { am: 'እንኳን ደስ አለዎት! ነፃ ማድረሻ አግኝተዋል!', en: 'You unlocked Free Express Shipping!' },
  addMoreForFreeShipping: { am: 'ነፃ ማድረሻ ለማግኘት ተጨማሪ', en: 'Add' },
  moreNeeded: { am: 'ጨምሩ', en: 'more for Free Shipping' },

  // Checkout
  checkoutTitle: { am: 'ትዕዛዝ ማጠናቀቂያ እና ክፍያ', en: 'Checkout' },
  checkoutSubtitle: { am: 'ትዕዛዝዎን በ256-ቢት የተጠበቀ ደህንነት ያጠናቁ', en: 'Complete your order with 256-bit encrypted security' },
  shippingDetails: { am: 'የማድረሻ አድራሻ እና የእውቂያ መረጃ', en: 'Shipping & Contact Details' },
  fullName: { am: 'ሙሉ ስም', en: 'Full Name' },
  emailAddress: { am: 'ኢሜይል አድራሻ', en: 'Email Address' },
  phoneNumber: { am: 'ስልክ ቁጥር', en: 'Phone Number' },
  country: { am: 'ሀገር', en: 'Country' },
  streetAddress: { am: 'የመንገድ / የሰፈር አድራሻ', en: 'Street Address' },
  apartmentSuite: { am: 'የቤት ቁጥር / ህንፃ (አማራጭ)', en: 'Apartment, Suite, Unit (Optional)' },
  city: { am: 'ከተማ', en: 'City' },
  stateRegion: { am: 'ክፍለ ከተማ / ክልል', en: 'State / Region' },
  postalCode: { am: 'የፖስታ ኮድ', en: 'Postal Code' },
  deliveryNotes: { am: 'ለአድራሹ ተጨማሪ ማስታወሻ', en: 'Delivery Instructions (Optional)' },
  deliveryMethod: { am: 'የማድረሻ አማራጭ ይምረጡ', en: 'Delivery Method' },
  standardDelivery: { am: 'መደበኛ ማድረሻ (ከ3-5 የስራ ቀናት) - ነፃ', en: 'Standard Delivery (3-5 business days) - FREE' },
  expressDelivery: { am: 'ፈጣን ማድረሻ (ከ1-2 የስራ ቀናት) - $5.99', en: 'Express Delivery (1-2 business days) - $5.99' },
  priorityDelivery: { am: 'አፋጣኝ የነጋ ማለዳ ማድረሻ - $14.99', en: 'Priority Overnight (Next morning) - $14.99' },
  paymentMethod: { am: 'የመክፈያ ዘዴ ይምረጡ', en: 'Payment Method' },
  telebirrOrCbe: { am: 'ቴሌብር / ሲቢኢ ብር (telebirr / CBE Birr)', en: 'Mobile Money (telebirr / CBE Birr)' },
  creditDebitCard: { am: 'ክሬዲት / ዴቢት ካርድ (Card)', en: 'Credit / Debit Card' },
  cashOnDelivery: { am: 'እቃው ሲደርስ በጥሬ ገንዘብ (Cash on Delivery)', en: 'Cash on Delivery (Pay at Door)' },
  cardNumber: { am: 'የካርድ ቁጥር', en: 'Card Number' },
  expires: { am: 'የሚያበቃበት (ወር/ዓመት)', en: 'Expires (MM/YY)' },
  cvc: { am: 'ሲቪሲ (CVC)', en: 'CVC' },
  orderSummary: { am: 'የትዕዛዝ ማጠቃለያ', en: 'Order Summary' },
  placeOrder: { am: 'ትዕዛዝ አጠናቅቅ እና ክፈል', en: 'Place Order' },
  processingOrder: { am: 'ትዕዛዝዎን በማጠናቀር ላይ...', en: 'Processing Order...' },
  orderSuccessTitle: { am: 'ትዕዛዝዎ በተሳካ ሁኔታ ተጠናቋል!', en: 'Order Placed Successfully!' },
  orderSuccessMsg: { am: 'እናመሰግናለን! ትዕዛዝዎ ተመዝግቧል። የትዕዛዝ ዝርዝር ወደ ኢሜይልዎ ተልኳል።', en: 'Thank you! Your order has been placed and confirmed.' },
  orderNumber: { am: 'የትዕዛዝ ቁጥር', en: 'Order Number' },
  deliveryAddressSummary: { am: 'የሚላክበት አድራሻ', en: 'Delivery Address' },
  trackOrderStatus: { am: 'የትዕዛዝ ሁኔታን ተከታተል', en: 'Track Order Status' },

  // Orders
  orderHistory: { am: 'የትዕዛዞች ታሪክ', en: 'Order History' },
  trackAndManageOrders: { am: 'የቀደሙ እና የአሁን ትዕዛዞችዎን ይከታተሉ', en: 'Track, view receipts, and monitor delivery progress' },
  allOrders: { am: 'ሁሉም ትዕዛዞች', en: 'All Orders' },
  orderPlaced: { am: 'ትዕዛዝ ተቀምጧል', en: 'Order Placed' },
  orderProcessing: { am: 'በዝግጅት ላይ', en: 'Processing' },
  orderShipped: { am: 'በመንገድ ላይ', en: 'In Transit' },
  orderDelivered: { am: 'ደርሷል', en: 'Delivered' },
  orderCancelled: { am: 'ተሰርዟል', en: 'Cancelled' },
  trackingCode: { am: 'የክትትል ኮድ', en: 'Tracking Code' },
  viewOrderDetails: { am: 'ሙሉ ዝርዝር ይመልከቱ', en: 'View Full Order Details' },
  noOrdersFound: { am: 'ምንም ትዕዛዝ አልተገኘም', en: 'No orders found' },
  backToOrders: { am: 'ወደ ትዕዛዞች ዝርዝር ተመለስ', en: 'Back to My Orders' },
  printReceipt: { am: 'ደረሰኝ አትም', en: 'Print Receipt' },
  itemsInOrder: { am: 'በዚህ ትዕዛዝ ውስጥ ያሉ ምርቶች', en: 'Items in This Order' },

  // Seller Registration
  sellerRegisterTitle: { am: 'በሜላ ገበያ ላይ ሻጭ ይሁኑ', en: 'Become a Seller on MELA MARKET' },
  sellerRegisterSubtitle: { am: 'የራስዎን የንግድ ሱቅ በመክፈት ምርቶችዎን ለመላው ኢትዮጵያ እና ለዓለም አቀፍ ደንበኞች ይሽጡ።', en: 'Launch your storefront and start selling direct to verified buyers.' },
  storeName: { am: 'የሱቅዎ ስም', en: 'Store / Shop Name' },
  storeDescription: { am: 'ስለ ሱቁ አጭር ማብራሪያ', en: 'Shop Description' },
  storeCity: { am: 'የሱቅ መገኛ ከተማ', en: 'City / Location' },
  storePhone: { am: 'የንግድ ስልክ ቁጥር', en: 'Business Phone' },
  registerShopBtn: { am: 'ሱቁን መዝግብ እና ሻጭ ሁን', en: 'Register Store & Become a Seller' },
  alreadySeller: { am: 'ቀደም ሲል የተመዘገበ የሻጭ መለያ አለዎት?', en: 'Already have a seller account?' },
  loginToDashboard: { am: 'ወደ ዳሽቦርድ ይግቡ', en: 'Login to Seller Dashboard' },

  // Seller Dashboard
  sellerPortal: { am: 'የሻጭ አስተዳደር ፖርታል', en: 'Vendor Seller Portal' },
  myShop: { am: 'የእኔ ሱቅ', en: 'My Shop' },
  myProducts: { am: 'የእኔ ምርቶች', en: 'My Products' },
  sellerOrders: { am: 'ለኔ ሱቅ የመጡ ትዕዛዞች', en: 'Received Orders' },
  shopSettings: { am: 'የሱቅ ቅንብሮች', en: 'Shop Settings' },
  addNewProduct: { am: 'አዲስ ምርት መዝግብ', en: 'Add New Product' },
  editProduct: { am: 'ምርት አሻሽል', en: 'Edit Product' },
  deleteProduct: { am: 'ምርት አጥፋ', en: 'Delete Product' },
  totalSellerEarnings: { am: 'አጠቃላይ የሽያጭ ገቢ', en: 'Total Shop Earnings' },
  totalProductsListed: { am: 'የተዘረዘሩ ምርቶች', en: 'Products Listed' },
  activeProducts: { am: 'ንቁ ምርቶች', en: 'Active Products' },
  pendingProducts: { am: 'ማረጋገጫ የሚጠብቁ', en: 'Pending Approval' },
  ordersToFulfill: { am: 'የሚላኩ ትዕዛዞች', en: 'Pending Orders' },
  productName: { am: 'የምርት ስም', en: 'Product Name' },
  productPrice: { am: 'ዋጋ (USD)', en: 'Price (USD)' },
  discountPriceOptional: { am: 'የቅናሽ ዋጋ (አማራጭ)', en: 'Discount Price (Optional)' },
  stockQuantity: { am: 'የክምችት ብዛት', en: 'Stock Quantity' },
  productCategory: { am: 'የምርት ምድብ', en: 'Product Category' },
  productImages: { am: 'የምርት ፎቶዎች (ምስሎች)', en: 'Product Images' },
  uploadImageToStorage: { am: 'ፎቶ ከኮምፒውተር ይጫኑ (Upload)', en: 'Upload Image to Storage' },
  primaryImageUrl: { am: 'ዋና የምስል ሊንክ (Image URL)', en: 'Primary Image URL' },
  saveProduct: { am: 'ምርቱን መዝግብ / አስቀምጥ', en: 'Save Product' },
  cancel: { am: 'ሰርዝ', en: 'Cancel' },
  markDispatched: { am: 'ተልኳል በል (Mark Dispatched)', en: 'Mark as Dispatched' },
  markDelivered: { am: 'ደርሷል በል (Mark Delivered)', en: 'Mark as Delivered' },

  // User Profile
  profileTitle: { am: 'የመለያ መረጃ እና መገለጫ', en: 'Account Profile' },
  profileSubtitle: { am: 'የግል መረጃዎን እና የመላኪያ አድራሻዎችን ያስተዳድሩ', en: 'Manage your personal details and default shipping addresses' },
  personalInfo: { am: 'የግል መረጃ', en: 'Personal Information' },
  savedAddress: { am: 'የተመዘገበ የማድረሻ አድራሻ', en: 'Saved Shipping Address' },
  saveChanges: { am: 'ለውጦችን መዝግብ', en: 'Save Changes' },
  savingChanges: { am: 'በመመዝገብ ላይ...', en: 'Saving...' },
  changesSavedSuccess: { am: 'መረጃዎ በተሳካ ሁኔታ ተሻሽሏል!', en: 'Changes saved successfully!' },

  // Auth Modal
  accountModalTitle: { am: 'የሜላ ገበያ መለያ', en: 'MELA MARKET Account' },
  accountModalSubtitle: { am: 'ለመሸመት ወይም ለመሸጥ ይግቡ / ይመዝገቡ', en: 'Sign in or register for seamless ordering' },
  loginTab: { am: 'መለያ ግባ (Sign In)', en: 'Sign In' },
  registerTab: { am: 'አዲስ መለያ ፍጠር (Register)', en: 'Create Account' },
  quickDemoProfiles: { am: 'በ1-ክሊክ የሚገቡ የሙከራ መለያዎች፡', en: 'Quick 1-Click Demo Profiles:' },
  password: { am: 'የይለፍ ቃል (Password)', en: 'Password' },
  confirmPassword: { am: 'የይለፍ ቃል ማረጋገጫ', en: 'Confirm Password' },
  signInAction: { am: 'ወደ መለያ ግባ', en: 'Sign In to Account' },
  registerAction: { am: 'አዲስ መለያ ፍጠር', en: 'Create Account' },

  // Shop page / Filters
  filters: { am: 'ማጣሪያዎች', en: 'Filters' },
  clearFilters: { am: 'ሁሉንም አጽዳ', en: 'Clear All' },
  priceRange: { am: 'የዋጋ ክልል', en: 'Price Range' },
  inStockOnly: { am: 'በክምችት ያሉ ብቻ', en: 'In Stock Only' },
  onSaleOnly: { am: 'ቅናሽ ያላቸው ብቻ', en: 'On Sale Only' },
  sortBy: { am: 'ቅደም ተከተል ምረጥ', en: 'Sort by' },
  sortFeatured: { am: 'ተመራጭ (Featured)', en: 'Featured' },
  sortPriceAsc: { am: 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ', en: 'Price: Low to High' },
  sortPriceDesc: { am: 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ', en: 'Price: High to Low' },
  sortRating: { am: 'ከፍተኛ ደረጃ የተሰጣቸው', en: 'Highest Rated' },
  sortNewest: { am: 'አዳዲስ ምርቶች', en: 'Newest Arrivals' },
  showingProducts: { am: 'የሚታዩ ምርቶች፡', en: 'Showing' },
  noMatchingProducts: { am: 'ከተመረጠው ማጣሪያ ጋር የሚስማማ ምርት አልተገኘም', en: 'No products found matching your filters' },
  resetFilters: { am: 'ማጣሪያዎችን እንደገና አስጀምር', en: 'Reset Filters' },

  // Admin Dashboard
  adminPortal: { am: 'የዋና አስተዳዳሪ ማዕከል', en: 'Marketplace Admin Suite' },
  manageSellers: { am: 'ሻጮችን ማስተዳደር', en: 'Manage Sellers & Shops' },
  approveSeller: { am: 'ሻጭ አጽድቅ', en: 'Approve Seller' },
  rejectSeller: { am: 'ሻጭ ከልክል', en: 'Reject / Suspend' },
  pendingSellers: { am: 'ማረጋገጫ የሚጠብቁ ሻጮች', en: 'Pending Applications' },
  approved: { am: 'የጸደቀ', en: 'Approved' },
  rejected: { am: 'ውድቅ የተደረገ', en: 'Rejected' },
  suspended: { am: 'የታገደ', en: 'Suspended' },
  supabaseConfig: { am: 'ሱፓቤዝ እና ፖስትግሬስ (SQL)', en: 'Supabase & PostgreSQL' },
  androidReady: { am: 'የአንድሮይድ መተግበሪያ ዝግጅት', en: 'Android App Readiness' },

  // Footer & Value props
  freeShippingTitle: { am: 'ነፃ ፈጣን ማድረሻ', en: 'Free Express Shipping' },
  freeShippingDesc: { am: 'ከ 50 ዶላር በላይ ለሆኑ ብቁ ትዕዛዞች በሙሉ ያለ ምንም ተጨማሪ ክፍያ።', en: 'Complimentary on all qualifying orders over $50.' },
  authenticGuaranteeTitle: { am: '100% ትክክለኛ የጥራት ማረጋገጫ', en: '100% Authentic Guarantee' },
  authenticGuaranteeDesc: { am: 'በቀጥታ ከተረጋገጡ አምራቾች እና የታመኑ የኢትዮጵያ ነጋዴዎች።', en: 'Verified direct from artisan producers & registered merchants.' },
  easyReturnsTitle: { am: 'የ30-ቀን ቀላል የመመለስ ዋስትና', en: '30-Day Effortless Returns' },
  easyReturnsDesc: { am: 'ሳይውሉ ሳያድሩ ፈጣን ምትክ ወይም ሙሉ ተመላሽ ገንዘብ።', en: 'Instant prepaid return labels and prompt refunds.' },
  support247Title: { am: 'የ24/7 የደንበኞች ድጋፍ', en: '24/7 Dedicated Support' },
  support247Desc: { am: 'በማንኛውም ጊዜ ጥያቄዎችን ለመመለስ ዝግጁ የደንበኞች አጋዥ ቡድን።', en: 'Live customer concierge ready to assist anytime.' },
  stayUpdated: { am: 'አዳዲስ ቅናሾችን እና ዜናዎችን ያግኙ', en: 'Stay Updated with Mela Market' },
  newsletterDesc: { am: 'ለአዳዲስ ምርቶች መምጣት፣ ልዩ ቅናሾች እና የነጋዴዎች ዜና በኢሜይልዎ ይመዝገቡ።', en: 'Subscribe to receive notifications about curated arrivals and private sales.' },
  subscribe: { am: 'ተመዝገብ', en: 'Subscribe' },
  subscribedSuccess: { am: 'እናመሰግናለን! በኢሜይልዎ ተመዝግበዋል።', en: 'Thank you for subscribing!' },
  allRightsReserved: { am: 'መብቱ በህግ የተጠበቀ ነው። ሜላ ገበያ — የበርካታ ነጋዴዎች የገበያ ማዕከል', en: 'All rights reserved. MELA MARKET Multi-Vendor Platform.' },

  // Role Switcher
  switchPersona: { am: 'የሙከራ መለያ ቀይር (Demo)', en: 'Switch Demo Role' },
  customerRole: { am: 'ደንበኛ', en: 'Customer' },
  sellerRole: { am: 'ሻጭ / ነጋዴ', en: 'Seller' },
  adminRole: { am: 'አስተዳዳሪ', en: 'Admin' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG = 'mela_market_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Amharic is the default language as strictly requested!
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'am';
    const saved = localStorage.getItem(STORAGE_LANG) as Language;
    return saved === 'en' ? 'en' : 'am';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG, lang);
    } catch {
      // localstorage safeguard
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string): string => {
    const item = TRANSLATIONS[key];
    if (item && item[language]) {
      return item[language];
    }
    // Fallback to English or key
    if (item && item.en) return item.en;
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
