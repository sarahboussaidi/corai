
import React from 'react';
import { UI_STRINGS } from '../constants';

const Guide: React.FC = () => {
  return (
    <div className="flex flex-col items-center w-full max-w-5xl animate-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-5xl font-black text-indigo-950 mb-12 text-center">{UI_STRINGS.GUIDE_TITLE}</h2>
      
      <div className="space-y-8 w-full">
        {/* Step 1 */}
        <div className="flex flex-col md:flex-row items-center bg-white p-8 rounded-[40px] shadow-lg gap-8 border border-slate-50">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl font-black text-indigo-600 shrink-0">1</div>
          <div className="flex-1 text-center md:text-right">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{UI_STRINGS.GUIDE_STEP_1}</h3>
            <p className="text-slate-500 text-lg">{UI_STRINGS.GUIDE_STEP_1_DESC}</p>
          </div>
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col md:flex-row items-center bg-white p-8 rounded-[40px] shadow-lg gap-8 border border-slate-50">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-4xl font-black text-purple-600 shrink-0">2</div>
          <div className="flex-1 text-center md:text-right">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{UI_STRINGS.GUIDE_STEP_2}</h3>
            <p className="text-slate-500 text-lg">{UI_STRINGS.GUIDE_STEP_2_DESC}</p>
          </div>
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col md:flex-row items-center bg-white p-8 rounded-[40px] shadow-lg gap-8 border border-slate-50">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-4xl font-black text-emerald-600 shrink-0">3</div>
          <div className="flex-1 text-center md:text-right">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{UI_STRINGS.GUIDE_STEP_3}</h3>
            <p className="text-slate-500 text-lg">{UI_STRINGS.GUIDE_STEP_3_DESC}</p>
          </div>
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;
