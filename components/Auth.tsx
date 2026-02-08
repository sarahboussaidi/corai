
import React, { useState, useRef, useEffect } from 'react';
import { UI_STRINGS } from '../constants';
import { AuthService } from '../services/auth';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  
  // Camera / FaceID State
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'scan' | 'capture'>('scan'); // 'scan' for login, 'capture' for signup photo
  const [scanProgress, setScanProgress] = useState(0);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (mode: 'scan' | 'capture') => {
    setError(null);
    setCameraMode(mode);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setShowCamera(true);
      // Wait for React to render the video element
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);

      if (mode === 'scan') {
        // Simulate FaceID Scan
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setScanProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
               stopCamera();
               performFaceLogin();
            }, 500);
          }
        }, 80);
      }
    } catch (e) {
      console.error("Camera Error", e);
      setError("ما نجمناش نحلو الكاميرا.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const data = canvas.toDataURL('image/jpeg');
      setTempPhoto(data);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setScanProgress(0);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleSubmit = () => {
    setError(null);
    if (isLogin) {
      performLogin();
    } else {
      performSignup();
    }
  };

  const performFaceLogin = () => {
    try {
      const user = AuthService.loginWithFace();
      onLogin(user);
    } catch (e: any) {
       setError(UI_STRINGS.AUTH_ERR_FACE_NOT_MATCHED);
    }
  };

  const performLogin = () => {
    try {
      const user = AuthService.login(formData.email, formData.password);
      onLogin(user);
    } catch (e: any) {
      if (e.message === 'USER_NOT_FOUND') setError(UI_STRINGS.AUTH_ERR_NO_USER);
      else if (e.message === 'INVALID_CREDENTIALS') setError(UI_STRINGS.AUTH_ERR_INVALID);
      else setError("ثمة مشكلة، عاود ثبت.");
    }
  };

  const performSignup = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("عمر المعلومات الكل عيشك.");
      return;
    }
    try {
      const newUser: User = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        photo: tempPhoto || undefined
      };
      const created = AuthService.register(newUser);
      onLogin(created);
    } catch (e: any) {
      if (e.message === 'USER_EXISTS') setError(UI_STRINGS.AUTH_ERR_EXISTS);
      else setError("ما نجمناش نسجلو الحساب.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full animate-in zoom-in duration-500">
      
      {/* Camera Overlay */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md aspect-square rounded-[40px] overflow-hidden border-4 border-white/20 shadow-2xl">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            
            {cameraMode === 'scan' ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-indigo-400/50 rounded-full animate-pulse relative">
                     <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                  </div>
                </div>
                <div className="absolute bottom-0 w-full h-2 bg-slate-700">
                   <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                </div>
              </>
            ) : (
              <button 
                onClick={capturePhoto}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full border-8 border-slate-200 shadow-xl active:scale-90 transition"
                aria-label="Capture Photo"
              />
            )}
            
            <button onClick={stopCamera} className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-white font-bold text-2xl mt-8 animate-pulse text-center px-4">
            {cameraMode === 'scan' 
              ? (scanProgress === 100 ? UI_STRINGS.AUTH_FACE_SUCCESS : UI_STRINGS.AUTH_FACE_SCANNING)
              : "خوذ تصويرة لوجهك"
            }
          </p>
        </div>
      )}

      <div className="bg-white p-6 md:p-14 rounded-[50px] shadow-2xl w-full max-w-lg border border-slate-100 relative">
        {/* Header Icon */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-slate-50">
           {isLogin ? (
             <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
           ) : (
             <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
           )}
        </div>

        <h2 className="text-4xl font-black text-indigo-950 mb-2 text-center mt-12">{UI_STRINGS.AUTH_WELCOME}</h2>
        <p className="text-slate-400 text-center mb-10 text-lg font-medium">
          {isLogin ? UI_STRINGS.AUTH_SIGNIN : UI_STRINGS.AUTH_SIGNUP}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-center font-bold border border-red-100 animate-pulse flex items-center justify-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div className="space-y-5">
           {!isLogin && (
             <div className="space-y-3">
               <div className="relative">
                 <div className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                 </div>
                 <input 
                   type="text" 
                   placeholder={UI_STRINGS.AUTH_NAME}
                   value={formData.name}
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full p-5 pr-14 bg-slate-50 rounded-3xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" 
                 />
               </div>
               
               {/* Profile Pic Preview/Capture */}
               <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-3xl border border-slate-200">
                 <div className="w-16 h-16 bg-slate-200 rounded-2xl overflow-hidden flex-shrink-0">
                   {tempPhoto ? (
                     <img src={tempPhoto} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-400">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     </div>
                   )}
                 </div>
                 <div className="flex-1">
                   <p className="text-xs text-slate-500 font-bold mb-1">تصويرة البروفيل (لـ FaceID)</p>
                   <button onClick={() => startCamera('capture')} className="text-indigo-600 text-sm font-black hover:underline flex items-center gap-1">
                     {tempPhoto ? "بدل التصويرة" : "حل الكاميرا"}
                   </button>
                 </div>
               </div>
             </div>
           )}
           
           <div className="relative">
             <div className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
             </div>
             <input 
               type="email" 
               placeholder={UI_STRINGS.AUTH_EMAIL} 
               value={formData.email}
               onChange={e => setFormData({...formData, email: e.target.value})}
               className="w-full p-5 pr-14 bg-slate-50 rounded-3xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" 
             />
           </div>
           
           {(isLogin || !isLogin) && (
             <div className="relative">
               <div className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
               </div>
               <input 
                 type="password" 
                 placeholder={UI_STRINGS.AUTH_PASS} 
                 value={formData.password}
                 onChange={e => setFormData({...formData, password: e.target.value})}
                 className="w-full p-5 pr-14 bg-slate-50 rounded-3xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold" 
               />
             </div>
           )}
           
           <button 
             onClick={handleSubmit}
             className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-3"
           >
             <span>{isLogin ? UI_STRINGS.AUTH_BTN : UI_STRINGS.AUTH_REGISTER_BTN}</span>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
           </button>

           {isLogin && (
             <>
               <div className="relative py-4">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                 <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-bold">أو</span></div>
               </div>

               <button 
                 onClick={() => startCamera('scan')}
                 className="group w-full py-5 bg-white text-slate-700 border-2 border-slate-100 rounded-3xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
               >
                 <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 {UI_STRINGS.AUTH_FACE_ID}
               </button>
             </>
           )}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-indigo-600 font-bold hover:underline">
            {isLogin ? UI_STRINGS.AUTH_NO_ACCOUNT : UI_STRINGS.AUTH_HAS_ACCOUNT}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
