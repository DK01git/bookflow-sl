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

  // Validation logic for each step
  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        // Step 1: Grade must be selected
        return !!formData.grade;
      case 2:
        // Step 2: At least one category must be selected
        const hasCategories = formData.categories && formData.categories.length > 0;
        if (!hasCategories) return false;

        // If "Other" is selected, details must be provided
        const hasOther = formData.categories?.includes(BookCategory.OTHER);
        if (hasOther && (!formData.details || formData.details.trim() === '')) {
          return false;
        }
        return true;
      case 3:
        // Step 3: District must be selected
        return !!formData.district;
      default:
        return true;
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
      timestamp: Date.now()
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
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-100 h-2 w-full">
        <div
          className="bg-teal-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-teal-100 text-teal-700 rounded-full w-8 h-8 flex items-center justify-center text-sm mr-3">
            {step}
          </span>
          {step === 1 && (lang === 'en' ? "Who is this for?" : "මෙම ඉල්ලීම කා සඳහාද?")}
          {step === 2 && (lang === 'en' ? "What do you need?" : "ඔබට අවශ්‍ය දේ")}
          {step === 3 && (lang === 'en' ? "Location Details" : "ස්ථානය")}
          {step === 4 && (lang === 'en' ? "Contact Info" : "සම්බන්ධතා තොරතුරු")}
        </h2>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.grade}</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
                    className={`flex-1 py-3 px-2 rounded-lg text-sm font-medium border transition-colors ${formData.urgency === level
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
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.category}</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(BookCategory).map(cat => (
                <div
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center justify-between ${formData.categories?.includes(cat)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-200'
                    }`}
                >
                  <span className="font-medium text-gray-700">{cat}</span>
                  {formData.categories?.includes(cat) && (
                    <span className="text-teal-600">✓</span>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.formDetails}</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                rows={3}
                placeholder={lang === 'en' ? "e.g., Grade 5 Sinhala reading book, Atlas..." : "උදා: 5 ශ්‍රේණියේ සිංහල කියවීමේ පොත..."}
                value={formData.details}
                onChange={e => setFormData({ ...formData, details: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.district}</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Vidyalaya..."
                value={formData.school}
                onChange={e => setFormData({ ...formData, school: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.formName}</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                value={formData.studentName}
                onChange={e => setFormData({ ...formData, studentName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.contact}</label>
              <input
                type="tel"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="077xxxxxxx"
                value={formData.contactNumber}
                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
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
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform ${canProceed()
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200 hover:scale-105 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                }`}
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