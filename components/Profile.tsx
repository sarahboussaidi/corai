
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { AuthService } from '../services/auth';
import { UI_STRINGS } from '../constants';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [photo, setPhoto] = useState(user.photo);
  const [msg, setMsg] = useState<string | null>(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (e) { console.error(e); }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setPhoto(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const handleSave = () => {
    try {
      const updated = AuthService.updateUser(user.email, { name, photo });
      onUpdate(updated);
      setMsg(UI_STRINGS.PROFILE_SUCCESS);
      setTimeout(() => setMsg(null), 3000);
    } catch (e) {
      console.error(e);
      setMsg("Error saving.");
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl animate-in fade-in duration-700">
      
      {showCamera && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md aspect-video bg-black rounded-3xl overflow-hidden border-4 border-white">
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
             <button onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-300" />
             <button onClick={stopCamera} className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-2 w-10 h-10">✕</button>
          </div>
        </div>
      )}

      <h2 className="text-4xl font-black text-indigo-950 mb-10">{UI_STRINGS.PROFILE_TITLE}</h2>

      <div className="bg-white p-10 rounded-[50px] shadow-xl w-full flex flex-col md:flex-row gap-10 items-start border border-slate-100">
        
        {/* Photo Section */}
        <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
          <div className="w-48 h-48 rounded-[40px] overflow-hidden bg-slate-100 shadow-inner border-4 border-white ring-4 ring-indigo-50">
             {photo ? (
               <img src={photo} alt={name} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300 font-black">
                 {name.charAt(0).toUpperCase()}
               </div>
             )}
          </div>
          <button onClick={startCamera} className="text-indigo-600 font-bold bg-indigo-50 px-6 py-3 rounded-full hover:bg-indigo-100 transition">
            {UI_STRINGS.PROFILE_TAKE_PHOTO}
          </button>
          <p className="text-xs text-slate-400 text-center max-w-[200px]">
            التصويرة هاذي هي اللي نستعملوها في الـ FaceID باش نتعرفو عليك.
          </p>
        </div>

        {/* Info Section */}
        <div className="flex-1 w-full space-y-6">
           <div>
             <label className="block text-slate-500 font-bold mb-2 ml-2">{UI_STRINGS.AUTH_NAME}</label>
             <input 
               type="text" 
               value={name} 
               onChange={e => setName(e.target.value)}
               className="w-full p-5 bg-slate-50 rounded-3xl border border-slate-200 font-bold focus:ring-4 focus:ring-indigo-100 outline-none" 
             />
           </div>
           
           <div>
             <label className="block text-slate-500 font-bold mb-2 ml-2">{UI_STRINGS.AUTH_EMAIL}</label>
             <input 
               type="text" 
               value={user.email} 
               disabled 
               className="w-full p-5 bg-slate-100 text-slate-400 rounded-3xl border border-slate-200 font-bold cursor-not-allowed" 
             />
           </div>

           <div className="pt-4">
             <button 
               onClick={handleSave}
               className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
             >
               {UI_STRINGS.PROFILE_UPDATE_BTN}
             </button>
           </div>
           
           {msg && (
             <div className="bg-green-100 text-green-700 p-4 rounded-2xl text-center font-bold animate-pulse">
               {msg}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
