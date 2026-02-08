
import React, { useState } from 'react';
import { UI_STRINGS } from './constants';
import { User } from './types';
import Translator from './components/Translator';
import Home from './components/Home';
import Guide from './components/Guide';
import Auth from './components/Auth';
import Profile from './components/Profile';
import QuickMessages from './components/QuickMessages';

type View = 'home' | 'translator' | 'guide' | 'auth' | 'profile' | 'quick';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('translator');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home');
  };

  const handleUserUpdate = (updated: User) => {
    setUser(updated);
  };

  const navigateTo = (view: View) => {
    if ((view === 'translator' || view === 'profile') && !user) {
      setCurrentView('auth');
    } else {
      setCurrentView(view);
    }
  };

  // Nav Button Component for consistency
  const NavBtn = ({ view, label, icon, urgent = false }: { view: View, label: string, icon: React.ReactNode, urgent?: boolean }) => (
    <button 
      onClick={() => navigateTo(view)} 
      className={`flex flex-col md:flex-row items-center gap-2 transition-all duration-300 p-2 rounded-xl group ${
        urgent 
          ? (currentView === view ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-red-50 text-red-500 hover:bg-red-100')
          : (currentView === view ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50')
      }`}
      aria-label={label}
    >
      <div className={`w-8 h-8 md:w-6 md:h-6 transition-transform group-hover:scale-110 ${currentView === view ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`text-xs md:text-base font-bold hidden md:block ${urgent ? '' : ''}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Tajawal'] overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="w-full px-4 py-4 md:py-6 flex justify-center sticky top-0 z-40">
        <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-[30px] px-4 md:px-8 py-3 flex items-center justify-between gap-2 md:gap-8 border border-white max-w-6xl w-full transition-all">
           
           {/* Logo Area */}
           <div 
             className="flex items-center gap-3 cursor-pointer select-none" 
             onClick={() => navigateTo('home')}
           >
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
             </div>
             <div className="hidden sm:block font-black text-2xl text-indigo-950 tracking-tighter">
               تواصل
             </div>
           </div>
           
           {/* Center Links with Icons */}
           <div className="flex gap-1 md:gap-2">
             <NavBtn 
               view="home" 
               label={UI_STRINGS.NAV_HOME} 
               icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} 
             />
             <NavBtn 
               view="quick" 
               label={UI_STRINGS.NAV_QUICK} 
               urgent={true}
               icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} 
             />
             <NavBtn 
               view="guide" 
               label={UI_STRINGS.NAV_GUIDE} 
               icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} 
             />
             <NavBtn 
               view="translator" 
               label={UI_STRINGS.NAV_TRANSLATOR} 
               icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>} 
             />
             {user && (
               <NavBtn 
                 view="profile" 
                 label={UI_STRINGS.NAV_PROFILE} 
                 icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} 
               />
             )}
           </div>

           {/* Auth Actions */}
           <div className="flex items-center gap-4">
             {user ? (
               <div className="flex items-center gap-2">
                 {user.photo && (
                   <img src={user.photo} alt="User" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 hidden sm:block shadow-sm" />
                 )}
                 <button 
                   onClick={handleLogout} 
                   className="bg-red-50 text-red-500 w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-100 transition shadow-sm"
                   aria-label={UI_STRINGS.NAV_LOGOUT}
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                 </button>
               </div>
             ) : (
               <button 
                 onClick={() => setCurrentView('auth')} 
                 className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 text-sm flex items-center gap-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                 <span className="hidden sm:inline">{UI_STRINGS.NAV_LOGIN}</span>
               </button>
             )}
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 w-full">
        {currentView === 'home' && <Home onNavigate={navigateTo} />}
        {currentView === 'guide' && <Guide />}
        {currentView === 'auth' && <Auth onLogin={handleLogin} />}
        {currentView === 'quick' && <QuickMessages />}
        {currentView === 'translator' && user && <Translator />}
        {currentView === 'profile' && user && <Profile user={user} onUpdate={handleUserUpdate} />}
        
        {/* Fallback for protected routes if accessed while logged out (though navigateTo handles most) */}
        {(currentView === 'translator' || currentView === 'profile') && !user && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
             <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
             <p>Loading...</p>
          </div>
        )}
      </main>

      <footer className="w-full text-center py-8 text-slate-400 text-sm font-black opacity-30 uppercase tracking-[0.2em] flex flex-col items-center gap-2">
        <svg className="w-6 h-6 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
        <span>Tawsil • Tunisian Accessibility Project</span>
      </footer>
    </div>
  );
};

export default App;
