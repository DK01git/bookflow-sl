import React, { useState, useEffect } from 'react';
import { BookOpen, Globe, Menu, X, Heart, Home, LayoutDashboard, Send, Loader2 } from 'lucide-react';
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
    
    // Update Cloud DB
    await updateRequestStatus(req.id, 'Matched', donorDetails.name);

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

  const activeRequestsCount = requests.filter(r => r.status === 'Pending').length;
  const fulfilledCount = requests.filter(r => r.status === 'Fulfilled' || r.status === 'Matched').length;
  
  // Get unique districts with requests
  const affectedDistricts = Array.from(new Set(requests.filter(r => r.status === 'Pending').map(r => r.district)));

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
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
              <div className="bg-teal-600 p-2 rounded-lg mr-2">
                 <BookOpen className="text-white h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">BookFlow<span className="text-teal-600">SL</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => setView('home')} className={`text-sm font-medium transition-colors ${view === 'home' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-900'}`}>{t.navHome}</button>
              <button onClick={() => setView('donate')} className={`text-sm font-medium transition-colors ${view === 'donate' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-900'}`}>{t.navRequests}</button>
              <button onClick={() => setView('dashboard')} className={`text-sm font-medium transition-colors ${view === 'dashboard' ? 'text-teal-600' : 'text-gray-500 hover:text-gray-900'}`}>{t.navDashboard}</button>
              
              <button 
                onClick={() => setLang(lang === 'en' ? 'si' : 'en')} 
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 transition-colors"
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
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600">
                {menuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
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
            {/* Hero */}
            <div className="bg-gradient-to-br from-teal-600 to-blue-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
               {/* Decorative circles */}
               <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
               <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 rounded-full bg-white opacity-10 blur-2xl"></div>

               <div className="relative z-10 max-w-2xl">
                 <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{t.heroTitle}</h1>
                 <p className="text-teal-100 text-lg md:text-xl mb-8 font-light">{t.heroSubtitle}</p>
                 <div className="flex flex-col sm:flex-row gap-4">
                   <button 
                    onClick={() => setView('request')}
                    className="bg-white text-teal-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-1 flex justify-center items-center gap-2"
                   >
                     <BookOpen size={20} />
                     {t.btnRequest}
                   </button>
                   <button 
                    onClick={() => setView('donate')}
                    className="bg-teal-800 bg-opacity-40 backdrop-blur-lg border border-teal-400 text-white px-8 py-4 rounded-xl font-bold hover:bg-opacity-50 transition-all flex justify-center items-center gap-2"
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
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium mb-1">{t.statsBooks}</p>
                    <p className="text-4xl font-bold text-gray-800">{activeRequestsCount}</p>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium mb-1">{t.statsFulfilled}</p>
                    <p className="text-4xl font-bold text-teal-600">{fulfilledCount}</p>
                 </div>
                 <div className="col-span-2 bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <div>
                      <p className="text-blue-800 font-bold text-lg">{t.matchTitle}</p>
                      <p className="text-blue-600 text-sm">Join {userDonations.length > 0 ? 'us again' : '100+ donors'} making a difference.</p>
                    </div>
                    <div className="bg-white p-3 rounded-full shadow-sm">
                       <Globe className="text-blue-500" />
                    </div>
                 </div>
              </div>

              {/* Map */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Flood Impact Map</h3>
                <SLMap highlightDistricts={affectedDistricts} />
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
           <div className="space-y-8">
             <h2 className="text-2xl font-bold text-gray-800">{t.navDashboard}</h2>
             
             {/* My Donations */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-teal-50 px-6 py-4 border-b border-teal-100">
                  <h3 className="font-bold text-teal-800 flex items-center gap-2">
                    <Heart size={18} /> My Commitments
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                   {userDonations.length === 0 ? (
                     <div className="p-8 text-center text-gray-500">
                       You haven't donated yet. <button onClick={() => setView('donate')} className="text-teal-600 font-medium underline">Start now</button>
                     </div>
                   ) : (
                     requests.filter(r => userDonations.includes(r.id)).map(req => (
                       <div key={req.id} className="p-6 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-gray-800">{req.studentName}</p>
                            <p className="text-sm text-gray-500">{req.school} • {req.district}</p>
                          </div>
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                            {req.status}
                          </span>
                       </div>
                     ))
                   )}
                </div>
             </div>

             {/* Recent Public Activity */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                  <h3 className="font-bold text-blue-800 flex items-center gap-2">
                    <Globe size={18} /> Public Activity
                  </h3>
               </div>
               <div className="p-6">
                 <p className="text-gray-600 text-sm">Recent matches will appear here as the community grows!</p>
               </div>
             </div>
           </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8 text-center mt-auto">
        <p>© 2024 BookFlow SL. Built with ❤️ for Sri Lanka.</p>
      </footer>
    </div>
  );
};

export default App;