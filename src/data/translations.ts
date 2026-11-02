import { Language } from '../types';

export const TRANSLATIONS: Record<Language, {
  siteTitle: string;
  tagline: string;
  heroHeading: string;
  heroSubheading: string;
  searchPlaceholder: string;
  allCities: string;
  postFreeAd: string;
  callDirect: string;
  directSupport: string;
  nationwideDelivery: string;
  categories: string;
  allCategories: string;
  verifiedSellers: string;
  fastDelivery: string;
  securePayments: string;
  featuredListings: string;
  showingItems: string;
  resetFilters: string;
  noItemsFound: string;
  noItemsDesc: string;
  viewAllListings: string;
  callToInquire: string;
  addToCart: string;
  addedToCart: string;
  inStock: string;
  condition: string;
  location: string;
  seller: string;
  verifiedMerchant: string;
  description: string;
  specifications: string;
  shoppingCart: string;
  cartEmpty: string;
  cartEmptyDesc: string;
  exploreMarketplace: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  proceedToCheckout: string;
  deliveryDetails: string;
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  paymentMethod: string;
  confirmOrder: string;
  orderReceived: string;
  orderReceivedDesc: string;
  orderCallNotice: string;
  continueShopping: string;
  back: string;
  items: string;
  sellTitle: string;
  sellSub: string;
  listingTitle: string;
  price: string;
  listingSubmitted: string;
  listingSubmittedDesc: string;
  submitListing: string;
  login: string;
  register: string;
  myAccount: string;
  logout: string;
  adminDashboard: string;
  adminOverview: string;
  manageListings: string;
  totalListings: string;
  activeOrders: string;
  deleteListing: string;
  approveListing: string;
  password: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  needHelp: string;
  needHelpDesc: string;
  customerHotline: string;
  copyright: string;
  paymentAccepted: string;
  etbCurrency: string;
}> = {
  am: {
    siteTitle: 'መላ ገበያ',
    tagline: 'የኢትዮጵያ ዲጂታል የገበያ መድረክ',
    heroHeading: 'ያገለገሉ እና አዲስ እቃዎቻችሁን እና ምርቶቻችሁን ይሽጡ፣ ይሸምቱ።',
    heroSubheading: 'የተረጋገጡ አዳዲስና ያገለገሉ እቃዎችን በቀላሉ ይግዙ፣ ይሽጡ፣ ይዘዙ።',
    searchPlaceholder: 'ምን ይፈልጋሉ? (ለምሳሌ፦ ስልክ፣ ቡና፣ መኪና፣ ቤት...)',
    allCities: 'መላው ኢትዮጵያ',
    postFreeAd: 'ማስታወቂያ ይለጥፉ',
    callDirect: 'ይደውሉ',
    directSupport: 'የደንበኞች አገልግሎት',
    nationwideDelivery: 'በመላው ኢትዮጵያ የማድረስ አገልግሎት',
    categories: 'የእቃ ምድቦች',
    allCategories: 'ሁሉም ምድቦች',
    verifiedSellers: 'የተረጋገጡ ሻጮች',
    fastDelivery: 'ፈጣን ማድረስ',
    securePayments: 'ቴሌብርና ሲቢኢ ብር',
    featuredListings: 'ተለይተው የቀረቡ እቃዎች',
    showingItems: 'የተገኙ እቃዎች ብዛት፦',
    resetFilters: 'ማጣሪያውን አጽዳ',
    noItemsFound: 'ምንም እቃ አልተገኘም',
    noItemsDesc: 'እባክዎ የተለየ የፍለጋ ቃል ይጠቀሙ ወይም ማጣሪያውን ያጽዱ።',
    viewAllListings: 'ሁሉንም እቃዎች ይመልከቱ',
    callToInquire: 'ይደውሉና ይዘዙ',
    addToCart: 'ወደ ቅርጫት ጨምር',
    addedToCart: 'ተጨምሯል',
    inStock: 'በክምችት አለ',
    condition: 'ሁኔታ',
    location: 'አካባቢ',
    seller: 'ሻጭ',
    verifiedMerchant: 'የተረጋገጠ ነጋዴ',
    description: 'ዝርዝር መግለጫ',
    specifications: 'ዋና ዋና መለያዎች',
    shoppingCart: 'የእርስዎ ቅርጫት',
    cartEmpty: 'ቅርጫትዎ ባዶ ነው',
    cartEmptyDesc: 'የሚፈልጉትን እቃ ከመረጡ በኋላ እዚህ ያገኛሉ።',
    exploreMarketplace: 'ገበያውን ይመልከቱ',
    subtotal: 'ድምር',
    deliveryFee: 'የማድረሻ ክፍያ',
    total: 'አጠቃላይ ድምር',
    proceedToCheckout: 'ክፍያና ማድረስ ይምረጡ',
    deliveryDetails: 'የማድረሻ አድራሻ እና ክፍያ',
    fullName: 'ሙሉ ስም',
    phoneNumber: 'ስልክ ቁጥር',
    deliveryAddress: 'የማድረሻ ከተማና ሰፈር',
    paymentMethod: 'የክፍያ ዘዴ',
    confirmOrder: 'ትዕዛዙን አረጋግጥ',
    orderReceived: 'ትዕዛዝዎ በተሳካ ሁኔታ ተመዝግቧል!',
    orderReceivedDesc: 'የማድረስ ቡድናችን ትዕዛዝዎን ለማረጋገጥ በስልክ ይደውልልዎታል።',
    orderCallNotice: 'ለፈጣን አገልግሎት በቀጥታ ይደውሉ፡',
    continueShopping: 'ግብይት ይቀጥሉ',
    back: 'ተመለስ',
    items: 'እቃዎች',
    sellTitle: 'በመላ ገበያ ላይ ይሽጡ',
    sellSub: 'እቃዎን በቀላሉ በመመዝገብ ለገዢዎች ያቅርቡ',
    listingTitle: 'የእቃው ስም/ርዕስ',
    price: 'ዋጋ (ብር)',
    listingSubmitted: 'ማስታወቂያዎ በተሳካ ሁኔታ ተልኳል!',
    listingSubmittedDesc: 'ቡድናችን ማስታወቂያውን ፈትሾ በቅርቡ ያትመዋል።',
    submitListing: 'በነፃ ይለጥፉ',
    login: 'ይግቡ',
    register: 'ይመዝገቡ',
    myAccount: 'መለያዬ',
    logout: 'ውጣ',
    adminDashboard: 'የአድሚን ዳሽቦርድ',
    adminOverview: 'አጠቃላይ የገበያ ሁኔታ',
    manageListings: 'እቃዎችን አስተዳድር',
    totalListings: 'አጠቃላይ እቃዎች',
    activeOrders: 'ንቁ ትዕዛዞች',
    deleteListing: 'ሰርዝ',
    approveListing: 'አጽድቅ',
    password: 'የይለፍ ቃል',
    alreadyHaveAccount: 'መለያ አለዎት? ይግቡ',
    dontHaveAccount: 'መለያ የለዎትም? ይመዝገቡ',
    needHelp: 'እቃ ለማዘዝ ወይም ለመሸጥ እርዳታ ይፈልጋሉ?',
    needHelpDesc: 'የደንበኞች አገልግሎት ቡድናችን በትዕዛዝ እና በማድረስ ድጋፍ ለመስጠት ዝግጁ ነው።',
    customerHotline: 'የደንበኞች ስልክ መስመር',
    copyright: 'መብቱ በህግ የተጠበቀ ነው። መላ ገበያ',
    paymentAccepted: 'ክፍያ በቴሌብር፣ በሲቢኢ ብር እና ሲደርስ በጥሬ ገንዘብ እንቀበላለን።',
    etbCurrency: 'ብር',
  },
  en: {
    siteTitle: 'Mela Market',
    tagline: 'Ethiopian Digital Marketplace',
    heroHeading: 'Sell and shop for your new and pre-owned products.',
    heroSubheading: 'Buy and sell verified new and pre-owned items across Ethiopia with fast delivery.',
    searchPlaceholder: 'What are you looking for? (e.g. Phone, Coffee, Car, Apartment...)',
    allCities: 'All Ethiopia',
    postFreeAd: 'Post Free Ad',
    callDirect: 'Call',
    directSupport: 'Customer Support',
    nationwideDelivery: 'Nationwide Delivery across Ethiopia',
    categories: 'Categories',
    allCategories: 'All Categories',
    verifiedSellers: 'Verified Sellers',
    fastDelivery: 'Fast Delivery',
    securePayments: 'Telebirr & CBE Birr',
    featuredListings: 'Featured Listings',
    showingItems: 'Showing items:',
    resetFilters: 'Reset Filters',
    noItemsFound: 'No items found',
    noItemsDesc: 'Try adjusting your search terms or clearing your filters.',
    viewAllListings: 'View All Listings',
    callToInquire: 'Call to Order',
    addToCart: 'Add to Cart',
    addedToCart: 'Added',
    inStock: 'In Stock',
    condition: 'Condition',
    location: 'Location',
    seller: 'Seller',
    verifiedMerchant: 'Verified Merchant',
    description: 'Description',
    specifications: 'Specifications',
    shoppingCart: 'Shopping Cart',
    cartEmpty: 'Your cart is empty',
    cartEmptyDesc: 'Items you add will appear here for checkout.',
    exploreMarketplace: 'Explore Marketplace',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    total: 'Total',
    proceedToCheckout: 'Proceed to Checkout',
    deliveryDetails: 'Delivery Details & Payment',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    deliveryAddress: 'Delivery City & Address',
    paymentMethod: 'Payment Method',
    confirmOrder: 'Confirm Order',
    orderReceived: 'Order Received Successfully!',
    orderReceivedDesc: 'Our dispatch team will call you to confirm delivery.',
    orderCallNotice: 'For urgent assistance, call us directly:',
    continueShopping: 'Continue Shopping',
    back: 'Back',
    items: 'items',
    sellTitle: 'Sell on Mela Market',
    sellSub: 'Post your item easily to reach thousands of buyers',
    listingTitle: 'Item Title',
    price: 'Price (ETB)',
    listingSubmitted: 'Listing Submitted Successfully!',
    listingSubmittedDesc: 'Our team will review and publish your listing shortly.',
    submitListing: 'Post Ad for Free',
    login: 'Login',
    register: 'Register',
    myAccount: 'My Account',
    logout: 'Logout',
    adminDashboard: 'Admin Dashboard',
    adminOverview: 'Marketplace Overview',
    manageListings: 'Manage Listings',
    totalListings: 'Total Listings',
    activeOrders: 'Active Orders',
    deleteListing: 'Delete',
    approveListing: 'Approve',
    password: 'Password',
    alreadyHaveAccount: 'Already have an account? Login',
    dontHaveAccount: "Don't have an account? Register",
    needHelp: 'Need help ordering or selling on Mela Market?',
    needHelpDesc: 'Our customer support team is ready to assist you with direct telephone orders and delivery dispatch.',
    customerHotline: 'Customer Hotline',
    copyright: 'All rights reserved. Mela Market',
    paymentAccepted: 'We accept Telebirr, CBE Birr, and Cash on Delivery.',
    etbCurrency: 'ETB',
  },
  ti: {
    siteTitle: 'መላ ዕዳጋ',
    tagline: 'ዲጂታል ዕዳጋ ኢትዮጵያ',
    heroHeading: 'ሓደስቲን ዝተጠቀምኩምሎምን ኣቑሑትኩምን ፍርያትኩምን ሽጡን ዓድጉን።',
    heroSubheading: 'ዝተረጋገጹ ሓደስትን ዝተጠቀምኩምሎምን ኣቑሑት ብቐሊሉ ዓድጉን ሽጡን።',
    searchPlaceholder: 'እንታይ ትደልዩ? (ንኣብነት፦ ስልኪ፣ ቡን፣ መኪና፣ ገዛ...)',
    allCities: 'መላእ ኢትዮጵያ',
    postFreeAd: 'ምልክታ ልጠፉ',
    callDirect: 'ደውሉ',
    directSupport: 'ኣገልግሎት ደንበኛታት',
    nationwideDelivery: 'ኣብ መላእ ኢትዮጵያ ናይ ምብጻሕ ኣገልግሎት',
    categories: 'ምድባት ኣቑሑት',
    allCategories: 'ኩሎም ምድባት',
    verifiedSellers: 'ዝተረጋገጹ ነጋዶ',
    fastDelivery: 'ቅልጡፍ ምብጻሕ',
    securePayments: 'ቴሌብርን ሲቢኢ ብርን',
    featuredListings: 'ዝተመረጹ ኣቑሑት',
    showingItems: 'ዝተረኽቡ ኣቑሑት፦',
    resetFilters: 'መጽረዪ ኣጽሪ',
    noItemsFound: 'ዝተረኽበ ኣቕሓ የለን',
    noItemsDesc: 'በጃኹም ዝተፈልየ ቃል ተጠቐሙ ወይ መጽረዪታትኩም ኣጽርዩ።',
    viewAllListings: 'ኩሎም ኣቑሑት ርኣዩ',
    callToInquire: 'ደውሉን እዘዙን',
    addToCart: 'ናብ ቅርጫት ወስኽ',
    addedToCart: 'ተወሲኹ',
    inStock: 'ኣብ መኽዘን ኣሎ',
    condition: 'ኩነታት',
    location: 'ቦታ',
    seller: 'ነጋዳይ',
    verifiedMerchant: 'ዝተረጋገጸ ነጋዳይ',
    description: 'ዝርዝር መግለጺ',
    specifications: 'ቀንዲ መለለዪታት',
    shoppingCart: 'ናይ ዕዳጋ ቅርጫትኩም',
    cartEmpty: 'ቅርጫትኩም ባዶ እዩ',
    cartEmptyDesc: 'ዝደለኹምዎ ኣቕሓ ምስ መረጽኩም ኣብዚ ክረአ እዩ።',
    exploreMarketplace: 'ዕዳጋ ተዓዘቡ',
    subtotal: 'ድምር',
    deliveryFee: 'ክፍሊት ምብጻሕ',
    total: 'ሓፈሻዊ ድምር',
    proceedToCheckout: 'ናብ ክፍሊት ቀጽሉ',
    deliveryDetails: 'ናይ ምብጻሕ ኣድራሻን ክፍሊትን',
    fullName: 'ምሉእ ስም',
    phoneNumber: 'ቁጽሪ ስልኪ',
    deliveryAddress: 'ከተማን ከባቢን',
    paymentMethod: 'ዓይነት ክፍሊት',
    confirmOrder: 'ትእዛዝ ኣረጋግጽ',
    orderReceived: 'ትእዛዝኩም ብዕውት መንገዲ ተቐቢልናዮ ኣለና!',
    orderReceivedDesc: 'ናይ ምብጻሕ ጉጅለና ትእዛዝኩም ንምርግጋጽ ብስልኪ ክድውለልኩም እዩ።',
    orderCallNotice: 'ንቕልጡፍ ሓገዝ ብቐጥታ ደውሉ፡',
    continueShopping: 'ዕዳጋ ቀጽሉ',
    back: 'ተመለስ',
    items: 'ኣቑሑት',
    sellTitle: 'ኣብ መላ ዕዳጋ ሽጡ',
    sellSub: 'ኣቕሓኹም ብቐሊሉ ብምምዝጋብ ንዓደግቲ ኣቕርቡ',
    listingTitle: 'ስም ኣቕሓ',
    price: 'ዋጋ (ብር)',
    listingSubmitted: 'ምልክታኹም ብዕውት መንገዲ ተላኢኹ!',
    listingSubmittedDesc: 'ጉጅለና ፈቲሹ ኣብ ሓጺር ግዜ ከውጽኦ እዩ።',
    submitListing: 'ብነጻ ልጠፉ',
    login: 'እተዉ',
    register: 'ተመዝገቡ',
    myAccount: 'ሕሳበይ',
    logout: 'ውጻእ',
    adminDashboard: 'ናይ ኣድሚን ዳሽቦርድ',
    adminOverview: 'ሓፈሻዊ ኩነታት ዕዳጋ',
    manageListings: 'ኣቑሑት ኣመሓድር',
    totalListings: 'ድምር ኣቑሑት',
    activeOrders: 'ንቑሓት ትእዛዛት',
    deleteListing: 'ሰርዝ',
    approveListing: 'ኣጽድቕ',
    password: 'መሕለፊ ቃል',
    alreadyHaveAccount: 'ሕሳብ ኣለኩም ድዩ? እተዉ',
    dontHaveAccount: 'ሕሳብ የብልኩምን ድዩ? ተመዝገቡ',
    needHelp: 'ኣቕሓ ንምእዛዝ ወይ ንምሻጥ ሓገዝ ትደልዩ ዲኹም?',
    needHelpDesc: 'ናይ ዓደግቲ ኣገልግሎት ጉጅለና ብስልኪ ንዝወሃብ ትእዛዝን ምብጻሕን ንምሕጋዝ ድሉው እዩ።',
    customerHotline: 'ናይ ዓደግቲ መስመር ስልኪ',
    copyright: 'ኩሉ መሰል ዝተሓለወ እዩ። መላ ዕዳጋ',
    paymentAccepted: 'ክፍሊት ብቴሌብር፣ ብሲቢኢ ብርን ምስ በጽሐ ብጥረ ገንዘብን ንቕበል ኢና።',
    etbCurrency: 'ብር',
  },
};
