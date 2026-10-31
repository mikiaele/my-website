import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { contactSchema } from '../lib/validations.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

export const ContactPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: language === 'am' ? 'ትዕዛዜ በስንት ጊዜ ውስጥ ይደርሰኛል?' : 'How fast will my order arrive?',
      a: language === 'am'
        ? 'መደበኛ ትዕዛዞች በ24 ሰዓታት ውስጥ ተዘጋጅተው ከ3 እስከ 5 የስራ ቀናት ውስጥ ይደርሳሉ። ፈጣን ማድረሻ (Express) በ2 የስራ ቀናት ውስጥ፣ አፋጣኝ ማድረሻ ደግሞ በሚቀጥለው ቀን ማለዳ ይደርሳል።'
        : 'Standard orders are dispatched within 24 hours and delivered in 3 to 5 business days. Express courier takes 2 business days, and Priority Overnight delivers next morning.',
    },
    {
      q: language === 'am' ? 'የእቃ መመለስ ፖሊሲያችሁ ምንድን ነው?' : 'What is your return policy?',
      a: language === 'am'
        ? 'የ30-ቀን ሙሉ የገንዘብ ተመላሽ ዋስትና እንሰጣለን። በገዙት እቃ ደስተኛ ካልሆኑ ያነጋግሩን፤ ያለምንም ቅጣት ፈጣን ተመላሽ ይደረግልዎታል።'
        : 'We offer an effortless 30-day money-back guarantee. If you are not delighted with your purchase, contact us to receive an instant prepaid return label with no restocking penalties.',
    },
    {
      q: language === 'am' ? 'ኦርጋኒክ እና የቡና ምርቶቻችሁ ኦሪጅናል መሆናቸው የተረጋገጠ ነው?' : 'Are the organic and specialty products authentic?',
      a: language === 'am'
        ? 'አዎ፣ 100% የተረጋገጠ ነው። የይርጋጨፌ ቡናችን፣ የተፈጥሮ ማር እና የእደ-ጥበብ ሌዘር ውጤቶቻችን በቀጥታ ከተመዘገቡ አምራቾች እና ህብረት ስራ ማህበራት የሚቀርቡ ናቸው።'
        : 'Yes, 100%. Our Ethiopian Yirgacheffe coffees, wildflower honeys, and botanical formulations are directly sourced from certified cooperatives and undergo third-party laboratory verification.',
    },
    {
      q: language === 'am' ? 'ሜላ ገበያ ከአንድሮይድ መተግበሪያ ጋር እንዴት ይገናኛል?' : 'How does Mela Market connect to Supabase for mobile apps?',
      a: language === 'am'
        ? 'ሜላ ገበያ በፖስትግሬስ እና በሱፓቤዝ የተዋቀረ ማዕከላዊ ኤፒአይ (REST/PostgreSQL API) አለው። ወደፊት የሚሰራው የ React Native + Expo አንድሮይድ አፕሊኬሽን ያለምንም የጀርባ ለውጥ በቀጥታ ከተመሳሳዩ ዳታቤዝ ጋር ይሰራል::'
        : 'MELA MARKET utilizes a unified PostgreSQL and Supabase data layer with Row Level Security (RLS). A future React Native / Expo Android application consumes the exact same tables, schemas, and authentication endpoints without backend changes.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = contactSchema.safeParse({ name, email, subject, message });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'am' ? 'እርስዎን ለማገዝ ዝግጁ ነን' : 'We Are Here to Assist You'}
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          {language === 'am'
            ? 'ስለ ትዕዛዝ፣ ስለ ጅምላ ግዢ ወይም ስለ ሻጭነት ጥያቄ አለዎት? የደንበኞች ድጋፍ ቡድናችን በ2 ሰዓታት ውስጥ ምላሽ ይሰጥዎታል።'
            : 'Have an inquiry about an order, wholesale partnership, or product origin? Our dedicated support team responds within 2 hours.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Contact Info & Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              {language === 'am' ? 'የቀጥታ ግንኙነት መንገዶች' : 'Direct Contact Channels'}
            </h3>

            <div className="space-y-5 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">
                    {language === 'am' ? 'ኢሜይል' : 'Email Concierge'}
                  </span>
                  <a href="mailto:support@melamarket.com" className="text-slate-500 hover:text-emerald-700">
                    support@melamarket.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">
                    {language === 'am' ? 'የስልክ ጥሪ ድጋፍ' : 'Phone Support'}
                  </span>
                  <span className="text-slate-500">+251 91 123 4567 / +1 (800) 555-6352</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">
                    {language === 'am' ? 'ዋና መስሪያ ቤት' : 'Marketplace Headquarters'}
                  </span>
                  <span className="text-slate-500">
                    {language === 'am' ? 'ቦሌ መድኃኔዓለም፣ አዲስ አበባ፣ ኢትዮጵያ' : 'Bole Medhanealem, Addis Ababa, Ethiopia'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">
                    {language === 'am' ? 'የስራ ሰዓታት' : 'Hours of Operation'}
                  </span>
                  <span className="text-slate-500">
                    {language === 'am' ? 'ከሰኞ እስከ እሁድ፡ የ24/7 የደንበኞች ድጋፍ' : 'Monday – Sunday: 24/7 Priority Support'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'am' ? 'መልእክት ይላኩልን' : 'Send an Inquiry'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'am' ? 'መረጃዎን ያስገቡ፤ በደስታ ምላሽ እንሰጣለን።' : 'Please provide your details and we will reply promptly.'}
              </p>
            </div>

            {isSubmitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  {language === 'am' ? 'እናመሰግናለን! መልእክትዎ ደርሶናል። ቡድናችን በአጭር ጊዜ ውስጥ ያነጋግርዎታል።' : 'Thank you! Your message has been received. Our team will get back to you shortly.'}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('fullName')}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'am' ? 'አበበ ከበደ' : 'Jane Doe'}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm ${
                      errors.name ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{t('emailAddress')}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm ${
                      errors.email ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'ርዕሰ ጉዳይ' : 'Subject'}
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={language === 'am' ? 'የትዕዛዝ ጥያቄ፣ የጅምላ ሽያጭ ወይም የሻጭነት ጥያቄ...' : 'Order inquiry, wholesale, etc.'}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm ${
                    errors.subject ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errors.subject && <p className="text-[11px] text-rose-600 mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'መልእክትዎ' : 'Message'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'am' ? 'ጥያቄዎን ወይም አስተያየትዎን እዚህ ይፃፉ...' : 'How can our customer concierge assist you today?'}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm ${
                    errors.message ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                {errors.message && <p className="text-[11px] text-rose-600 mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? (language === 'am' ? 'በመላክ ላይ...' : 'Sending Message...') : (language === 'am' ? 'መልእክት ላክ' : 'Send Message')}</span>
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Frequently Asked Questions */}
      <div className="pt-8 border-t border-slate-200 max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {language === 'am' ? 'ተደጋግመው የሚጠየቁ ጥያቄዎች (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'am' ? 'ለዋና ዋና ጥያቄዎች የተሰጡ ፈጣን ምላሾች' : 'Quick answers to the most common inquiries'}
          </p>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="p-4 sm:p-5">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="font-bold text-slate-800 text-sm sm:text-base">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
