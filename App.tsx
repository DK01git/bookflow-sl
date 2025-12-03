import React, { useState, useEffect } from 'react';
import { BookOpen, Globe, Menu, X, Heart, Home, LayoutDashboard, Send, Loader2, User } from 'lucide-react';
import { TRANSLATIONS } from './constants';
import { AppState, BookRequest, Language } from './types';
import { getRequests, saveRequest, updateRequestStatus, saveUserDonation, getUserDonations } from './services/storage';
import { RequestForm } from './components/RequestForm';
import { DonorFeed } from './components/DonorFeed';
import { SLMap } from './components/SLMap';

const App = () => {
  const [lang, setLang] = useState<Language>('en');
  const [view, setView] = useState<'home' | 'request' | 'donate' | 'dashboard'>('home');
  const [menuOpen, setMenuOpen] = useState(false);

  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [userDonations, setUserDonations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount and view change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getRequests();
      setRequests(data);
      setUserDonations(getUserDonations());
      setIsLoading(false);
    };
    fetchData();
  }, [view]);

  const t = TRANSLATIONS[lang];

  const handleRequestSubmit = async (req: BookRequest) => {
    // Optimistic update
    setRequests(prev => [req, ...prev]);
    setView('dashboard');

    // Save to Cloud
    await saveRequest(req);
    // Re-fetch to ensure sync
    const data = await getRequests();
    setRequests(data);
  };

  const handleDonate = async (req: BookRequest, donorDetails: any) => {
    // Save donation to local storage for "My Dashboard"
    saveUserDonation(req.id);

    // Determine status based on supply type
    // If 'Full', it moves to Fulfilled (Matched). If 'Partial', it becomes/stays 'Partially Fulfilled'
    const newStatus: BookRequest['status'] = donorDetails.supplyType === 'full' ? 'Fulfilled' : 'Partially Fulfilled';

    // Update Cloud DB with status and append donor info
    await updateRequestStatus(req.id, newStatus, {
      donorName: donorDetails.name,
      supplyType: donorDetails.supplyType,
      timestamp: Date.now()
    });

    // Construct sophisticated WhatsApp Message
    const supplyText = donorDetails.supplyType === 'full' ? 'everything you requested' : 'some of the items';
    const shipText = donorDetails.shipping === 'post' ? 'courier/post' : 'dropping them off at school';

    const message = `Hi ${req.studentName}, I found your request on BookFlow SL! 🌊📚\n\nI'm ${donorDetails.name} and I'd like to help. I can provide ${supplyText} for your ${req.grade} studies.\n\nI will be sending them via ${shipText}.\n\nPlease let me know the best address/time to send them!`;

    // WhatsApp Deep Link
    const url = `https://wa.me/${req.contactNumber.replace(/^0/, '94')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    // Refresh Data
    const data = await getRequests();
    setRequests(data);
    setView('dashboard');
  };

  const activeRequestsCount = requests.filter(r => r.status === 'Pending' || r.status === 'Partially Fulfilled').length;
  const fulfilledCount = requests.filter(r => r.status === 'Fulfilled' || r.status === 'Matched').length;

  // Get unique districts with requests
  const affectedDistricts = Array.from(new Set(requests.filter(r => r.status === 'Pending' || r.status === 'Partially Fulfilled').map(r => r.district)));

  // Calculate counts per district
  const districtRequestCounts = requests.reduce((acc, req) => {
    if (req.status === 'Pending' || req.status === 'Partially Fulfilled') {
      acc[req.district] = (acc[req.district] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // -- DASHBOARD LOGIC --
  const myMatchedRequests = requests.filter(r => userDonations.includes(r.id));
  const publicActivity = requests.filter(r => (r.status === 'Matched' || r.status === 'Fulfilled' || r.status === 'Partially Fulfilled') && !userDonations.includes(r.id));
  // ---------------------

  if (isLoading && requests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-teal-600">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-10 w-10" />
          <p className="font-medium animate-pulse">Loading BookFlow SL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center cursor-pointer group" onClick={() => setView('home')}>
              <div className="bg-teal-600 p-2 rounded-lg mr-2 transition-transform group-hover:scale-110">
                <BookOpen className="text-white h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-teal-700 transition-colors">BookFlow<span className="text-teal-600">SL</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => setView('home')} className={`text-sm font-medium transition-colors ${view === 'home' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-900'}`}>{t.navHome}</button>
              <button onClick={() => setView('donate')} className={`text-sm font-medium transition-colors ${view === 'donate' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-900'}`}>{t.navRequests}</button>
              <button onClick={() => setView('dashboard')} className={`text-sm font-medium transition-colors ${view === 'dashboard' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-900'}`}>{t.navDashboard}</button>

              <button
                onClick={() => setLang(lang === 'en' ? 'si' : 'en')}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 transition-colors border border-gray-200"
              >
                <Globe size={14} />
                {lang === 'en' ? 'සිංහල' : 'English'}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setLang(lang === 'en' ? 'si' : 'en')} className="font-sinhala text-sm font-bold text-gray-600">
                {lang === 'en' ? 'SIN' : 'ENG'}
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 p-2 hover:bg-gray-100 rounded-full">
                {menuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg z-50">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <button onClick={() => { setView('home'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600">{t.navHome}</button>
              <button onClick={() => { setView('donate'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600">{t.navRequests}</button>
              <button onClick={() => { setView('dashboard'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600">{t.navDashboard}</button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {view === 'home' && (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Section with Image Background */}
            <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl min-h-[450px] flex items-center group">
              {/* Background Image */}
              <img
                src="https://images.unsplash.com/photo-1529390003361-5ed161d4a491?auto=format&fit=crop&q=80&w=2000"
                alt="Students reading"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-900/80 to-blue-900/30"></div>

              {/* Content */}
              <div className="relative z-10 max-w-2xl text-white">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-sm">
                  {t.heroTitle}
                </h1>
                <p className="text-teal-50 text-lg md:text-xl mb-10 font-medium leading-relaxed max-w-lg drop-shadow-md">
                  {t.heroSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setView('request')}
                    className="bg-white text-teal-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all transform hover:-translate-y-1 flex justify-center items-center gap-2"
                  >
                    <BookOpen size={20} />
                    {t.btnRequest}
                  </button>
                  <button
                    onClick={() => setView('donate')}
                    className="bg-teal-600/40 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-teal-600/60 transition-all flex justify-center items-center gap-2"
                  >
                    <Heart size={20} />
                    {t.btnDonate}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats & Map Row */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">{t.statsBooks}</p>
                  <p className="text-4xl font-black text-gray-800">{activeRequestsCount}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">{t.statsFulfilled}</p>
                  <p className="text-4xl font-black text-teal-600">{fulfilledCount}</p>
                </div>
                <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-blue-900 font-bold text-lg mb-1">{t.matchTitle}</p>
                    <p className="text-blue-700 text-sm">Join {userDonations.length > 0 ? 'us again' : '100+ donors'} making a difference today.</p>
                  </div>
                  <div className="bg-white p-3 rounded-full shadow-sm relative z-10">
                    <Globe className="text-blue-600" />
                  </div>
                  {/* Decorative pattern */}
                  <div className="absolute right-0 top-0 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -mr-10 -mt-10"></div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Flood Impact Map</h3>
                  <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-1 rounded-full border border-red-100">Live Updates</span>
                </div>
                <SLMap requestCounts={districtRequestCounts} />
              </div>
            </div>
          </div>
        )}

        {view === 'request' && (
          <RequestForm lang={lang} onSubmit={handleRequestSubmit} onCancel={() => setView('home')} />
        )}

        {view === 'donate' && (
          <DonorFeed requests={requests} lang={lang} onDonate={handleDonate} />
        )}

        {view === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <LayoutDashboard className="text-teal-600" />
              {t.navDashboard}
            </h2>

            {/* My Donations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-teal-50 px-6 py-4 border-b border-teal-100 flex justify-between items-center">
                <h3 className="font-bold text-teal-800 flex items-center gap-2">
                  <Heart size={18} className="fill-teal-800/20" /> My Commitments
                </h3>
                <span className="text-xs font-semibold text-teal-600 bg-white px-2 py-1 rounded-md shadow-sm border border-teal-100">
                  {myMatchedRequests.length} Total
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {userDonations.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart size={32} className="text-gray-300" />
                    </div>
                    <p className="mb-2 font-medium text-gray-900">No commitments yet</p>
                    <p className="text-sm text-gray-500 mb-6">You haven't made any donation commitments on this device yet.</p>
                    <button onClick={() => setView('donate')} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 mx-auto shadow-md">
                      Start Helping <Heart size={16} />
                    </button>
                  </div>
                ) : myMatchedRequests.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>You have donation records, but the original requests are no longer available in the active database.</p>
                  </div>
                ) : (
                  myMatchedRequests.map(req => (
                    <div key={req.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-lg border-2 border-white shadow-sm">
                          {req.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">{req.studentName}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <span className="font-medium text-gray-700">{req.school}</span> • {req.district}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <a
                          href={`https://wa.me/${req.contactNumber.replace(/^0/, '94')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 sm:flex-none justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors flex items-center gap-2 border border-green-200"
                        >
                          WhatsApp <Send size={14} />
                        </a>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${req.status === 'Partially Fulfilled'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-teal-50 text-teal-700 border-teal-200'
                          }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Public Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <h3 className="font-bold text-blue-800 flex items-center gap-2">
                  <Globe size={18} /> Community Activity
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {publicActivity.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No other public matches yet. Be the first to donate!</p>
                  </div>
                ) : (
                  publicActivity.slice(0, 5).map(req => {
                    const lastDonorName = req.donors && req.donors.length > 0
                      ? req.donors[req.donors.length - 1].donorName
                      : (req.donorId && req.donorId !== 'anonymous' ? req.donorId : 'A Donor');

                    return (
                      <div key={req.id} className="p-6 flex items-center gap-4">
                        <div className="bg-blue-100 p-2.5 rounded-full text-blue-600 ring-4 ring-blue-50">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-gray-800">
                            <span className="font-bold">{lastDonorName}</span> matched with <span className="font-bold">{req.studentName}</span> from {req.district}.
                          </p>
                          <div className="flex gap-2 mt-1 items-center">
                            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">Status: {req.status}</span>
                            {req.donors && req.donors.length > 1 && (
                              <span className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                                <Heart size={10} className="fill-teal-600" /> + {req.donors.length - 1} others
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="bg-gray-800 p-2 rounded-lg">
              <BookOpen className="text-teal-500 h-6 w-6" />
            </div>
            <span className="font-bold text-xl text-gray-100">BookFlow<span className="text-teal-500">SL</span></span>
          </div>
          <p className="mb-6 max-w-md mx-auto">A community-driven platform to help restore education for children affected by the floods in Sri Lanka.</p>
          <div className="flex justify-center gap-4 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          <p className="mt-8 text-xs text-gray-600">© 2024 BookFlow SL. Built with ❤️ for Sri Lanka.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;