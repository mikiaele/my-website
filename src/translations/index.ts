import { Language } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  searchPlaceholder: string;
  allCategories: string;
  allRegions: string;
  newProducts: string;
  usedProducts: string;
  featuredProducts: string;
  sellProduct: string;
  login: string;
  register: string;
  logout: string;
  profile: string;
  adminDashboard: string;
  condition: string;
  conditionNew: string;
  conditionUsed: string;
  price: string;
  etb: string;
  location: string;
  seller: string;
  contactSeller: string;
  sendInquiry: string;
  inquirySuccess: string;
  viewDetails: string;
  quickPreview: string;
  next: string;
  prev: string;
  filterBy: string;
  searchBtn: string;
  noProductsFound: string;
  officialSupportWhatsApp: string;
  officialSupportDesc: string;
  // Sell Form
  sellTitle: string;
  sellSubtitle: string;
  productName: string;
  category: string;
  description: string;
  region: string;
  district: string;
  city: string;
  contactPhone: string;
  productPhoto: string;
  takePhotoWithCamera: string;
  orUploadFile: string;
  publishProduct: string;
  publishing: string;
  sellAuthRequired: string;
  sellAuthDesc: string;
  // Camera
  cameraTitle: string;
  cameraAccessDenied: string;
  cameraNotFound: string;
  cameraStartError: string;
  capturePhoto: string;
  switchCamera: string;
  retake: string;
  usePhoto: string;
  closeCamera: string;
  // Auth Form
  welcomeBack: string;
  createAccount: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  profilePhoto: string;
  takeProfilePhoto: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  loggingIn: string;
  registering: string;
  // Admin
  adminTitle: string;
  dbStatus: string;
  dbConnected: string;
  dbDisconnected: string;
  dbEngine: string;
  verifyDb: string;
  totalUsers: string;
  totalProducts: string;
  totalInquiries: string;
  totalReports: string;
  manageProducts: string;
  manageUsers: string;
  inquiriesTab: string;
  reportsTab: string;
  deleteBtn: string;
  approveBtn: string;
  close: string;
  status: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  reportListing: string;
  reportSuccess: string;
}

