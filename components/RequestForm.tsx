import React, { useState } from 'react';
import { BookCategory, GRADES, SRI_LANKA_DISTRICTS, UrgencyLevel, BookRequest } from '../types';
import { TRANSLATIONS } from '../constants';
import { Loader2 } from 'lucide-react';

// Simple ID generator fallback
const generateId = () => 'req-' + Math.random().toString(36).substr(2, 9);

interface RequestFormProps {
  lang: 'en' | 'si';
  onSubmit: (req: BookRequest) => Promise<void>;
  onCancel: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({ lang, onSubmit, onCancel }) => {
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<BookRequest>>({
    categories: [],
    urgency: UrgencyLevel.MEDIUM,
  });

  const handleNext = () => setStep(p => p + 1);
  const handleBack = () => setStep(p => p - 1);

  const toggleCategory = (cat: BookCategory) => {
    const current = formData.categories || [];
    if (current.includes(cat)) {
      setFormData({ ...formData, categories: current.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, categories: [...current, cat] });
    }
  };

  const handleSubmit = async () => {
    if (!formData.studentName || !formData.contactNumber || !formData.district) return;

    setIsSubmitting(true);

    const newRequest: BookRequest = {
      id: generateId(),
      studentName: formData.studentName || '',
      grade: formData.grade || GRADES[0],
      school: formData.school || '',
      district: formData.district || '',
      categories: formData.categories || [],
      details: formData.details || '',
      urgency: formData.urgency || UrgencyLevel.MEDIUM,
      contactNumber: formData.contactNumber || '',
      status: 'Pending',
      timestamp: Date.now(),
      donors: []
    };

    try {
      await onSubmit(newRequest);
    } catch (error) {
      console.error("Submission Error", error);
      alert(lang === 'si' ? "සම්බන්ධතා දෝෂයක්. අන්තර්ජාල සම්බන්ධතාවය පරීක්ෂා කරන්න." : "Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in border border-gray-100">

      {/* HEADER IMAGE */}
      <div className="h-40 w-full relative overflow-hidden bg-teal-600">
        <img
          src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200"
          alt="Books"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 to-transparent"></div>
        <div className="absolute bottom-6 left-8 text-white">
          <h2 className="text-2xl font-bold">{lang === 'en' ? "Request Books" : "පොත් ඉල්ලීම් පෝරමය"}</h2>
          <p className="text-teal-100 text-sm">We'll help you find a donor soon.</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 h-1.5 w-full">
        <div
          className="bg-teal-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-teal-100 text-teal-700 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3 font-bold border border-teal-200">
            {step}
          </span>
          {step === 1 && (lang === 'en' ? "Who is this for?" : "මෙම ඉල්ලීම කා සඳහාද?")}
          {step === 2 && (lang === 'en' ? "What do you need?" : "ඔබට අවශ්‍ය දේ")}
          {step === 3 && (lang === 'en' ? "Location Details" : "ස්ථානය")}
          {step === 4 && (lang === 'en' ? "Contact Info" : "සම්බන්ධතා තොරතුරු")}
        </h2>

        <div className="min-h-[300px]">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.grade}</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                >
                  <option value="">Select Grade</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.urgency}</label>
                <div className="flex gap-2">
                  {[UrgencyLevel.MEDIUM, UrgencyLevel.HIGH, UrgencyLevel.CRITICAL].map(level => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, urgency: level })}
                      className={`flex-1 py-3 px-2 rounded-xl text-sm font-medium border transition-all transform hover:scale-[1.02] ${formData.urgency === level
                        ? (level === UrgencyLevel.CRITICAL ? 'bg-red-100 border-red-500 text-red-700' : 'bg-teal-100 border-teal-500 text-teal-700')
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {level === UrgencyLevel.CRITICAL ? (lang === 'si' ? 'ගංවතුරෙන් පීඩිත (Urgent)' : 'Flood Victim (Urgent)') : level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.category}</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(BookCategory).map(cat => (
                  <div
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${formData.categories?.includes(cat)
                      ? 'border-teal-500 bg-teal-50 shadow-sm'
                      : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
                      }`}
                  >
                    <span className="font-medium text-gray-700">{cat}</span>
                    {formData.categories?.includes(cat) && (
                      <span className="text-teal-600 font-bold">✓</span>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.formDetails}</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  rows={3}
                  placeholder={lang === 'en' ? "e.g., Grade 5 Sinhala reading book, Atlas..." : "උදා: 5 ශ්‍රේණියේ සිංහල කියවීමේ පොත..."}
                  value={formData.details}
                  onChange={e => setFormData({ ...formData, details: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.district}</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                >
                  <option value="">Select District</option>
                  {SRI_LANKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.formSchool}</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Vidyalaya..."
                  value={formData.school}
                  onChange={e => setFormData({ ...formData, school: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.formName}</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.studentName}
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contact}</label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="077xxxxxxx"
                  value={formData.contactNumber}
                  onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Donors will contact you via WhatsApp on this number.</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {t.back}
            </button>
          ) : (
            <button
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-200 transition-all transform hover:scale-105"
            >
              {t.next}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="animate-spin h-5 w-5" />}
              {isSubmitting ? t.submitting : t.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};