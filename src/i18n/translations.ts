export type Language = 'am' | 'en' | 'ti';

export interface Translations {
  appName: string;
  tagline: string;
  home: string;
  browse: string;
  newProducts: string;
  usedProducts: string;
  newBadge: string;
  usedBadge: string;
  categories: string;
  allCategories: string;
  searchPlaceholder: string;
  searchButton: string;
  filters: string;
  clearFilters: string;
  applyFilters: string;
  condition: string;
  allConditions: string;
  location: string;
  region: string;
  woreda: string;
  city: string;
  allRegions: string;
  allWoredas: string;
  allCities: string;
  priceRange: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  newest: string;
  priceLowHigh: string;
  priceHighLow: string;
  mostViewed: string;
  currency: string;
  viewDetails: string;
  seller: string;
  sellerDashboard: string;
  adminDashboard: string;
  myInquiries: string;
  myOrders: string;
  login: string;
  register: string;
  logout: string;
  googleSignIn: string;
  orContinueWith: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  accountType: string;
  customerRole: string;
  sellerRole: string;
  forgotPassword: string;
  resetPassword: string;
  noAccount: string;
  haveAccount: string;
  contactAdminWhatsApp: string;
  whatsappNotice: string;
  whatsappNotConfigured: string;
  sendInquiry: string;
  orderNow: string;
  inquiryTitle: string;
  inquiryMessage: string;
  inquirySuccess: string;
  orderTitle: string;
  quantity: string;
  totalPrice: string;
  deliveryAddress: string;
  orderSuccess: string;
  orderPaymentNotice: string;
  addProduct: string;
  editProduct: string;
  deleteProduct: string;
  confirmDelete: string;
  productName: string;
  priceETB: string;
  description: string;
  cameraTitle: string;
  cameraSubtitle: string;
  startCamera: string;
  capturePhoto: string;
  retakePhoto: string;
  confirmPhoto: string;
  switchCamera: string;
  cameraPermissionError: string;
  cameraSecureContextNotice: string;
  cameraRequiredNotice: string;
  photosCaptured: string;
  maxPhotosNotice: string;
  status: string;
  active: string;
  pending: string;
  sold: string;
  archived: string;
  saveChanges: string;
  cancel: string;
  loading: string;
  noProductsFound: string;
  featuredProducts: string;
  recentProducts: string;
  statistics: string;
  totalProductsStat: string;
  newProductsStat: string;
  usedProductsStat: string;
  customersStat: string;
  sellersStat: string;
  inquiriesStat: string;
  ordersStat: string;
  auditLogs: string;
  websiteSettings: string;
  adminWhatsAppConfig: string;
  updateSetting: string;
  manageUsers: string;
  manageLocations: string;
  changeRole: string;
  adminRole: string;
  action: string;
  timestamp: string;
  details: string;
  success: string;
  error: string;
  previous: string;
  next: string;
  preview: string;
  all: string;
  newCondition: string;
  usedCondition: string;
}

