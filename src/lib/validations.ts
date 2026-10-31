import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ / Please enter a valid email address'),
  password: z.string().min(6, 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት / Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'ሙሉ ስም ያስገቡ / Full name must be at least 2 characters'),
  email: z.string().email('ትክክለኛ ኢሜይል ያስገቡ / Please enter a valid email address'),
  password: z.string().min(6, 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት / Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'የይለፍ ቃልዎን ያረጋግጡ / Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "የይለፍ ቃሎቹ አይመሳሰሉም / Passwords do not match",
  path: ["confirmPassword"],
});

export const sellerRegisterSchema = z.object({
  fullName: z.string().min(2, 'ሙሉ ስም ያስገቡ / Full name is required'),
  email: z.string().email('ትክክለኛ ኢሜይል ያስገቡ / Valid email is required'),
  password: z.string().min(6, 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች / Password must be at least 6 chars'),
  shopName: z.string().min(3, 'የሱቅ ስም ቢያንስ 3 ፊደላት / Shop name must be at least 3 chars'),
  shopDescription: z.string().min(10, 'የሱቅ መግለጫ ቢያንስ 10 ፊደላት / Shop description is required'),
  phone: z.string().min(7, 'ትክክለኛ ስልክ ቁጥር ያስገቡ / Valid phone number is required'),
  city: z.string().min(2, 'ከተማ ያስገቡ (ምሳሌ፡ አዲስ አበባ) / City is required'),
});

export const shopProfileSchema = z.object({
  name: z.string().min(3, 'Shop name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  phone: z.string().min(7, 'Valid phone number is required'),
  email: z.string().email('Valid business email is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().optional(),
  logoUrl: z.string().url('A valid logo URL is required'),
  bannerUrl: z.string().url('A valid banner URL is required'),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2, 'ሙሉ ስም ያስፈልጋል / Full name is required'),
  email: z.string().email('ትክክለኛ ኢሜይል / Valid email is required'),
  phone: z.string().min(7, 'ትክክለኛ ስልክ ቁጥር / Valid contact phone number is required'),
  addressLine1: z.string().min(5, 'የመንገድ ወይም የቤት አድራሻ / Street address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'ከተማ / City is required'),
  state: z.string().min(2, 'ክልል ወይም ክፍለ ከተማ / State or province is required'),
  postalCode: z.string().min(3, 'ፖስታ ኮድ / Postal code is required'),
  country: z.string().min(2, 'አገር / Country is required'),
  deliveryMethod: z.enum(['standard', 'express', 'priority']),
  paymentMethod: z.enum(['card', 'cod', 'mobile_money']),
  cardNumber: z.string().optional(),
  cardExp: z.string().optional(),
  cardCvc: z.string().optional(),
  deliveryNotes: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(3, 'የምርት ስም ቢያንስ 3 ፊደላት / Product name must be at least 3 characters'),
  categoryId: z.string().min(1, 'ምድብ መመረጥ አለበት / Category is required'),
  sellerId: z.string().optional(),
  description: z.string().min(10, 'መግለጫ ቢያንስ 10 ፊደላት / Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  price: z.number().positive('ዋጋ ከ 0 በላይ መሆን አለበት / Price must be greater than 0'),
  discountPrice: z.number().positive('የቅናሽ ዋጋ ትክክል መሆን አለበት / Discount price must be positive').optional().nullable(),
  stockQuantity: z.number().int().nonnegative('የእቃ ክምችት ቁጥር / Stock must be 0 or more'),
  availabilityStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']),
  imageUrl: z.string().url('ትክክለኛ የምስል ሊንክ ያስገቡ / A valid image URL is required'),
  images: z.array(z.string().url()).optional(),
  brand: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('A valid image URL is required'),
  icon: z.string().default('Package'),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type SellerRegisterFormData = z.infer<typeof sellerRegisterSchema>;
export type ShopProfileFormData = z.infer<typeof shopProfileSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