export const translations: Record<Language, Translations> = {
  am: {
    appName: 'መላ ማርኬት',
    tagline: 'አዳዲስ እና ያገለገሉ እቃዎችን በጥራት እና በታማኝነት የሚገበያዩበት',
    searchPlaceholder: 'የሚፈልጉትን እቃ፣ ሞዴል ወይም አገልግሎት ይፈልጉ...',
    allCategories: 'ሁሉም ምድቦች',
    allRegions: 'ሁሉም ክልሎች',
    newProducts: 'አዳዲስ እቃዎች',
    usedProducts: 'ያገለገሉ እቃዎች',
    featuredProducts: 'ተመራጭ እቃዎች',
    sellProduct: 'ለሽያጭ ያቅርቡ',
    login: 'ግባ',
    register: 'ተመዝገብ',
    logout: 'ውጣ',
    profile: 'መገለጫ',
    adminDashboard: 'የአስተዳዳሪ ክፍል',
    condition: 'ሁኔታ',
    conditionNew: 'አዲስ',
    conditionUsed: 'ያገለገለ',
    price: 'ዋጋ',
    etb: 'ብር',
    location: 'አድራሻ',
    seller: 'ሻጭ',
    contactSeller: 'ሻጩን ያግኙ',
    sendInquiry: 'ጥያቄ ይላኩ',
    inquirySuccess: 'ጥያቄዎ በተሳካ ሁኔታ ለሻጩ ተልኳል!',
    viewDetails: 'ሙሉ መረጃ ይመልከቱ',
    quickPreview: 'ፈጣን ቅድመ-እይታ',
    next: 'ቀጣይ',
    prev: 'ቀዳሚ',
    filterBy: 'አጣራ በ',
    searchBtn: 'ፈልግ',
    noProductsFound: 'ምንም የተገኘ እቃ የለም።',
    officialSupportWhatsApp: 'የመላ ማርኬት ዋና ዋትስአፕ (WhatsApp): @brmiki21',
    officialSupportDesc: 'ለማንኛውም ድጋፍ ወይም የገበያ አስተዳደር ጥያቄ በቀጥታ በዋትስአፕ ያግኙን።',
    sellTitle: 'እቃዎን ለሽያጭ ያቅርቡ',
    sellSubtitle: 'ትክክለኛ መረጃ እና የካሜራ ፎቶ በማስገባት እቃዎን በፍጥነት ይሽጡ',
    productName: 'የእቃው ስም',
    category: 'ምድብ',
    description: 'የእቃው ዝርዝር መግለጫ',
    region: 'ክልል',
    district: 'ክፍለ ከተማ / ወረዳ',
    city: 'ከተማ',
    contactPhone: 'የስልክ ቁጥር',
    productPhoto: 'የእቃው ፎቶ',
    takePhotoWithCamera: 'በካሜራ ፎቶ አንሳ',
    orUploadFile: 'ወይም ከፋይል ይምረጡ',
    publishProduct: 'ለሽያጭ ይለጥፉ',
    publishing: 'እየተለጠፈ ነው...',
    sellAuthRequired: 'እቃ ለመሸጥ መመዝገብ ወይም መግባት ያስፈልጋል',
    sellAuthDesc: 'እባክዎ እቃዎን ከመለጠፍዎ በፊት ይግቡ ወይም ይመዝገቡ።',
    cameraTitle: 'በመሳሪያዎ ካሜራ ፎቶ ያንሱ',
    cameraAccessDenied: 'የካሜራ ፈቃድ አልተሰጠም። እባክዎ በብራውዘርዎ ፈቃድ ይስጡ ወይም ፋይል ይምረጡ።',
    cameraNotFound: 'የካሜራ መሳሪያ አልተገኘም። እባክዎ ከስልክዎ ወይም ከኮምፒውተርዎ ፋይል ይጫኑ።',
    cameraStartError: 'ካሜራውን መክፈት አልተቻለም።',
    capturePhoto: 'ፎቶ አንሳ',
    switchCamera: 'ካሜራ ቀይር (ፊት/ኋላ)',
    retake: 'እንደገና አንሳ',
    usePhoto: 'ፎቶውን ተጠቀም',
    closeCamera: 'ዝጋ',
    welcomeBack: 'እንኳን ደህና መጡ',
    createAccount: 'አዲስ መለያ ይክፈቱ',
    fullName: 'ሙሉ ስም',
    email: 'ኢሜይል አድራሻ',
    phoneNumber: 'ስልክ ቁጥር',
    password: 'የይለፍ ቃል',
    profilePhoto: 'የመገለጫ ፎቶ (ካሜራ)',
    takeProfilePhoto: 'የመገለጫ ፎቶ በካሜራ አንሳ',
    dontHaveAccount: 'መለያ የለዎትም? ይመዝገቡ',
    alreadyHaveAccount: 'መለያ አለዎት? ይግቡ',
    loggingIn: 'በመግባት ላይ...',
    registering: 'በመመዝገብ ላይ...',
    adminTitle: 'የመላ ማርኬት አስተዳዳሪ ክፍል',
    dbStatus: 'የመረጃ ቋት (Database) ሁኔታ',
    dbConnected: 'የተገናኘ እና ዝግጁ',
    dbDisconnected: 'አልተገናኘም',
    dbEngine: 'የመረጃ ቋት አይነት',
    verifyDb: 'የዳታቤዝ ግንኙነት አረጋግጥ',
    totalUsers: 'ጠቅላላ ተጠቃሚዎች',
    totalProducts: 'ጠቅላላ እቃዎች',
    totalInquiries: 'የገዢዎች ጥያቄ',
    totalReports: 'የተላኩ ጥቆማዎች',
    manageProducts: 'እቃዎችን አስተዳድር',
    manageUsers: 'ተጠቃሚዎችን አስተዳድር',
    inquiriesTab: 'የገዢዎች ጥያቄዎች',
    reportsTab: 'ጥቆማዎች',
    deleteBtn: 'አስወግድ',
    approveBtn: 'አጽድቅ',
    close: 'ዝጋ',
    status: 'ሁኔታ',
    buyerName: 'የገዢ ስም',
    buyerEmail: 'የገዢ ኢሜይል',
    buyerPhone: 'የገዢ ስልክ',
    message: 'መልዕክት',
    reportListing: 'ይህን እቃ ጠቁም',
    reportSuccess: 'ጥቆማዎ ደርሶናል፣ እናመሰግናለን!',
  },
  en: {
    appName: 'Mela Market',
    tagline: 'Ethiopia’s trusted marketplace to buy and sell new and used goods',
    searchPlaceholder: 'Search products, electronics, vehicles, fashion...',
    allCategories: 'All Categories',
    allRegions: 'All Regions',
    newProducts: 'New Products',
    usedProducts: 'Used Products',
    featuredProducts: 'Featured Products',
    sellProduct: 'Sell Product',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    adminDashboard: 'Admin Dashboard',
    condition: 'Condition',
    conditionNew: 'New',
    conditionUsed: 'Used',
    price: 'Price',
    etb: 'ETB',
    location: 'Location',
    seller: 'Seller',
    contactSeller: 'Contact Seller',
    sendInquiry: 'Send Inquiry',
    inquirySuccess: 'Your inquiry has been sent to the seller!',
    viewDetails: 'View Details',
    quickPreview: 'Quick Preview',
    next: 'Next',
    prev: 'Previous',
    filterBy: 'Filter By',
    searchBtn: 'Search',
    noProductsFound: 'No products found matching your criteria.',
    officialSupportWhatsApp: 'Official Mela Market Support WhatsApp: @brmiki21',
    officialSupportDesc: 'For support, disputes, or business inquiries, reach our administration team directly on WhatsApp.',
    sellTitle: 'List Your Product for Sale',
    sellSubtitle: 'Provide accurate details and capture a live photo to sell fast',
    productName: 'Product Name',
    category: 'Category',
    description: 'Detailed Description',
    region: 'Region',
    district: 'Sub-city / District',
    city: 'City',
    contactPhone: 'Contact Phone Number',
    productPhoto: 'Product Photo',
    takePhotoWithCamera: 'Take Photo with Camera',
    orUploadFile: 'or choose file from device',
    publishProduct: 'Publish Product',
    publishing: 'Publishing...',
    sellAuthRequired: 'Sign in Required to Sell',
    sellAuthDesc: 'You must be registered and signed in to list products on Mela Market.',
    cameraTitle: 'Capture Photo with Your Camera',
    cameraAccessDenied: 'Camera permission denied. Please allow camera access or upload an image file.',
    cameraNotFound: 'No camera hardware found on this device. Please select an image file.',
    cameraStartError: 'Could not access the camera.',
    capturePhoto: 'Snap Photo',
    switchCamera: 'Switch Camera (Front/Rear)',
    retake: 'Retake',
    usePhoto: 'Use Photo',
    closeCamera: 'Cancel',
    welcomeBack: 'Welcome Back',
    createAccount: 'Create an Account',
    fullName: 'Full Name',
    email: 'Email Address',
    phoneNumber: 'Phone Number',
    password: 'Password',
    profilePhoto: 'Profile Photo (Camera)',
    takeProfilePhoto: 'Capture Profile Photo with Camera',
    dontHaveAccount: "Don't have an account? Register",
    alreadyHaveAccount: 'Already have an account? Login',
    loggingIn: 'Signing in...',
    registering: 'Registering...',
    adminTitle: 'Mela Market Administration Console',
    dbStatus: 'Database Connection Status',
    dbConnected: 'Connected & Verified',
    dbDisconnected: 'Disconnected',
    dbEngine: 'Database Engine',
    verifyDb: 'Verify Database Connection',
    totalUsers: 'Total Users',
    totalProducts: 'Total Listings',
    totalInquiries: 'Customer Inquiries',
    totalReports: 'User Reports',
    manageProducts: 'Manage Listings',
    manageUsers: 'Manage Users',
    inquiriesTab: 'Inquiries',
    reportsTab: 'Reports',
    deleteBtn: 'Delete',
    approveBtn: 'Approve',
    close: 'Close',
    status: 'Status',
    buyerName: 'Buyer Name',
    buyerEmail: 'Buyer Email',
    buyerPhone: 'Buyer Phone',
    message: 'Message',
    reportListing: 'Report Listing',
    reportSuccess: 'Report received. Our moderation team will review it promptly.',
  },
  ti: {
    appName: 'መላ ማርኬት',
    tagline: 'ሓደሽትን ዝተጠቐምኩምሎም ኣቑሑት ብጽሬትን ብተኣማንነትን ዝሽየጥሉን ዝዕደግሉን መድረኽ',
    searchPlaceholder: 'ዝደለይዎ ኣቕሓ፣ ሞዴል ወይ ኣገልግሎት ድለዩ...',
    allCategories: 'ኩሎም ምድባት',
    allRegions: 'ኩሎም ዞባታት',
    newProducts: 'ሓደስቲ ኣቑሑት',
    usedProducts: 'ዝተጠቐምኩምሎም ኣቑሑት',
    featuredProducts: 'ዝተመረጹ ኣቑሑት',
    sellProduct: 'ንምሻጥ ኣቕርብ',
    login: 'እቶ',
    register: 'ተመዝገብ',
    logout: 'ውጻእ',
    profile: 'መገለጺ',
    adminDashboard: 'ክፍሊ ኣመሓዳሪ',
    condition: 'ኩነታት',
    conditionNew: 'ሓዲሽ',
    conditionUsed: 'ዝተጠቐመሉ',
    price: 'ዋጋ',
    etb: 'ቅርሺ',
    location: 'ቦታ',
    seller: 'ሸያጢ',
    contactSeller: 'ንሸያጢ ተወከሱ',
    sendInquiry: 'ሕቶ ስደድ',
    inquirySuccess: 'ሕቶኹም ብዕዉት መንገዲ ናብቲ ሸያጢ ተላኢኹ ኣሎ!',
    viewDetails: 'ሙሉእ ሓበሬታ ርአ',
    quickPreview: 'ቅልጡፍ ቅድመ-ርእይቶ',
    next: 'ቀጻሊ',
    prev: 'ዝሓለፈ',
    filterBy: 'ኣጻሪ ብ',
    searchBtn: 'ድለይ',
    noProductsFound: 'ምስ ምርጫኹም ዝሰማማዕ ኣቕሓ ኣይተረኸበን።',
    officialSupportWhatsApp: 'ቀጥታዊ ዋትስኣፕ (WhatsApp) መላ ማርኬት: @brmiki21',
    officialSupportDesc: 'ንዝኾነ ደገፍ ወይ ናይ ዕዳጋ ሕቶ ብቐጥታ ብዋትስኣፕ ርኸቡና።',
    sellTitle: 'ኣቕሓኹም ንምሻጥ ኣቕርቡ',
    sellSubtitle: 'ትክክለኛ ሓበሬታን ብካሜራ ዝተወስደ ስእልን ብምእታው ኣቕሓኹም ብቕልጡፍ ሽጡ',
    productName: 'ስም ኣቕሓ',
    category: 'ምድብ',
    description: 'ዝርዝር መግለጺ ኣቕሓ',
    region: 'ዞባ / ክልል',
    district: 'ክፍለ ከተማ / ወረዳ',
    city: 'ከተማ',
    contactPhone: 'ቁጽሪ ተሌፎን',
    productPhoto: 'ስእሊ ኣቕሓ',
    takePhotoWithCamera: 'ብካሜራ ስእሊ ኣልዕል',
    orUploadFile: 'ወይ ካብ ፋይል ምረጽ',
    publishProduct: 'ንምሻጥ ፖስት ግበር',
    publishing: 'ይለጥፍ ኣሎ...',
    sellAuthRequired: 'ኣቕሓ ንምሻጥ ምምዝጋብ ወይ ምእታው የድሊ',
    sellAuthDesc: 'በጃኹም ኣቕሓኹም ቅድሚ ምልጣፍኩም እተዉ ወይ ተመዝገቡ።',
    cameraTitle: 'ብመሳርሒኹም ካሜራ ስእሊ ኣልዕሉ',
    cameraAccessDenied: 'ፍቓድ ካሜራ ኣይተውሃበን። ብኽብረትኩም ፍቓድ ሃቡ ወይ ስእሊ ፋይል ምረጹ።',
    cameraNotFound: 'መሳርሒ ካሜራ ኣይተረኽበን። ብኽብረትኩም ፋይል ምረጹ።',
    cameraStartError: 'ካሜራ ክኽፈት ኣይከኣለን።',
    capturePhoto: 'ስእሊ ኣልዕል',
    switchCamera: 'ካሜራ ቀይር (ቅድሚት/ድሕሪት)',
    retake: 'ደጊምካ ኣልዕል',
    usePhoto: 'ስእሊ ተጠቐም',
    closeCamera: 'ዕጾ',
    welcomeBack: 'እንቋዕ ብደሓን መጻእኩም',
    createAccount: 'ሓድሽ ኣካውንት ክፈቱ',
    fullName: 'ሙሉእ ስም',
    email: 'ኢመይል ኣድራሻ',
    phoneNumber: 'ቁጽሪ ተሌፎን',
    password: 'መሕለፊ ቃል (Password)',
    profilePhoto: 'ናይ መገለጺ ስእሊ (ካሜራ)',
    takeProfilePhoto: 'ብካሜራ ናይ መገለጺ ስእሊ ኣልዕል',
    dontHaveAccount: 'ኣካውንት የብልኩምን? ተመዝገቡ',
    alreadyHaveAccount: 'ኣካውንት ኣለኩም? እተዉ',
    loggingIn: 'ይኣቱ ኣሎ...',
    registering: 'ይምዝገብ ኣሎ...',
    adminTitle: 'ናይ መላ ማርኬት ክፍሊ ኣመሓዳሪ',
    dbStatus: 'ኩነታት ዳታቤዝ (Database)',
    dbConnected: 'ዝተተሓሓዘን ድሉውን',
    dbDisconnected: 'ኣይተተሓሓዘን',
    dbEngine: 'ዓይነት ዳታቤዝ',
    verifyDb: 'ምትእስሳር ዳታቤዝ ኣረጋግጽ',
    totalUsers: 'ጠቕላላ ተጠቀምቲ',
    totalProducts: 'ጠቕላላ ኣቑሑት',
    totalInquiries: 'ሕቶታት ዓደግቲ',
    totalReports: 'ዝቐረቡ ጥርዓናት',
    manageProducts: 'ኣቑሑት ኣመሓድር',
    manageUsers: 'ተጠቀምቲ ኣመሓድር',
    inquiriesTab: 'ሕቶታት ዓደግቲ',
    reportsTab: 'ጥርዓናት',
    deleteBtn: 'ኣወግድ',
    approveBtn: 'ኣጽድቕ',
    close: 'ዕጾ',
    status: 'ኩነታት',
    buyerName: 'ስም ዓዳጊ',
    buyerEmail: 'ኢመይል ዓዳጊ',
    buyerPhone: 'ተሌፎን ዓዳጊ',
    message: 'መልእኽቲ',
    reportListing: 'ነዚ ኣቕሓ ሓብር',
    reportSuccess: 'ሓበሬታኹም በጺሑና ኣሎ፣ የቐንየልና!',
  },
};

