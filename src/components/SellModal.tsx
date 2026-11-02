import React, { useState } from 'react';
import { X, CheckCircle, Phone, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { SUPPORT_PHONE, CATEGORIES, ETHIOPIAN_CITIES } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SellModal: React.FC<SellModalProps> = ({ isOpen, onClose, language }) => {
  const t = TRANSLATIONS[language];
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1].id);
  const [price, setPrice] = useState('');
  const [city, setCity] = useState(ETHIOPIAN_CITIES[1].id);
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">{t.sellTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{t.listingSubmitted}</h3>
              <p className="text-xs text-slate-500">{t.listingSubmittedDesc}</p>
              <div className="p-3 bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-800">
                <Phone className="w-3.5 h-3.5 inline mr-1" />
                {t.orderCallNotice}{' '}
                <a href={`tel:${SUPPORT_PHONE}`} className="underline font-bold">
                  {SUPPORT_PHONE}
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.listingTitle}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Yirgacheffe Coffee / Samsung S24"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.categories}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => {
                      const catName =
                        language === 'ti'
                          ? c.nameTi
                          : language === 'am'
                          ? c.nameAm
                          : c.nameEn;
                      return (
                        <option key={c.id} value={c.id}>
                          {catName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.price}
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="ETB"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.location}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    {ETHIOPIAN_CITIES.map((c) => {
                      const cityName =
                        language === 'ti'
                          ? c.nameTi
                          : language === 'am'
                          ? c.nameAm
                          : c.nameEn;
                      return (
                        <option key={c.id} value={c.id}>
                          {cityName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.phoneNumber}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.description}
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Item details, condition, delivery options..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-xs cursor-pointer"
                >
                  {t.submitListing}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
