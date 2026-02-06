
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { UI_STRINGS, DEFAULT_POSE } from './constants';
import { ChatMessage, SignPose, SignAction } from './types';
import Avatar from './components/Avatar';
import { translateToSigns } from './services/gemini';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPose, setCurrentPose] = useState<SignPose>(DEFAULT_POSE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const transcriptionBuffer = useRef<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const animationQueue = useRef<SignAction[]>([]);
  const isAnimating = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveTranscript, isProcessing]);

  const processAnimationQueue = useCallback(async () => {
    if (isAnimating.current || animationQueue.current.length === 0) return;
    
    isAnimating.current = true;
    while (animationQueue.current.length > 0) {
      const action = animationQueue.current.shift();
      if (action) {
        setCurrentPose(action.pose);
        await new Promise(resolve => setTimeout(resolve, action.duration));
      }
    }
    setCurrentPose(DEFAULT_POSE);
    isAnimating.current = false;
  }, []);

  const handleSpeechResult = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || cleanText.length < 2) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: cleanText }]);
    setLiveTranscript("");
    setIsProcessing(true);
    
    try {
      const signs = await translateToSigns(cleanText);
      if (signs && signs.length > 0) {
        // Clear queue if new speech arrives to stay relevant? 
        // For now, append for multi-sentence support
        animationQueue.current = [...animationQueue.current, ...signs];
        processAnimationQueue();
      }
    } catch (e) {
      console.error("Sign translation failed", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopListening = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    setIsRecording(false);
    setConnectionStatus("");
    setLiveTranscript("");
    transcriptionBuffer.current = "";
  };

  const startListening = async () => {
    try {
      setError(null);
      setConnectionStatus("قاعد نتصل...");
      transcriptionBuffer.current = "";
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setConnectionStatus(UI_STRINGS.LISTENING_STATUS);
            setIsRecording(true);
            
            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(() => {});
            };
            
            source.connect(processor);
            processor.connect(audioCtx.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              transcriptionBuffer.current += text;
              setLiveTranscript(transcriptionBuffer.current);
            }

            if (message.serverContent?.turnComplete) {
              const fullText = transcriptionBuffer.current;
              transcriptionBuffer.current = "";
              if (fullText.trim()) {
                handleSpeechResult(fullText);
              }
            }
          },
          onerror: (e) => {
            console.error("Live API Error", e);
            setError(UI_STRINGS.ERROR_MIC);
            stopListening();
          },
          onclose: () => {
            setIsRecording(false);
            setConnectionStatus("");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          systemInstruction: "You are a specialized Tunisian Darija speech-to-text engine. Output accurate transcriptions of Tunisian dialect. Ignore background noise. No audio output."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Start listening error", err);
      setError(UI_STRINGS.ERROR_MIC);
      setConnectionStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-2xl mb-8 text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-2 flex items-center justify-center gap-2">
          <span>{UI_STRINGS.APP_TITLE}</span>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </h1>
        <p className="text-slate-500 text-lg">{UI_STRINGS.APP_SUBTITLE}</p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <section className="flex flex-col space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-indigo-50 flex-1 flex flex-col min-h-[450px]">
            <h2 className="text-xl font-bold mb-4 text-indigo-900 text-right">لغة الإشارة التونسية</h2>
            
            <Avatar currentPose={currentPose} />
            
            <div className="mt-8 flex flex-col items-center space-y-4">
              {isRecording && (
                <div className="flex gap-1 h-8 items-center">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-indigo-500 rounded-full animate-pulse" 
                      style={{ height: `${25 + Math.random() * 65}%`, animationDelay: `${i * 0.12}s` }}
                    ></div>
                  ))}
                </div>
              )}

              <button
                onClick={isRecording ? stopListening : startListening}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-50`}
              >
                {isRecording ? (
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              
              <div className="text-center w-full px-4">
                <p className={`text-lg font-bold ${isRecording ? 'text-red-500' : 'text-indigo-600'}`}>
                  {connectionStatus || UI_STRINGS.START_LISTENING}
                </p>
                {liveTranscript && (
                  <div className="mt-2 text-indigo-500 italic text-sm p-3 bg-indigo-50 rounded-xl animate-pulse inline-block max-w-full border border-indigo-100">
                    "{liveTranscript}"
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center font-bold">
              {error}
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-2xl border border-indigo-50 flex flex-col h-[650px]">
          <h2 className="text-xl font-bold mb-4 text-indigo-900 text-right border-b pb-2">المحادثة</h2>
          
          <div className="flex-1 overflow-y-auto space-y-4 px-2 py-4 scroll-smooth custom-scrollbar">
            {messages.length === 0 && !isProcessing && (
              <div className="text-center text-slate-400 py-24 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-base px-8 leading-relaxed">{UI_STRINGS.WELCOME_MSG}</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}>
                  <p className="text-base leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-indigo-50 text-indigo-700 p-4 rounded-3xl rounded-tl-none flex items-center gap-3 border border-indigo-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  </div>
                  <span className="text-sm font-bold">{UI_STRINGS.TRANSLATING}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </section>
      </main>

      <footer className="mt-12 text-center text-slate-400 text-xs py-6 border-t w-full max-w-5xl">
        <p className="font-medium">تواصل - أول تطبيق تونسي لترجمة لغة الإشارة</p>
        <p className="mt-1 opacity-60">صُنع لخدمة الإدماج والتواصل الفعّال</p>
      </footer>
    </div>
  );
};

export default App;