export const categoriesList = [
  { id: 'electronics', en: 'Electronics & Phones', am: 'ኤሌክትሮኒክስ እና ስልኮች', ti: 'ኤሌክትሮኒክስን ተሌፎናትን' },
  { id: 'vehicles', en: 'Vehicles & Parts', am: 'ተሽከርካሪዎች እና መለዋወጫ', ti: 'ተሽከርከርትን መለዋወጥን' },
  { id: 'property', en: 'Property & Houses', am: 'ቤቶች እና ቦታዎች', ti: 'ገዛውትን ቦታታትን' },
  { id: 'fashion', en: 'Fashion & Traditional Wear', am: 'ፋሽን እና ባህላዊ አልባሳት', ti: 'ፋሽንን ባህላዊ ክዳውንትን' },
  { id: 'home', en: 'Home & Kitchen Appliances', am: 'የቤት እና የወጥ ቤት እቃዎች', ti: 'ናይ ገዛን ክሽነን ኣቑሑት' },
  { id: 'crafts', en: 'Artisanal & Coffee Sets', am: 'የእጅ ጥበብ እና የቡና እቃዎች', ti: 'ስነ-ጥበብን ናይ ቡን ኣቑሑትን' },
  { id: 'agriculture', en: 'Agriculture & Food Produce', am: 'ግብርና እና ምርቶች', ti: 'ሕርሻን መግብን' },
];

export const regionsList = [
  'Addis Ababa / አዲስ አበባ / ኣዲስ ኣበባ',
  'Oromia / ኦሮሚያ / ኦሮሚያ',
  'Amhara / አማራ / ኣምሓራ',
  'Tigray / ትግራይ / ትግራይ',
  'Dire Dawa / ድሬዳዋ / ድሬዳዋ',
  'Sidama / ሲዳማ / ሲዳማ',
  'Hawassa / ሐዋሳ / ሓዋሳ',
  'Somali / ሶማሌ / ሶማሌ',
  'Afar / አፋር / ዓፋር',
  'Benishangul / ቤኒሻንጉል ጉሙዝ / ቤኒሻንጉል',
  'Harari / ሐረሪ / ሓረሪ',
  'South Ethiopia / ደቡብ ኢትዮጵያ / ደቡብ ኢትዮጵያ',
];
