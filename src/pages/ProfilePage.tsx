import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Check,
  Package,
  LogOut,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { PageView } from '../types/index.ts';

interface ProfilePageProps {
  setCurrentPage: (page: PageView) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ setCurrentPage }) => {
  const { user, updateUser, logout } = useAuth();
  const { t, language } = useLanguage();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addressLine1, setAddressLine1] = useState(user?.address_line1 || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [postalCode, setPostalCode] = useState(user?.postal_code || '');
  const [country, setCountry] = useState(user?.country || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">
          {language === 'am' ? 'እባክዎ መገለጫዎን ለማግኘት በመለያዎ ይግቡ' : 'Please Sign In to Access Your Profile'}
        </h2>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await updateUser({
      full_name: fullName,
      phone,
      address_line1: addressLine1,
      city,
      state,
      postal_code: postalCode,
      country,
    });
    setIsSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleRoleToggle = async () => {
    const nextRole = user.role === 'admin' ? 'customer' : 'admin';
    await updateUser({ role: nextRole });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Profile Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-emerald-900/10 overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user.full_name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {user.full_name}
              </h1>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                user.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {user.role === 'admin' ? t('adminRole') : user.role === 'seller' ? t('sellerRole') : t('customerRole')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            <span className="text-[11px] text-slate-400 block mt-1">
              {language === 'am' ? 'አባል ከ' : 'Member since'} {new Date(user.created_at).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {user.role === 'admin' && (
            <button
              onClick={() => setCurrentPage('admin')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {t('adminDashboard')}
            </button>
          )}

          <button
            onClick={handleRoleToggle}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Toggle between customer and admin role for testing"
          >
            {language === 'am'
              ? `ወደ ${user.role === 'admin' ? 'ደንበኛ' : 'አስተዳዳሪ'} ቀይር`
              : `Switch to ${user.role === 'admin' ? 'Customer' : 'Admin'}`}
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t('profileTitle')}</h3>
            <p className="text-xs text-slate-500">{t('profileSubtitle')}</p>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-4 h-4" /> {t('changesSavedSuccess')}
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('fullName')}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('emailAddress')}</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('phoneNumber')}</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 91 123 4567"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('country')}</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={language === 'am' ? 'ኢትዮጵያ' : 'Ethiopia'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('streetAddress')}</label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder={language === 'am' ? 'ቦሌ መድኃኔዓለም፣ ህንፃ 12' : '123 Market Street'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t('city')}</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={language === 'am' ? 'አዲስ አበባ' : 'Addis Ababa'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('stateRegion')}</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder={language === 'am' ? 'ቦሌ' : 'Bole'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('postalCode')}</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? t('savingChanges') : t('saveChanges')}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('signOut')}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
