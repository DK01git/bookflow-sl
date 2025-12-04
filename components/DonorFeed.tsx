import React, { useState, useEffect } from 'react';
import { BookRequest, SRI_LANKA_DISTRICTS, UrgencyLevel, GRADES, BookCategory, DonatedItem, RequestItem } from '../types';
import { TRANSLATIONS } from '../constants';
import { MapPin, BookOpen, Heart, Filter, AlertCircle, Clock, CheckCircle, Package, Truck, Camera, X, Users, MessageCircleWarning, CheckSquare, Square } from 'lucide-react';

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

  // New Donation Logic State
  const [donorName, setDonorName] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'post' | 'person'>('post');
  const [isDonatingAll, setIsDonatingAll] = useState(true);

  // Track what user is donating: { category: quantity_user_is_giving }
  const [donationPlan, setDonationPlan] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedReq) {
      // Reset state when opening modal
      setDonorName('');
      setShippingMethod('post');
      setIsDonatingAll(true); // Default to full donation

      // Initialize plan with max remaining amounts
      const initialPlan: Record<string, number> = {};

      // Handle legacy requests without 'items' array by inferring from categories
      const itemsToMap = selectedReq.items || selectedReq.categories.map(c => ({ category: c, quantity: 1, fulfilledCount: 0 }));

      itemsToMap.forEach(item => {
        const remaining = item.quantity - item.fulfilledCount;
        if (remaining > 0) {
          initialPlan[item.category] = remaining;
        }
      });
      setDonationPlan(initialPlan);
    }
  }, [selectedReq]);

  const filteredRequests = requests.filter(req => {
    const matchesDistrict = filterDistrict === 'All' || req.district === filterDistrict;
    const matchesGrade = filterGrade === 'All' || req.grade === filterGrade;
    const matchesUrgency = !filterUrgency || req.urgency === UrgencyLevel.CRITICAL;
    const matchesSearch =
      req.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.details.toLowerCase().includes(searchTerm.toLowerCase());

    // Show Pending AND Partially Fulfilled requests
    const isVisibleStatus = req.status === 'Pending' || req.status === 'Partially Fulfilled';

    return matchesDistrict && matchesGrade && matchesUrgency && matchesSearch && isVisibleStatus;
  });

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} ${t.daysAgo}`;
    if (hours > 0) return `${hours} ${t.hoursAgo}`;
    if (minutes > 0) return `${minutes} ${t.minsAgo}`;
    return t.justNow;
  };

  const handleDonateClick = (req: BookRequest) => {
    setSelectedReq(req);
  };

  // Toggle specific item for donation in "Partial" mode
  const toggleItemDonation = (category: string, maxNeeded: number) => {
    setDonationPlan(prev => {
      const next = { ...prev };
      if (next[category]) {
        delete next[category]; // Uncheck/Remove
      } else {
        next[category] = maxNeeded; // Check/Add with max
      }
      return next;
    });
  };

  // Update quantity for a specific item
  const updateItemQuantity = (category: string, qty: number, max: number) => {
    setDonationPlan(prev => ({
      ...prev,
      [category]: Math.min(Math.max(1, qty), max)
    }));
  };

  const submitDonation = () => {
    if (selectedReq) {
      // Construct the list of donated items based on the plan
      const finalItems: DonatedItem[] = Object.entries(donationPlan).map(([cat, qty]: [string, number]) => ({
        category: cat as BookCategory,
        quantity: qty
      }));

      const supplyType = isDonatingAll ? 'full' : 'partial';

      const donorDetails = {
        name: donorName,
        supplyType,
        shipping: shippingMethod,
        items: finalItems
      };

      onDonate(selectedReq, donorDetails);
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

  const getHeaderImage = (name: string) => {
    const images = [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600",
    ];
    return images[name.length % images.length];
  };

  // Helper to get items for display (supporting legacy data)
  const getDisplayItems = (req: BookRequest) => {
    if (req.items && req.items.length > 0) return req.items;
    // Fallback for old data
    return req.categories.map(c => ({ category: c, quantity: 1, fulfilledCount: 0 }));
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
          {/* Filters UI (Unchanged) */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 flex flex-col items-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <BookOpen size={48} className="text-gray-300" />
            </div>
            <p className="text-lg font-medium">No requests found matching your filters.</p>
            <p className="text-sm">Try adjusting the grade or district.</p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const displayItems = getDisplayItems(req);

            return (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group relative">

                {/* IMAGE HEADER */}
                <div className="h-32 w-full relative overflow-hidden bg-gray-100">
                  <img
                    src={getHeaderImage(req.studentName)}
                    alt="Books"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                  <div className="absolute top-3 right-3 flex gap-2">
                    {req.urgency === UrgencyLevel.CRITICAL && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse shadow-sm">
                        <AlertCircle size={12} /> {t.urgentBadge}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 text-white/90 text-xs font-medium flex items-center gap-1">
                    <Clock size={12} /> {getTimeAgo(req.timestamp)}
                  </div>
                </div>

                {/* CARD CONTENT */}
                <div className="p-6 pt-0 flex-1 relative">

                  {/* Avatar */}
                  <div className="relative -mt-10 mb-3 flex justify-between items-end">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-3xl">
                        {req.studentName.charAt(0)}
                      </div>
                    </div>

                    {req.status === 'Partially Fulfilled' && (
                      <span className="mb-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        <Users size={12} /> {t.statusPartial}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{req.studentName}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={14} className="text-teal-500" />
                      {req.district}
                    </div>
                  </div>

                  {/* Specific Items List */}
                  <div className="mb-4 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Requested Items:</p>
                    {displayItems.map((item, idx) => {
                      const remaining = item.quantity - item.fulfilledCount;
                      if (remaining <= 0) return null; // Hide fulfilled items in basic view
                      return (
                        <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <span className="flex items-center gap-2 text-gray-700">
                            {getCategoryIcon(item.category)} {item.category}
                          </span>
                          <span className="font-bold text-teal-600 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-200">
                            {item.fulfilledCount} / {item.quantity}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 group-hover:border-teal-100 transition-colors">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Note</p>
                    <p className="text-gray-700 text-sm italic line-clamp-2">"{req.details}"</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 group-hover:bg-white transition-colors">
                  <button
                    onClick={() => handleDonateClick(req)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                  >
                    <Heart size={18} className="fill-current" />
                    {req.status === 'Partially Fulfilled' ? 'Help Complete Request' : t.btnDonate}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* NEW Donation Modal with Checklist */}
      {selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in max-h-[95vh] overflow-y-auto flex flex-col">

            {/* Modal Header */}
            <div className="bg-teal-600 p-6 text-white relative flex-shrink-0">
              <button
                onClick={() => setSelectedReq(null)}
                className="absolute top-4 right-4 text-teal-100 hover:text-white p-2 hover:bg-teal-500 rounded-full transition-colors z-10"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold mb-1">{t.donorModalTitle}</h3>
              <p className="text-teal-100 text-sm">
                {t.donorModalSubtitle} <span className="font-bold text-white">{selectedReq.studentName}</span>
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow">

              {/* Checklist Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <CheckCircle size={18} className="text-teal-600" /> Select Items to Donate
                  </h4>
                  {/* Toggle: All vs Select */}
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setIsDonatingAll(true)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isDonatingAll ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500'}`}
                    >
                      Everything
                    </button>
                    <button
                      onClick={() => setIsDonatingAll(false)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!isDonatingAll ? 'bg-white shadow-sm text-teal-700' : 'text-gray-500'}`}
                    >
                      Select
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                  {getDisplayItems(selectedReq).map((item, idx) => {
                    const remaining = item.quantity - item.fulfilledCount;
                    if (remaining <= 0) return null; // Already done

                    const isSelected = !!donationPlan[item.category];
                    // If donating all, amount is remaining. If partial, read from plan or 0.
                    const amount = isDonatingAll ? remaining : (donationPlan[item.category] || 0);

                    return (
                      <div key={idx} className={`p-4 transition-colors ${isSelected || isDonatingAll ? 'bg-teal-50/50' : 'bg-white'}`}>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => !isDonatingAll && toggleItemDonation(item.category, remaining)}
                            disabled={isDonatingAll}
                            className={`flex-shrink-0 ${isDonatingAll ? 'cursor-default' : 'cursor-pointer'}`}
                          >
                            {isDonatingAll || isSelected ? (
                              <CheckSquare className="text-teal-600" size={24} />
                            ) : (
                              <Square className="text-gray-300" size={24} />
                            )}
                          </button>

                          <div className="flex-grow">
                            <p className="font-bold text-gray-800 text-sm">{item.category}</p>
                            <p className="text-xs text-gray-500">Needed: {remaining} more</p>
                          </div>

                          {/* Quantity Input - only editable if NOT donating all and item is selected */}
                          {(isDonatingAll || isSelected) && (
                            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1">
                              <span className="text-xs font-bold text-gray-500">Qty:</span>
                              {isDonatingAll ? (
                                <span className="font-bold text-teal-700 px-2">{remaining}</span>
                              ) : (
                                <input
                                  type="number"
                                  min="1"
                                  max={remaining}
                                  className="w-12 text-center font-bold text-gray-800 outline-none"
                                  value={amount}
                                  onChange={(e) => updateItemQuantity(item.category, parseInt(e.target.value) || 0, remaining)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.formName}</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={donorName}
                    onChange={e => setDonorName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.labelShipping}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShippingMethod('post')}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${shippingMethod === 'post'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-500 hover:border-teal-200'
                        }`}
                    >
                      <Truck size={24} />
                      <span className="text-sm font-medium">{t.shipPost}</span>
                    </button>
                    <button
                      onClick={() => setShippingMethod('person')}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${shippingMethod === 'person'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-500 hover:border-teal-200'
                        }`}
                    >
                      <MapPin size={24} />
                      <span className="text-sm font-medium">{t.shipPerson}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-2 bg-gray-50 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={submitDonation}
                disabled={!donorName || (!isDonatingAll && Object.keys(donationPlan).length === 0)}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all transform ${donorName && (isDonatingAll || Object.keys(donationPlan).length > 0)
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