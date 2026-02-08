
import React, { useState } from 'react';
import { playTunisianTTS } from '../services/gemini';

const QuickMessages: React.FC = () => {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  
  const speak = async (text: string, idx: number) => {
    // Prevent multiple clicks
    if (loadingIndex !== null) return;
    
    setLoadingIndex(idx);
    
    try {
      // Use Gemini TTS for authentic Tunisian dialect
      await playTunisianTTS(text);
    } catch (e) {
      console.error("Gemini TTS Failed, falling back to browser", e);
      // Fallback to browser TTS (even if imperfect)
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar';
      utterance.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(v => v.lang.includes('ar'));
      if (arabicVoice) utterance.voice = arabicVoice;
      window.speechSynthesis.speak(utterance);
    } finally {
      setLoadingIndex(null);
    }
  };

  const messages = [
    // URGENT / EMERGENCY (Red/Orange)
    { 
      text: "عاونوني!", 
      sub: "I need help",
      color: "bg-red-500 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    },
    { 
      text: "عيطو للـ Ambulance", 
      sub: "Call Ambulance",
      color: "bg-red-600 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
    },
    { 
      text: "راني موجوع", 
      sub: "I am in pain",
      color: "bg-orange-500 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
    },

    // IDENTITY (Blue/Indigo)
    { 
      text: "ما نسمعش (أصم)", 
      sub: "I am deaf",
      color: "bg-indigo-600 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><line x1="17" y1="17" x2="7" y2="7" stroke="white" strokeWidth="2" /></svg>
    },
    { 
      text: "ما نتكلمش (أبكم)", 
      sub: "I can't speak",
      color: "bg-indigo-500 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-5.062C3.583 13.587 3 12.016 3 10.47c0-4.418 4.03-8 9-8s9 3.582 9 8z" /><line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2" /></svg>
    },
    { 
      text: "ضعت، وين أنا؟", 
      sub: "I am lost",
      color: "bg-blue-500 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },

    // NEEDS (Teal/Green)
    { 
      text: "نحب الماء", 
      sub: "Water",
      color: "bg-teal-500 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2v-5.34l6.18-4.12a2 2 0 012.24 0l2.36 1.58h.04l2.36-1.58a2 2 0 012.24 0l6.18 4.12z" /></svg>
    },
    { 
      text: "وين التواليت؟", 
      sub: "Bathroom",
      color: "bg-teal-600 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
    { 
      text: "يعيشك", 
      sub: "Thank you",
      color: "bg-emerald-500 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
    },
    
    // RESPONSES (Gray)
    { 
      text: "إيه (نعم)", 
      sub: "Yes",
      color: "bg-slate-700 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    { 
      text: "لا", 
      sub: "No",
      color: "bg-slate-700 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    { 
      text: "يزي (وقف)", 
      sub: "Stop",
      color: "bg-slate-800 text-white", 
      icon: <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
    },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-6xl animate-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-indigo-950 mb-4">فيساع (S.O.S)</h2>
        <p className="text-slate-400 text-xl">إضغط على أي زر باش يتنطق بصوت عالي (Gemini AI)</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {messages.map((msg, idx) => (
          <button
            key={idx}
            onClick={() => speak(msg.text, idx)}
            className={`${msg.color} p-6 rounded-[30px] shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex flex-col items-center justify-center gap-4 text-center min-h-[180px] relative overflow-hidden`}
          >
            {loadingIndex === idx && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              {msg.icon}
            </div>
            <div>
              <p className="text-2xl font-black mb-1 leading-tight">{msg.text}</p>
              <p className="text-white/70 text-sm font-bold uppercase tracking-wider">{msg.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickMessages;
