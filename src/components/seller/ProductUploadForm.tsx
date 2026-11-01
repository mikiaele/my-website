import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { uploadProductPhoto, validateProductPhoto } from '../../lib/storage';
import { ProductCondition } from '../../types';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  Tag,
  DollarSign,
  PackageCheck,
  FileText
} from 'lucide-react';

interface FormErrors {
  title_am?: string;
  title_en?: string;
  price?: string;
  stock?: string;
  category_id?: string;
  condition?: string;
  description?: string;
  image?: string;
}

export const ProductUploadForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { categories, addProduct, t, language, currentUser } = useApp();

  // Form Fields State - ALL MANDATORY
  const [titleAm, setTitleAm] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<ProductCondition | ''>('');
  const [description, setDescription] = useState('');

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedStorageUrl, setUploadedStorageUrl] = useState<string | null>(null);

  // Validation & Submission State
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo Selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous image error
    setErrors(prev => ({ ...prev, image: undefined }));

    // Validate type and size
    const validation = validateProductPhoto(file, language);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, image: validation.error }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    // Create live preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
    setUploadedStorageUrl(null); // Will upload when saving or staged
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setUploadedStorageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Comprehensive Form Validation - Every field is required
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Amharic Title
    if (!titleAm.trim()) {
      newErrors.title_am = t.err_title_am;
    } else if (titleAm.trim().length < 3) {
      newErrors.title_am = language === 'am' ? 'የአማርኛ ስም ቢያንስ 3 ፊደላት መሆን አለበት' : 'Amharic title must be at least 3 characters.';
    }

    // 2. English Title
    if (!titleEn.trim()) {
      newErrors.title_en = t.err_title_en;
    } else if (titleEn.trim().length < 3) {
      newErrors.title_en = language === 'am' ? 'የእንግሊዝኛ ስም ቢያንስ 3 ፊደላት መሆን አለበት' : 'English title must be at least 3 characters.';
    }

    // 3. Price in ETB
    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = t.err_price;
    }

    // 4. Stock quantity
    const parsedStock = parseInt(stock, 10);
    if (!stock || isNaN(parsedStock) || parsedStock < 1) {
      newErrors.stock = t.err_stock;
    }

    // 5. Category
    if (!categoryId) {
      newErrors.category_id = t.err_category;
    }

    // 6. Condition
    if (!condition) {
      newErrors.condition = t.err_condition;
    }

    // 7. Description
    if (!description.trim()) {
      newErrors.description = t.err_description;
    } else if (description.trim().length < 10) {
      newErrors.description = language === 'am' ? 'መግለጫው ቢያንስ 10 ፊደላት መሆን አለበት' : 'Description must be at least 10 characters long.';
    }

    // 8. Product Image
    if (!selectedFile && !uploadedStorageUrl) {
      newErrors.image = t.err_image;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const isValid = validateForm();
    if (!isValid) {
      setErrorMessage(
        language === 'am'
          ? 'እባክዎ ሁሉንም መስኮች በትክክል ይሙሉ እና የምርት ፎቶ ይጫኑ።'
          : 'Please complete all required fields and upload a product photo.'
      );
      // Scroll to top of form
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = uploadedStorageUrl;

      // Upload image to Supabase Storage if not already uploaded
      if (!finalImageUrl && selectedFile) {
        setIsUploadingImage(true);
        const uploadResult = await uploadProductPhoto(selectedFile, language);
        finalImageUrl = uploadResult.url;
        setUploadedStorageUrl(finalImageUrl);
        setIsUploadingImage(false);
      }

      if (!finalImageUrl) {
        throw new Error(t.err_image);
      }

      // Add product record with resulting image URL
      await addProduct({
        title_am: titleAm.trim(),
        title_en: titleEn.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category_id: categoryId,
        condition: condition as ProductCondition,
        description: description.trim(),
        image_url: finalImageUrl,
        seller_id: currentUser?.id || 'seller-current',
        seller_name: currentUser?.full_name || 'Verified Mela Merchant',
        seller_phone: currentUser?.phone || '0911223344',
      });

      setSubmitSuccess(true);
      
      // Reset form
      setTitleAm('');
      setTitleEn('');
      setPrice('');
      setStock('');
      setCategoryId('');
      setCondition('');
      setDescription('');
      handleRemovePhoto();
      setErrors({});

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err: unknown) {
      console.error('Submission error:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while saving the product.'
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 sm:p-8">
      {/* Header and Mandatory Notice */}
      <div className="border-b border-gray-100 pb-5 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.tab_new_listing}</h2>
            <p className="text-xs text-gray-500">{t.seller_dashboard_sub}</p>
          </div>
        </div>

        {/* Strict Mandatory Fields Banner */}
        <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold">{language === 'am' ? 'ማሳሰቢያ፡' : 'Strict Requirement:'} </span>
            {t.form_mandatory_notice}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">{language === 'am' ? 'ምርቱ በተሳካ ሁኔታ ተመዝግቧል!' : 'Product Listed Successfully!'}</h4>
            <p className="text-xs text-emerald-700">{t.msg_product_submitted}</p>
          </div>
        </div>
      )}

      {/* General Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs font-semibold">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Dual Language Titles (Mandatory) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Amharic Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {t.field_title_am} <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={titleAm}
              onChange={(e) => {
                setTitleAm(e.target.value);
                if (errors.title_am) setErrors(prev => ({ ...prev, title_am: undefined }));
              }}
              placeholder={t.field_title_am_placeholder}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.title_am
                  ? 'border-red-400 bg-red-50/50 focus:ring-red-500'
                  : 'border-gray-300 focus:border-emerald-600 focus:ring-emerald-500'
              }`}
            />
            {errors.title_am && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title_am}
              </p>
            )}
          </div>

          {/* English Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {t.field_title_en} <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => {
                setTitleEn(e.target.value);
                if (errors.title_en) setErrors(prev => ({ ...prev, title_en: undefined }));
              }}
              placeholder={t.field_title_en_placeholder}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.title_en
                  ? 'border-red-400 bg-red-50/50 focus:ring-red-500'
                  : 'border-gray-300 focus:border-emerald-600 focus:ring-emerald-500'
              }`}
            />
            {errors.title_en && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title_en}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Price in ETB & Stock Quantity (Mandatory) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Price */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {t.field_price} ({t.currency}) <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-500">
                ETB
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
                }}
                placeholder={t.field_price_placeholder}
                className={`w-full pl-14 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.price
                    ? 'border-red-400 bg-red-50/50 focus:ring-red-500'
                    : 'border-gray-300 focus:border-emerald-600 focus:ring-emerald-500'
                }`}
              />
            </div>
            {errors.price && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.price}
              </p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {t.field_stock} <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
                if (errors.stock) setErrors(prev => ({ ...prev, stock: undefined }));
              }}
              placeholder={t.field_stock_placeholder}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.stock
                  ? 'border-red-400 bg-red-50/50 focus:ring-red-500'
                  : 'border-gray-300 focus:border-emerald-600 focus:ring-emerald-500'
              }`}
            />
            {errors.stock && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.stock}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Category & Condition (Mandatory) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {t.field_category} <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (errors.category_id) setErrors(prev => ({ ...prev, category_id: undefined }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer ${
                  errors.category_id
                    ? 'border-red-400 bg-red-50/50 focus:ring-red-500'
                    : 'border-gray-300 focus:border-emerald-600 focus:ring-emerald-500'
                }`}
              >
                <option value="">-- {t.field_category_placeholder} --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'am' ? cat.name_am : cat.name_en}
                  </option>
                ))}
              </select>
              <Tag className="w-4 h-4 text-gray-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            {errors.category_id && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.category_id}
              </p>
            )}
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              {t.field_condition} <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                  condition === 'Brand New'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-gray-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value="Brand New"
                  checked={condition === 'Brand New'}
                  onChange={() => {
                    setCondition('Brand New');
                    if (errors.condition) setErrors(prev => ({ ...prev, condition: undefined }));
                  }}
                  className="sr-only"
                />
                <span className="w-2.5 h-2.5 rounded-full border border-emerald-600 flex items-center justify-center">
                  {condition === 'Brand New' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                </span>
                {t.filter_new} (Brand New)
              </label>

              <label
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                  condition === 'Used'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-gray-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value="Used"
                  checked={condition === 'Used'}
                  onChange={() => {
                    setCondition('Used');
                    if (errors.condition) setErrors(prev => ({ ...prev, condition: undefined }));
                  }}
                  className="sr-only"
                />
                <span className="w-2.5 h-2.5 rounded-full border border-emerald-600 flex items-center justify-center">
                  {condition === 'Used' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                </span>
                {t.filter_used} (Used)
              </label>
            </div>
            {errors.condition && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.condition}
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Description (Mandatory) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            {t.field_description} <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
              }}
              placeholder={t.field_description_placeholder}
              className={`w-full p-4 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 resize-y ${
                errors.description
                  ? 'border-red-400 bg-red-50/50 focus:ring-red-500'
                  : 'border-gray-300 focus:border-emerald-600 focus:ring-emerald-500'
              }`}
            />
            <FileText className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
          {errors.description && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Row 5: Actual Image Upload Component (MANDATORY - Completely Replaced Image URL Input) */}
        <div className="border border-dashed border-emerald-300 rounded-2xl p-5 sm:p-6 bg-emerald-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <label className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                {t.field_image} <span className="text-red-500 font-bold">*</span>
              </label>
              <p className="text-xs text-gray-500 mt-0.5">{t.photo_help}</p>
            </div>
            {selectedFile && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'image'}
              </span>
            )}
          </div>

          {/* Hidden HTML File Input with restricted accept */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="hidden"
            id="product-photo-upload"
          />

          {/* If No Image Selected: Upload Button */}
          {!imagePreviewUrl ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-gray-800 mb-1">
                {language === 'am' ? 'ትክክለኛ የምርት ፎቶ ይጫኑ' : 'Upload an authentic product photo'}
              </p>
              <p className="text-xs text-gray-500 max-w-sm mb-4">
                {language === 'am'
                  ? 'ፎቶው በቀጥታ ወደ Supabase Storage ተጭኖ በገበያው ላይ ለገዢዎች ይታያል።'
                  : 'Image is uploaded securely to Supabase Storage and stored with the product record.'}
              </p>

              {/* Requirement: Button labelled “Upload Product Photo” */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-800/15 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Product Photo</span>
              </button>
            </div>
          ) : (
            /* Live Image Preview with Controls */
            <div className="mt-2 bg-white rounded-xl p-4 border border-gray-200 flex flex-col md:flex-row items-center gap-5">
              <div className="relative w-44 h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-xs">
                <img
                  src={imagePreviewUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur">
                  {t.photo_preview}
                </span>
              </div>

              <div className="flex-1 w-full space-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {language === 'am' ? 'የተመረጠ ፋይል ስም' : 'Selected File'}
                  </div>
                  <div className="text-sm font-bold text-gray-900 break-all">
                    {selectedFile?.name || 'Uploaded Photo'}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {language === 'am'
                      ? 'ፎቶው ተመርጧል። በሚመዘገብበት ጊዜ ወደ Supabase Storage ይጫናል።'
                      : 'Photo verified. Ready for upload to Supabase Storage.'}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {t.photo_change}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t.photo_remove}
                  </button>
                </div>
              </div>
            </div>
          )}

          {errors.image && (
            <p className="mt-3 text-xs text-red-600 font-semibold flex items-center gap-1.5 bg-red-50 p-2.5 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errors.image}
            </p>
          )}
        </div>

        {/* Submit Button & Status Indicator */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            {language === 'am'
              ? 'ሁሉም መረጃዎች ከተሞሉ በኋላ ምርቱ ለአስተዳዳሪ ማረጋገጫ ይላካል።'
              : 'Once submitted, your listing will be queued for review in the Admin Dashboard.'}
          </p>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all cursor-pointer ${
              isSubmitting || isUploadingImage
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-800/20 hover:scale-[1.01]'
            }`}
          >
            {isSubmitting || isUploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isUploadingImage ? t.photo_uploading : t.btn_submitting}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.btn_submit_product}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
