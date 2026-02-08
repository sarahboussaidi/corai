
import React from 'react';
import { UI_STRINGS } from '../constants';

const Home: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-6xl animate-in fade-in duration-700 pb-12">
      
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-[60px] p-10 md:p-20 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-10">
        
        {/* Decorative Background Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500 rounded-full blur-[80px] opacity-40 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex-1 text-center md:text-right">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight drop-shadow-lg">{UI_STRINGS.HOME_HERO_TITLE}</h1>
          <p className="text-xl md:text-2xl text-indigo-100 leading-relaxed mb-10 font-medium opacity-90">
            {UI_STRINGS.HOME_HERO_DESC}
          </p>
          <button 
            onClick={() => onNavigate('translator')}
            className="group bg-white text-indigo-900 pr-4 pl-8 py-4 rounded-full font-black text-xl hover:scale-105 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-white/20 flex items-center gap-4 mx-auto md:mx-0"
          >
            <span>إبدأ الآن</span>
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </button>
        </div>

        {/* Visual Graphic */}
        <div className="relative z-10 w-full md:w-1/3 flex justify-center">
           <div className="w-64 h-64 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/20 flex items-center justify-center shadow-2xl animate-[float_6s_ease-in-out_infinite]">
              <svg className="w-32 h-32 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
           </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 w-full">
        <button className="bg-white p-10 rounded-[50px] shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all border border-slate-100 text-right group">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-[30px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-4">{UI_STRINGS.HOME_CAUSE_TITLE}</h3>
          <p className="text-slate-500 text-lg leading-relaxed">{UI_STRINGS.HOME_CAUSE_DESC}</p>
        </button>

        <button onClick={() => onNavigate('guide')} className="bg-white p-10 rounded-[50px] shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all border border-slate-100 text-right group">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[30px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-4">{UI_STRINGS.NAV_GUIDE}</h3>
          <p className="text-slate-500 text-lg leading-relaxed mb-6">ما تعرفش كيفاش تستعمل التطبيق؟ عنا دليل كامل يفسرلك كل شيء خطوة بخطوة.</p>
          <div className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
            <span>إقرأ الدليل</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </div>
        </button>
      </div>

      {/* Organization Section */}
      <div className="w-full mt-12 bg-white rounded-[50px] shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-indigo-900/5 p-10 md:p-14">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 bg-white rounded-3xl shadow-md flex items-center justify-center text-indigo-900 shrink-0 border border-indigo-50">
               {/* Icon representing Organization */}
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-indigo-950 mb-4">{UI_STRINGS.HOME_ORG_TITLE}</h2>
              <h3 className="text-2xl font-bold text-indigo-600 mb-4">{UI_STRINGS.HOME_ORG_NAME}</h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {UI_STRINGS.HOME_ORG_DESC}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                    <p className="text-3xl font-black text-indigo-600">1983</p>
                    <p className="text-slate-400 text-sm font-bold mt-1">عام التأسيس</p>
                 </div>
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                    <p className="text-3xl font-black text-indigo-600">+1400</p>
                    <p className="text-slate-400 text-sm font-bold mt-1">مستفيد</p>
                 </div>
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
                    <p className="text-3xl font-black text-indigo-600">وطنية</p>
                    <p className="text-slate-400 text-sm font-bold mt-1">منفعة عامة</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-10 md:p-14 border-t border-slate-100">
            <h3 className="text-2xl font-black text-slate-800 mb-4">{UI_STRINGS.HOME_ORG_CONTEXT_TITLE}</h3>
            <p className="text-slate-500 text-lg leading-relaxed">
              {UI_STRINGS.HOME_ORG_CONTEXT_DESC}
            </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
