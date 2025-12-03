
import React, { useState } from 'react';
import { BookRequest, SRI_LANKA_DISTRICTS, UrgencyLevel, GRADES, BookCategory } from '../types';
import { TRANSLATIONS } from '../constants';
import { MapPin, BookOpen, Heart, Filter, AlertCircle, Clock, CheckCircle, Package, Truck, Camera, X, Users } from 'lucide-react';

interface DonorFeedProps {
  requests: BookRequest[];
  lang: 'en' | 'si';
  onDonate: (req: BookRequest, donorDetails: any) => void;
}

export const DonorFeed: React.FC<DonorFeedProps> = ({ requests, lang, onDonate }) => {
  const t = TRANSLATIONS[lang];
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');
  const [filterUrgency, setFilterUrgency] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [selectedReq, setSelectedReq] = useState<BookRequest | null>(null);
  const [donorForm, setDonorForm] = useState({
    name: '',
    supplyType: 'full', // 'full' or 'partial'
    shipping: 'post', // 'post' or 'person'
  });

  const filteredRequests = requests.filter(req => {
    const matchesDistrict = filterDistrict === 'All' || req.district === filterDistrict;
    const matchesGrade = filterGrade === 'All' || req.grade === filterGrade;
    const matchesUrgency = !filterUrgency || req.urgency === UrgencyLevel.CRITICAL;
    const matchesSearch =
      req.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.details.toLowerCase().includes(searchTerm.toLowerCase());

    // Show Pending AND Partially Fulfilled requests
    // We exclude 'Fulfilled' and old 'Matched' status
    const isVisibleStatus = req.status === 'Pending' || req.status === 'Partially Fulfilled';

    return matchesDistrict && matchesGrade && matchesUrgency && matchesSearch && isVisibleStatus;
  });

  const getTimeAgo = (timestamp: number) => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    return days === 0 ? t.justNow : `${days} ${t.daysAgo}`;
  };

  const handleDonateClick = (req: BookRequest) => {
    setSelectedReq(req);
    setDonorForm({ name: '', supplyType: 'full', shipping: 'post' });
  };

  const submitDonation = () => {
    if (selectedReq) {
      // Direct action to prevent popup blockers from stopping the WhatsApp redirection.
      // The modal itself serves as the confirmation of details.
      onDonate(selectedReq, donorForm);
      setSelectedReq(null);
    }
  };

  const getCategoryIcon = (cat: BookCategory) => {
    switch (cat) {
      case BookCategory.TEXTBOOK: return "📚";
      case BookCategory.STORYBOOK: return "🧚";
      case BookCategory.EXERCISE: return "📝";
      case BookCategory.STATIONERY: return "✏️";
      default: return "📦";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="text-teal-600" />
          {t.navRequests}
        </h2>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
          {/* Search and Main Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Filter className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>

            <select
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[150px]"
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
            >
              <option value="All">{t.filterAll}</option>
              {SRI_LANKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[150px]"
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
            >
              <option value="All">{t.filterGrade}</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterUrgency(!filterUrgency)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${filterUrgency
                  ? 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <AlertCircle size={16} />
              {t.filterUrgentOnly}
            </button>
            <span className="text-sm text-gray-400 ml-auto">
              Showing {filteredRequests.length} requests
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 flex flex-col items-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <BookOpen size={48} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium">No requests found matching your filters.</p>
            <p className="text-sm">Try adjusting the grade or district.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group relative">

              {/* Card Header with Status */}
              <div className="p-6 pb-2 flex-1">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      <Clock size={12} /> {getTimeAgo(req.timestamp)}
                    </span>
                    {req.status === 'Partially Fulfilled' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        <Users size={12} /> {t.statusPartial}
                      </span>
                    )}
                  </div>

                  {req.urgency === UrgencyLevel.CRITICAL && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 animate-pulse shrink-0">
                      <AlertCircle size={12} /> {t.urgentBadge}
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                    {req.studentName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{req.studentName}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="text-teal-500" />
                      {req.district}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="inline-block px-2 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded mr-2 mb-2 border border-teal-100">
                    {req.grade}
                  </span>
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded mr-2 mb-2 border border-blue-100">
                    {req.school}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Request Details</p>
                  <p className="text-gray-700 text-sm italic">"{req.details}"</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {req.categories.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-1 text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md shadow-sm">
                      <span>{getCategoryIcon(cat)}</span> {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50 group-hover:bg-white transition-colors">
                <button
                  onClick={() => handleDonateClick(req)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <Heart size={18} className="fill-current" />
                  {req.status === 'Partially Fulfilled' ? 'Help Complete Request' : t.btnDonate}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Donation Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="bg-teal-600 p-6 text-white relative">
              <button
                onClick={() => setSelectedReq(null)}
                className="absolute top-4 right-4 text-teal-100 hover:text-white p-2 hover:bg-teal-500 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold mb-1">{t.donorModalTitle}</h3>
              <p className="text-teal-100 text-sm">
                {t.donorModalSubtitle} <span className="font-bold text-white">{selectedReq.studentName}</span>
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Requested Items Summary */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <div className="bg-white p-2 rounded-full text-blue-500 shadow-sm">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase mb-1">They need</p>
                  <p className="text-sm text-gray-700">{selectedReq.details}</p>
                  {selectedReq.status === 'Partially Fulfilled' && (
                    <p className="text-xs text-amber-600 font-bold mt-2 flex items-center gap-1">
                      <Users size={12} /> Some items already matched by other donors.
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.formName}</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={donorForm.name}
                    onChange={e => setDonorForm({ ...donorForm, name: e.target.value })}
                    placeholder="John Doe"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.labelSupplyType}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDonorForm({ ...donorForm, supplyType: 'full' })}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${donorForm.supplyType === 'full'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-500 hover:border-teal-200'
                        }`}
                    >
                      <CheckCircle size={24} className={donorForm.supplyType === 'full' ? 'fill-teal-500 text-white' : ''} />
                      <span className="text-sm font-medium">{t.supplyFull}</span>
                    </button>
                    <button
                      onClick={() => setDonorForm({ ...donorForm, supplyType: 'partial' })}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${donorForm.supplyType === 'partial'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-500 hover:border-teal-200'
                        }`}
                    >
                      <Package size={24} className={donorForm.supplyType === 'partial' ? 'fill-teal-500 text-white' : ''} />
                      <span className="text-sm font-medium">{t.supplyPartial}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.labelShipping}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDonorForm({ ...donorForm, shipping: 'post' })}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${donorForm.shipping === 'post'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-500 hover:border-teal-200'
                        }`}
                    >
                      <Truck size={24} />
                      <span className="text-sm font-medium">{t.shipPost}</span>
                    </button>
                    <button
                      onClick={() => setDonorForm({ ...donorForm, shipping: 'person' })}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${donorForm.shipping === 'person'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-500 hover:border-teal-200'
                        }`}
                    >
                      <MapPin size={24} />
                      <span className="text-sm font-medium">{t.shipPerson}</span>
                    </button>
                  </div>
                </div>

                {/* Simulated File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.labelPhoto}</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-teal-400 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <Camera className="mb-2 group-hover:text-teal-500" />
                    <span className="text-xs">Click to upload image</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-2">
              <button
                onClick={submitDonation}
                disabled={!donorForm.name}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform ${donorForm.name
                    ? 'bg-green-500 hover:bg-green-600 hover:-translate-y-1'
                    : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                <div className="bg-white/20 p-1 rounded-full"><CheckCircle size={16} /></div>
                {t.btnConfirmDonate}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