export const translations: Record<Language, Translations> = {
  am: {
    appName: 'መላ ገበያ',
    tagline: 'የኢትዮጵያ ታላቁ የመስመር ላይ የገበያ መድረክ',
    home: 'መነሻ',
    browse: 'ምርቶችን አስስ',
    newProducts: 'አዲስ እቃዎች',
    usedProducts: 'ያገለገሉ እቃዎች',
    newBadge: 'አዲስ',
    usedBadge: 'ያገለገለ',
    categories: 'ምድቦች',
    allCategories: 'ሁሉም ምድቦች',
    searchPlaceholder: 'በመላ ገበያ ውስጥ እቃዎችን፣ ሞዴሎችን ፈልግ...',
    searchButton: 'ፈልግ',
    filters: 'ማጣሪያዎች',
    clearFilters: 'ሁሉንም አጽዳ',
    applyFilters: 'ማጣሪያ ተግብር',
    condition: 'የእቃው ይዞታ',
    allConditions: 'ሁሉም ይዞታዎች',
    location: 'አድራሻ / ቦታ',
    region: 'ክልል',
    woreda: 'ወረዳ',
    city: 'ከተማ',
    allRegions: 'ሁሉም ክልሎች',
    allWoredas: 'ሁሉም ወረዳዎች',
    allCities: 'ሁሉም ከተሞች',
    priceRange: 'የዋጋ መጠን (ብር)',
    minPrice: 'ዝቅተኛ ዋጋ',
    maxPrice: 'ከፍተኛ ዋጋ',
    sortBy: 'አደራደር',
    newest: 'አዳዲሶች መጀመሪያ',
    priceLowHigh: 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ',
    priceHighLow: 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ',
    mostViewed: 'ብዙ የታዩ',
    currency: 'ብር',
    viewDetails: 'ዝርዝር እይ',
    seller: 'ሻጭ',
    sellerDashboard: 'የሻጭ ዳሽቦርድ',
    adminDashboard: 'የአስተዳዳሪ ዳሽቦርድ',
    myInquiries: 'የላኳቸው ጥያቄዎች',
    myOrders: 'ትዕዛዞቼ',
    login: 'ግባ',
    register: 'ተመዝገብ',
    logout: 'ውጣ',
    googleSignIn: 'በGoogle ግባ',
    orContinueWith: 'ወይም በኢሜይል ይቀጥሉ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    confirmPassword: 'የይለፍ ቃል አረጋግጥ',
    fullName: 'ሙሉ ስም / የንግድ ስም',
    phone: 'ስልክ ቁጥር',
    accountType: 'የመለያ አይነት',
    customerRole: 'ገዢ (ደንበኛ)',
    sellerRole: 'ሻጭ (ነጋዴ)',
    forgotPassword: 'የይለፍ ቃል ረሱ?',
    resetPassword: 'የይለፍ ቃል ቀይር',
    noAccount: 'መለያ የለዎትም? አሁኑኑ ይመዝገቡ',
    haveAccount: 'መለያ አለዎት? ይግቡ',
    contactAdminWhatsApp: 'ከአስተዳዳሪው ጋር በWhatsApp ተገናኝ',
    whatsappNotice: 'ስለዚህ እቃ ዝርዝር መረጃ ለማግኘት ይፋዊ የአስተዳዳሪ WhatsApp ይጠቀሙ።',
    whatsappNotConfigured: 'የአስተዳዳሪው የWhatsApp ቁጥር እስካሁን አልተዘጋጀም።',
    sendInquiry: 'ስለ እቃው ጠይቅ',
    orderNow: 'እቃውን እዘዝ',
    inquiryTitle: 'ስለ እቃው ጥያቄ ማቅረቢያ',
    inquiryMessage: 'የሚፈልጉትን መረጃ ወይም ጥያቄ እዚህ ይጻፉ...',
    inquirySuccess: 'ጥያቄዎ በተሳካ ሁኔታ ተልኳል! ሻጩና አስተዳዳሪው ምላሽ ይሰጡዎታል።',
    orderTitle: 'የእቃ መግዣ ጥያቄ ማቅረቢያ',
    quantity: 'ብዛት',
    totalPrice: 'ጠቅላላ ዋጋ',
    deliveryAddress: 'የሚረከቡበት ትክክለኛ አድራሻ',
    orderSuccess: 'የትዕዛዝ ጥያቄዎ ደርሷል! ክፍያና ርክክብን ለማመቻቸት ይደወልልዎታል።',
    orderPaymentNotice: 'ማሳሰቢያ፡ ክፍያ በቀጥታ በእጅ ወይም በባንክ ርክክብ ወቅት ይፈጸማል።',
    addProduct: 'አዲስ እቃ ጨምር',
    editProduct: 'እቃ አሻሽል',
    deleteProduct: 'እቃ ሰርዝ',
    confirmDelete: 'እርግጠኛ ነዎት ይህን እቃ መሰረዝ ይፈልጋሉ?',
    productName: 'የእቃው ስም',
    priceETB: 'ዋጋ በብር (ETB)',
    description: 'ዝርዝር ማብራሪያ',
    cameraTitle: 'በካሜራ ፎቶ አንሳ',
    cameraSubtitle: 'ትክክለኛነትን ለማረጋገጥ የእቃ ፎቶዎች የሚነሱት በቀጥታ በካሜራ ብቻ ነው።',
    startCamera: 'ካሜራ ክፈት',
    capturePhoto: 'ፎቶ አንሳ',
    retakePhoto: 'እንደገና አንሳ',
    confirmPhoto: 'ፎቶውን ተቀበል',
    switchCamera: 'ካሜራ ቀይር',
    cameraPermissionError: 'የካሜራ ፈቃድ አልተሰጠም ወይም ካሜራው አልተገኘም። እባክዎ በብሮውዘርዎ የካሜራ ፈቃድ ይስጡ።',
    cameraSecureContextNotice: 'ካሜራ ለመጠቀም HTTPS ወይም ደህንነቱ የተጠበቀ ግንኙነት ያስፈልጋል።',
    cameraRequiredNotice: 'ቢያንስ አንድ በካሜራ የተነሳ ፎቶ ማስገባት ግዴታ ነው።',
    photosCaptured: 'የተነሱ ፎቶዎች',
    maxPhotosNotice: 'እስከ 5 ፎቶዎችን ማንሳት ይችላሉ።',
    status: 'ሁኔታ',
    active: 'ንቁ (በሽያጭ ላይ)',
    pending: 'በመጠባበቅ ላይ',
    sold: 'የተሸጠ',
    archived: 'የተቀመጠ',
    saveChanges: 'ለውጦችን መዝግብ',
    cancel: 'ይቅር',
    loading: 'በመጫን ላይ...',
    noProductsFound: 'ምንም የተገኘ እቃ የለም። እባክዎ ሌሎች ማጣሪያዎችን ይሞክሩ።',
    featuredProducts: 'ተለይተው የቀረቡ እቃዎች',
    recentProducts: 'በቅርብ የተጨመሩ እቃዎች',
    statistics: 'የገበያ ስታቲስቲክስ',
    totalProductsStat: 'ጠቅላላ እቃዎች',
    newProductsStat: 'አዲስ እቃዎች',
    usedProductsStat: 'ያገለገሉ እቃዎች',
    customersStat: 'ጠቅላላ ደንበኞች',
    sellersStat: 'ጠቅላላ ሻጮች',
    inquiriesStat: 'ጠቅላላ ጥያቄዎች',
    ordersStat: 'ጠቅላላ ትዕዛዞች',
    auditLogs: 'የአስተዳዳሪ ቁጥጥር ምዝግብ (Audit Logs)',
    websiteSettings: 'የድረ-ገጽ ቅንብሮች',
    adminWhatsAppConfig: 'ይፋዊ የአስተዳዳሪ WhatsApp ቁጥር (ለምሳሌ +251911223344)',
    updateSetting: 'ቅንብር መዝግብ',
    manageUsers: 'ተጠቃሚዎችን አስተዳድር',
    manageLocations: 'ክልሎችን፣ ወረዳዎችንና ከተሞችን አስተዳድር',
    changeRole: 'ሚና ቀይር',
    adminRole: 'አስተዳዳሪ (Admin)',
    action: 'ተግባር',
    timestamp: 'ቀንና ሰዓት',
    details: 'ዝርዝር',
    success: 'ተሳክቷል!',
    error: 'ስህተት ተከስቷል',
    previous: 'የቀደመ',
    next: 'የሚቀጥለው',
    preview: 'በትልቅ እይ (Preview)',
    all: 'ሁሉም',
    newCondition: 'አዲስ',
    usedCondition: 'ያገለገሉ',
  },
  en: {
    appName: 'Mela Market',
    tagline: 'Ethiopia’s Premier Online Marketplace',
    home: 'Home',
    browse: 'Browse Products',
    newProducts: 'New Products',
    usedProducts: 'Used Products',
    newBadge: 'New',
    usedBadge: 'Used',
    categories: 'Categories',
    allCategories: 'All Categories',
    searchPlaceholder: 'Search products, brands, models in Mela Market...',
    searchButton: 'Search',
    filters: 'Filters',
    clearFilters: 'Clear All',
    applyFilters: 'Apply Filters',
    condition: 'Condition',
    allConditions: 'All Conditions',
    location: 'Location',
    region: 'Region',
    woreda: 'Woreda',
    city: 'City / Town',
    allRegions: 'All Regions',
    allWoredas: 'All Woredas',
    allCities: 'All Cities',
    priceRange: 'Price Range (ETB)',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    sortBy: 'Sort By',
    newest: 'Newest First',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    mostViewed: 'Most Viewed',
    currency: 'ETB',
    viewDetails: 'View Details',
    seller: 'Seller',
    sellerDashboard: 'Seller Dashboard',
    adminDashboard: 'Admin Dashboard',
    myInquiries: 'My Inquiries',
    myOrders: 'My Orders',
    login: 'Sign In',
    register: 'Register',
    logout: 'Sign Out',
    googleSignIn: 'Sign In with Google',
    orContinueWith: 'or continue with email',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name / Business Name',
    phone: 'Phone Number',
    accountType: 'Account Type',
    customerRole: 'Customer (Buyer)',
    sellerRole: 'Seller (Merchant)',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    noAccount: "Don't have an account? Register now",
    haveAccount: 'Already have an account? Sign in',
    contactAdminWhatsApp: 'Contact Official Admin on WhatsApp',
    whatsappNotice: 'Use the single official administrator WhatsApp link to inquire directly about this product.',
    whatsappNotConfigured: 'Official Admin WhatsApp number has not been configured yet.',
    sendInquiry: 'Ask About Product',
    orderNow: 'Order Product',
    inquiryTitle: 'Submit Product Inquiry',
    inquiryMessage: 'Enter your message or questions about this item...',
    inquirySuccess: 'Inquiry submitted successfully! The seller and administrator have been notified.',
    orderTitle: 'Place Order Request',
    quantity: 'Quantity',
    totalPrice: 'Total Price',
    deliveryAddress: 'Delivery / Pickup Address',
    orderSuccess: 'Order request received! You will be contacted for delivery and coordination.',
    orderPaymentNotice: 'Notice: Payment is handled upon personal pickup or local bank transfer.',
    addProduct: 'Add New Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    confirmDelete: 'Are you sure you want to delete this product listing?',
    productName: 'Product Title',
    priceETB: 'Price in ETB',
    description: 'Detailed Description',
    cameraTitle: 'Capture Photos with Camera',
    cameraSubtitle: 'To ensure authenticity, product photos must be taken live using your device camera.',
    startCamera: 'Start Camera',
    capturePhoto: 'Capture Photo',
    retakePhoto: 'Retake',
    confirmPhoto: 'Confirm Photo',
    switchCamera: 'Switch Camera',
    cameraPermissionError: 'Camera permission denied or camera not found. Please enable camera access in your browser.',
    cameraSecureContextNotice: 'Camera access requires a secure context (HTTPS or localhost).',
    cameraRequiredNotice: 'At least one camera-captured photo is required.',
    photosCaptured: 'Captured Photos',
    maxPhotosNotice: 'You can capture up to 5 photos.',
    status: 'Status',
    active: 'Active',
    pending: 'Pending',
    sold: 'Sold',
    archived: 'Archived',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    loading: 'Loading...',
    noProductsFound: 'No products found matching your search and filter criteria.',
    featuredProducts: 'Featured Products',
    recentProducts: 'Recently Added Products',
    statistics: 'Marketplace Statistics',
    totalProductsStat: 'Total Products',
    newProductsStat: 'New Products',
    usedProductsStat: 'Used Products',
    customersStat: 'Total Customers',
    sellersStat: 'Total Sellers',
    inquiriesStat: 'Total Inquiries',
    ordersStat: 'Total Orders',
    auditLogs: 'Administrator Audit Logs',
    websiteSettings: 'Website Settings',
    adminWhatsAppConfig: 'Official Administrator WhatsApp Number (e.g. +251911223344)',
    updateSetting: 'Update Setting',
    manageUsers: 'Manage Users',
    manageLocations: 'Manage Regions, Woredas & Cities',
    changeRole: 'Change Role',
    adminRole: 'Administrator',
    action: 'Action',
    timestamp: 'Timestamp',
    details: 'Details',
    success: 'Success!',
    error: 'An error occurred',
    previous: 'Previous',
    next: 'Next',
    preview: 'Preview (Enlarge)',
    all: 'All',
    newCondition: 'New',
    usedCondition: 'Used',
  },
  ti: {
    appName: 'መላ ዕዳጋ',
    tagline: 'ናይ ኢትዮጵያ ቀዳማይ ናይ ኢንተርኔት ዕዳጋ',
    home: 'መበገሲ',
    browse: 'ኣቑሑ ድለ',
    newProducts: 'ሓደሽቲ ኣቑሑ',
    usedProducts: 'ዝተጠቕሙሎም ኣቑሑ',
    newBadge: 'ሓዱሽ',
    usedBadge: 'ዝተጠቕመ',
    categories: 'ምድባት',
    allCategories: 'ኩሎም ምድባት',
    searchPlaceholder: 'ኣብ መላ ዕዳጋ ኣቑሑ፣ ሞዴላት ድለ...',
    searchButton: 'ድለ',
    filters: 'መጽረዪታት',
    clearFilters: 'ኩሉ ኣጽሪ',
    applyFilters: 'መጽረዪ ተግብር',
    condition: 'ኩነታት ኣቑሑ',
    allConditions: 'ኩሎም ኩነታት',
    location: 'ቦታ / ኣድራሻ',
    region: 'ክልል',
    woreda: 'ወረዳ',
    city: 'ከተማ',
    allRegions: 'ኩሎም ክልላት',
    allWoredas: 'ኩሎም ወረዳታት',
    allCities: 'ኩለን ከተማታት',
    priceRange: 'መጠን ዋጋ (ቅርሺ)',
    minPrice: 'ዝተሓተ ዋጋ',
    maxPrice: 'ዝለዓለ ዋጋ',
    sortBy: 'ኣሰላልፋ',
    newest: 'ሓደሽቲ መጀመርያ',
    priceLowHigh: 'ዋጋ፡ ካብ ዝተሓተ ናብ ዝለዓለ',
    priceHighLow: 'ዋጋ፡ ካብ ዝለዓለ ናብ ዝተሓተ',
    mostViewed: 'ብዙሕ ዝተራእዩ',
    currency: 'ቅርሺ',
    viewDetails: 'ዝርዝር ርአ',
    seller: 'ነጋዳይ / ሸያጢ',
    sellerDashboard: 'ዳሽቦርድ ሸያጢ',
    adminDashboard: 'ዳሽቦርድ ኣመሓዳሪ',
    myInquiries: 'ዝተላእኩ ሕቶታት',
    myOrders: 'ትእዛዛተይ',
    login: 'እቶ',
    register: 'ተመዝገብ',
    logout: 'ውጻእ',
    googleSignIn: 'ብGoogle እቶ',
    orContinueWith: 'ወይ ብኢመይል ቀጽል',
    email: 'ኢመይል',
    password: 'መሕለፊ ቃል',
    confirmPassword: 'መሕለፊ ቃል ኣረጋግጽ',
    fullName: 'ምሉእ ስም / ስም ትካል',
    phone: 'ቁጽሪ ተሌፎን',
    accountType: 'ዓይነት ሕሳብ',
    customerRole: 'ዓዳጊ (ደንበኛ)',
    sellerRole: 'ነጋዳይ (ሸያጢ)',
    forgotPassword: 'መሕለፊ ቃል ረስዒዕካ?',
    resetPassword: 'መሕለፊ ቃል ቀይር',
    noAccount: 'ሕሳብ የብልካን? ሕጂ ተመዝገብ',
    haveAccount: 'ሕሳብ ኣለካ ድዩ? እቶ',
    contactAdminWhatsApp: 'ምስ ኣመሓዳሪ ብWhatsApp ተራኸብ',
    whatsappNotice: 'ብዛዕባ እዚ ኣቕሓ ሓበሬታ ንምርካብ ወግዓዊ WhatsApp ኣመሓዳሪ ተጠቐም።',
    whatsappNotConfigured: 'ናይ ኣመሓዳሪ WhatsApp ቁጽሪ ገና ኣይተዳለወን።',
    sendInquiry: 'ሕቶ ሕተት',
    orderNow: 'ኣቕሓ እዘዝ',
    inquiryTitle: 'ናይ ኣቕሓ ሕቶ ምቕራብ',
    inquiryMessage: 'ዝደለይዎ ሓበሬታ ወይ ሕቶ ኣብዚ ጽሓፉ...',
    inquirySuccess: 'ሕቶኹም ብዓወት ተላኢኹ! ሸያጥን ኣመሓዳርን ክምልሱልኩም እዮም።',
    orderTitle: 'ናይ ትእዛዝ ሕቶ ምቕራብ',
    quantity: 'ብዝሒ',
    totalPrice: 'ጠቕላላ ዋጋ',
    deliveryAddress: 'ዝረኽብሉ ትክክለኛ ኣድራሻ',
    orderSuccess: 'ትእዛዝኩም በጺሑ! ኣከፋፍላን ርክክብን ንምምችቻው ክድወለልኩም እዩ።',
    orderPaymentNotice: 'መተሓሳሰቢ፡ ክፍሊት ብቐጥታ ወይ ብባንኪ ኣብ ርክክብ ይፍጸም።',
    addProduct: 'ሓዱሽ ኣቕሓ ወስኽ',
    editProduct: 'ኣቕሓ ኣመሓይሽ',
    deleteProduct: 'ኣቕሓ ሰርዝ',
    confirmDelete: 'ነዚ ኣቕሓ ንምስራዝ ርግጸኛ ዲኻ?',
    productName: 'ስም ኣቕሓ',
    priceETB: 'ዋጋ ብቅርሺ (ETB)',
    description: 'ዝርዝር መግለጺ',
    cameraTitle: 'ብካሜራ ፎቶ ኣልዕል',
    cameraSubtitle: 'ንትክክለኛነት ንምርግጋጽ ናይ ኣቑሑ ፎቶታት ብቀጥታ ብካሜራ ጥራይ ይለዓሉ።',
    startCamera: 'ካሜራ ኽፈት',
    capturePhoto: 'ፎቶ ኣልዕል',
    retakePhoto: 'ደጊምካ ኣልዕል',
    confirmPhoto: 'ፎቶ ተቐበል',
    switchCamera: 'ካሜራ ቐይር',
    cameraPermissionError: 'ናይ ካሜራ ፍቓድ ኣይተዋህበን። በይዞም ኣብ ብሮውዘርኩም ፍቓድ ሃቡ።',
    cameraSecureContextNotice: 'ካሜራ ንምጥቃም HTTPS ወይ ውሑስ መርበብ የድሊ።',
    cameraRequiredNotice: 'ብውሕዱ ሓደ ብካሜራ ዝተላዕለ ፎቶ የድሊ።',
    photosCaptured: 'ዝተላዕሉ ፎቶታት',
    maxPhotosNotice: 'ክሳብ 5 ፎቶታት ከተልዕሉ ትኽእሉ ኢኹም።',
    status: 'ኩነታት',
    active: 'ንጡፍ (ኣብ ዕዳጋ ዘሎ)',
    pending: 'ዝጽበ ዘሎ',
    sold: 'ዝተሸጠ',
    archived: 'ዝተዓቀበ',
    saveChanges: 'ለውጥታት መዝግብ',
    cancel: 'ሰርዝ',
    loading: 'ይጽዕን ኣሎ...',
    noProductsFound: 'ዝተረኽበ ኣቕሓ የለን። በይዞም ካልእ መጽረዪታት ፈትኑ።',
    featuredProducts: 'ፍሉያት ኣቑሑ',
    recentProducts: 'ኣብ ቀረባ ዝተወሰኹ ኣቑሑ',
    statistics: 'ናይ ዕዳጋ ስታቲስቲክስ',
    totalProductsStat: 'ጠቕላላ ኣቑሑ',
    newProductsStat: 'ሓደሽቲ ኣቑሑ',
    usedProductsStat: 'ዝተጠቕሙሎም ኣቑሑ',
    customersStat: 'ጠቕላላ ዓደግቲ',
    sellersStat: 'ጠቕላላ ነጋዶ',
    inquiriesStat: 'ጠቕላላ ሕቶታት',
    ordersStat: 'ጠቕላላ ትእዛዛት',
    auditLogs: 'ናይ ኣመሓዳሪ መዝገብ (Audit Logs)',
    websiteSettings: 'ናይ መርበብ ቅጥዕታት',
    adminWhatsAppConfig: 'ወግዓዊ ናይ ኣመሓዳሪ WhatsApp ቁጽሪ (ንኣብነት +251911223344)',
    updateSetting: 'ቅጥዒ መዝግብ',
    manageUsers: 'ተጠቀምቲ ኣመሓድር',
    manageLocations: 'ክልላት፣ ወረዳታትን ከተማታትን ኣመሓድር',
    changeRole: 'ተራ ቐይር',
    adminRole: 'ኣመሓዳሪ',
    action: 'ተግባር',
    timestamp: 'ዕለት / ሰዓት',
    details: 'ዝርዝር',
    success: 'ተዓዊቱ!',
    error: 'ስሕተት ተረኺቡ',
    previous: 'ዝሓለፈ',
    next: 'ዝቕጽል',
    preview: 'ብዓቢ ርአ (Preview)',
    all: 'ኩሎም',
    newCondition: 'ሓዱሽ',
    usedCondition: 'ዝተጠቕመ',
  },
};
