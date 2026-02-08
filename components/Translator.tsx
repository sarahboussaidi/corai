
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UI_STRINGS, DEFAULT_POSE } from '../constants';
import { ChatMessage, SignPose, SignAction } from '../types';
import Avatar from './Avatar';
import { translateToSigns } from '../services/gemini';
import { transcribeAudio } from '../services/asr';
import { detectSign } from '../services/detection';

const Translator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<'speech' | 'sign'>('speech');
  const [isActive, setIsActive] = useState(false); // Visual state only
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPose, setCurrentPose] = useState<SignPose>(DEFAULT_POSE);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string>("مستعد");
  const [volumeLevel, setVolumeLevel] = useState(0); // For visual feedback

  // Refs for Logic (Truth Source)
  const isLoopActive = useRef(false); 
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const animationQueue = useRef<SignAction[]>([]);
  const isAnimating = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<any>(null);
  const maxDurationTimerRef = useRef<any>(null); // Safety mechanism
  const isSpeakingRef = useRef(false);
  const detectionTimeoutRef = useRef<any>(null);
  const previousFrameRef = useRef<Uint8ClampedArray | null>(null);
  const quotaBackoffRef = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript, isProcessing]);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  // --- MOTION DETECTION ---
  const hasSignificantMotion = (ctx: CanvasRenderingContext2D, width: number, height: number): boolean => {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      
      if (!previousFrameRef.current) {
        previousFrameRef.current = data;
        return true; 
      }

      let diff = 0;
      for (let i = 0; i < data.length; i += 60) {
        diff += Math.abs(data[i] - previousFrameRef.current[i]);
      }

      previousFrameRef.current = data;
      return diff > 30000; 
    } catch (e) {
      return true;
    }
  };

  // --- ANIMATION ENGINE ---
  const processNextFrame = useCallback(async () => {
    if (animationQueue.current.length === 0) {
      isAnimating.current = false;
      setTimeout(() => { 
        if (!isAnimating.current && animationQueue.current.length === 0) setCurrentPose(DEFAULT_POSE); 
      }, 1500);
      return;
    }
    isAnimating.current = true;
    const action = animationQueue.current.shift();
    if (action) {
      setCurrentPose(action.pose);
      await new Promise(resolve => setTimeout(resolve, Math.max(action.duration, 400)));
      processNextFrame();
    }
  }, []);

  const handleSpeechResult = async (text: string) => {
    const cleanText = text.trim();
    if (cleanText.length < 2) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: cleanText, type: 'speech' }]);
    setIsProcessing(true);
    setError(null);
    setLiveTranscript(cleanText); 
    
    try {
      const signs = await translateToSigns(cleanText);
      if (signs && signs.length > 0) {
        animationQueue.current = [...animationQueue.current, ...signs];
        if (!isAnimating.current) processNextFrame();
      } else {
        setError("المعذرة، ملقيتش كيفاش نعبر عليها.");
      }
    } catch (e: any) {
      if (e.message?.includes("QUOTA")) {
        setError("وصلنا للحد الأقصى (Quota). استنى شوية...");
      } else {
        setError("ثمة مشكلة في الترجمة.");
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => setLiveTranscript(""), 3000); 
    }
  };

  // --- RECOGNITION ENGINE ---
  const loopSignRecognition = async () => {
    if (!isLoopActive.current || !canvasRef.current || !videoRef.current) return;

    let nextDelay = 800; 

    try {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx && videoRef.current.readyState === 4) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
        
        const hasMotion = hasSignificantMotion(ctx, 640, 480);
        
        if (hasMotion && !quotaBackoffRef.current) {
          setScanStatus("قاعد نحلل...");
          setIsProcessing(true);

          const blob = await new Promise<Blob | null>(resolve => 
            canvasRef.current!.toBlob(resolve, 'image/jpeg', 0.6) 
          );

          if (blob) {
            const result = await detectSign(blob);
            
            if (result === "QUOTA_HIT") {
              quotaBackoffRef.current = true;
              setError(UI_STRINGS.ERROR_QUOTA);
              setScanStatus("ضغط كبير (Pause)");
              nextDelay = 10000; 
              setTimeout(() => { quotaBackoffRef.current = false; setError(null); }, 10000);
            } else if (result && result !== "..." && result !== "" && result !== "SILENCE") {
              setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'model' && lastMsg.text.endsWith(result)) return prev;
                if (lastMsg?.type === 'sign' && lastMsg.role === 'model') {
                   return [...prev.slice(0, -1), { ...lastMsg, text: lastMsg.text + " " + result }];
                }
                return [...prev, { id: Date.now().toString(), role: 'model', text: result, type: 'sign' }];
              });
              nextDelay = 2000; 
            } else {
              nextDelay = 1000; 
            }
          }
          setIsProcessing(false);
        } else {
          setScanStatus(quotaBackoffRef.current ? "راجعة..." : "تحرك باش نفهمك"); 
          nextDelay = 500;
        }
      }
    } catch (e) {
      console.error("Detection error:", e);
      setIsProcessing(false);
    }

    if (isLoopActive.current) {
      detectionTimeoutRef.current = setTimeout(loopSignRecognition, nextDelay);
    }
  };

  const stopAll = useCallback(() => {
    isLoopActive.current = false;
    setIsActive(false);
    setIsProcessing(false);
    setLiveTranscript("");
    isSpeakingRef.current = false;
    quotaBackoffRef.current = false;
    setVolumeLevel(0);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    
    if (audioContextRef.current) {
      const ctx = audioContextRef.current;
      audioContextRef.current = null;
      if (ctx.state !== 'closed') ctx.close().catch(() => {});
    }

    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
  }, []);

  const startRecordingSegment = () => {
    if (!isLoopActive.current) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      try {
        mediaRecorderRef.current.start();
        
        if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
        maxDurationTimerRef.current = setTimeout(() => {
          if (isLoopActive.current && isSpeakingRef.current) {
            stopRecordingAndTranscribe();
          }
        }, 10000);
        
      } catch (e) { console.error("Recorder start failed", e); }
    }
  };

  const stopRecordingAndTranscribe = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const startSpeechMode = async () => {
    try {
      stopAll(); 
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      isLoopActive.current = true;
      setIsActive(true);

      const audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;
      
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      source.connect(analyser);

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (!isLoopActive.current) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        
        if (audioBlob.size < 500) { 
           if (isLoopActive.current) startRecordingSegment();
           return;
        }

        setIsProcessing(true);
        setLiveTranscript("قاعد نحلل في الصوت...");
        
        try {
          const text = await transcribeAudio(audioBlob);
          if (text) {
             await handleSpeechResult(text);
          }
          if (isLoopActive.current) startRecordingSegment();
        } catch (e: any) {
           console.error(e);
           if (e.message?.includes("ASR_TIMEOUT")) {
             setError("الموديل رزين برشة، عاود جرب.");
           }
           if (isLoopActive.current) startRecordingSegment();
        } finally {
          setIsProcessing(false);
        }
      };

      startRecordingSegment(); 
      
      const checkVolume = () => {
        if (!isLoopActive.current || !audioContextRef.current) return;
        
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / bufferLength;
        
        setVolumeLevel(Math.min(100, average * 3));

        if (average > 5) { 
          isSpeakingRef.current = true;
          setLiveTranscript("نسمع فيك...");
          if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
        } else {
          if (isSpeakingRef.current && !silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              isSpeakingRef.current = false;
              setLiveTranscript("...");
              stopRecordingAndTranscribe();
            }, 1000); 
          }
        }
        requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      console.error(e);
      setError(UI_STRINGS.ERROR_MIC);
      stopAll();
    }
  };

  const startSignMode = async () => {
    try {
      stopAll(); 
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      isLoopActive.current = true;
      setIsActive(true);
      
      loopSignRecognition();
    } catch (e) { setError(UI_STRINGS.ERROR_CAM); }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />
      
      <main className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <section className="xl:col-span-7 flex flex-col space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="bg-white rounded-[60px] shadow-2xl overflow-hidden flex flex-col border border-white relative transition-all duration-500 hover:shadow-indigo-100/50">
            {/* Mode Toggle with Icons */}
            <div className="flex bg-slate-50/50 backdrop-blur p-2 gap-2 border-b">
              <button 
                onClick={() => { stopAll(); setMode('speech'); }}
                className={`flex-1 py-4 rounded-[25px] font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 ${mode === 'speech' ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
              >
                <div className={`p-2 rounded-full ${mode === 'speech' ? 'bg-white/20' : 'bg-slate-100'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <span>{UI_STRINGS.MODE_SPEECH_TO_SIGN}</span>
              </button>
              <button 
                onClick={() => { stopAll(); setMode('sign'); }}
                className={`flex-1 py-4 rounded-[25px] font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 ${mode === 'sign' ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
              >
                <div className={`p-2 rounded-full ${mode === 'sign' ? 'bg-white/20' : 'bg-slate-100'}`}>
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <span>{UI_STRINGS.MODE_SIGN_TO_TEXT}</span>
              </button>
            </div>

            <div className="h-[500px] relative bg-slate-50 overflow-hidden group">
              {mode === 'speech' ? (
                <>
                  <Avatar currentPose={currentPose} />
                  {isActive && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1 items-end h-8">
                       {[...Array(5)].map((_, i) => (
                         <div key={i} className="w-3 bg-indigo-500/50 rounded-full transition-all duration-75" 
                              style={{ height: `${Math.max(20, Math.min(100, volumeLevel * (1 + i * 0.2)))}%` }} />
                       ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black relative">
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
                  {!isActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md text-white p-4 text-center">
                      <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse border-4 border-white/10">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                      </div>
                      <p className="font-black text-2xl mb-2">{UI_STRINGS.START_CAMERA}</p>
                      <p className="text-white/70 text-lg">إضغط على الزر الأزرق لوطة</p>
                    </div>
                  )}
                </div>
              )}

              {isActive && (
                <div className="absolute top-8 right-8 z-20">
                   <div className={`flex items-center gap-3 px-6 py-3 rounded-full font-black shadow-2xl backdrop-blur-xl transition-all ${isProcessing ? 'bg-amber-100/90 text-amber-800' : 'bg-green-100/90 text-green-800'}`}>
                     <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-amber-600 animate-ping' : 'bg-green-600'}`} />
                     {mode === 'speech' ? (isProcessing ? UI_STRINGS.TRANSLATING : 'مستعد') : scanStatus}
                   </div>
                </div>
              )}
            </div>

            <div className="p-10 bg-white flex flex-col items-center space-y-8">
              <button
                onClick={isActive ? stopAll : (mode === 'speech' ? startSpeechMode : startSignMode)}
                className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.15)] border-[12px] border-slate-50 group ${
                  isActive ? 'bg-red-500 hover:rotate-90' : 'bg-indigo-600 hover:scale-110 active:scale-95'
                }`}
                aria-label={isActive ? "Stop" : "Start"}
              >
                {isActive && <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping"></div>}
                <div className={`transition-all duration-300 text-white ${isActive ? 'w-10 h-10 bg-white rounded-lg' : 'w-16 h-16'}`}>
                  {!isActive && (
                    mode === 'speech' ? (
                      <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                    ) : (
                      <svg fill="currentColor" viewBox="0 0 24 24" className="w-full h-full"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                    )
                  )}
                </div>
              </button>
              
              <div className="min-h-[5rem] flex items-center justify-center text-center px-8 w-full">
                {liveTranscript ? (
                  <p className="text-indigo-600 font-bold text-2xl bg-indigo-50/80 px-8 py-3 rounded-[30px] border-2 border-dashed border-indigo-200 animate-in zoom-in duration-300 italic">
                    "{liveTranscript}"
                  </p>
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <p className="text-slate-400 text-xl font-medium italic">
                      {isActive ? (mode === 'speech' ? UI_STRINGS.LISTENING_STATUS : UI_STRINGS.SIGNING_STATUS) : "إضغط على الزر الفوقاني لبدء التواصل"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {error && <div className="p-8 bg-red-50 border-2 border-red-100 text-red-700 rounded-[40px] text-center font-black shadow-xl animate-bounce text-xl flex items-center justify-center gap-3">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             {error}
          </div>}
        </section>

        <section className="xl:col-span-5 bg-white/70 backdrop-blur-3xl rounded-[60px] p-10 shadow-2xl flex flex-col h-[850px] border border-white/50 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="flex justify-between items-center mb-10 border-b pb-6">
            <h2 className="text-4xl font-black text-indigo-950 tracking-tight flex items-center gap-3">
              <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              المحادثة
            </h2>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-200"></div>
              <div className="w-5 h-5 rounded-full bg-slate-100"></div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-8 px-2 no-scrollbar">
            {messages.length === 0 && (
              <div className="text-center text-slate-300 py-48 flex flex-col items-center opacity-40">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-10 border-4 border-slate-100">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-5.062C3.583 13.587 3 12.016 3 10.47c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <p className="text-2xl px-16 leading-relaxed font-black">{UI_STRINGS.WELCOME_MSG}</p>
              </div>
            )}
            
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6 duration-500`}>
                <div className={`max-w-[85%] p-7 rounded-[40px] shadow-lg transition-all hover:scale-[1.02] ${
                  m.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  <div className="text-xs font-black opacity-60 mb-2 flex items-center gap-2 uppercase tracking-widest">
                    <span>{m.type === 'speech' ? "🔊 مسموع" : "🤟 إشارة"}</span>
                  </div>
                  <p className="text-2xl font-bold leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-indigo-50/80 p-6 rounded-[35px] flex items-center gap-5 border border-indigo-100">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-lg font-black text-indigo-900">{mode === 'sign' ? scanStatus : UI_STRINGS.TRANSLATING}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Translator;
