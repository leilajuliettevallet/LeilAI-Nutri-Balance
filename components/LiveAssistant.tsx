
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, MicOff, X, Activity, Volume2 } from 'lucide-react';

interface LiveAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking' | 'error'>('connecting');
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Refs for audio handling to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      stopSession();
    }
    return () => stopSession();
  }, [isOpen]);

  const startSession = async () => {
    setStatus('connecting');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are a friendly and knowledgeable nutrition and fitness expert. Your philosophy focuses on whole foods and natural nutrition rather than supplements. You provide advice on healthy eating and exercise routines suitable for home or the gym. Keep responses concise, motivating, and conversational. Do not use markdown formatting in your speech.",
        },
      };

      const sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setStatus('listening');
            
            // Setup Input Processing
            if (!inputAudioContextRef.current || !streamRef.current) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (isMuted) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple volume visualization
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolumeLevel(Math.min(100, rms * 500)); // Scale for UI

              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio && audioContextRef.current) {
              setStatus('speaking');
              
              // Reset nextStartTime if we fell behind
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                audioContextRef.current,
                24000,
                1
              );

              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                  setStatus('listening');
                }
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(src => src.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus('listening');
            }
          },
          onclose: () => {
            setIsConnected(false);
            setStatus('connecting');
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setStatus('error');
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to start session:", error);
      setStatus('error');
    }
  };

  const stopSession = () => {
    // Stop microphone
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Stop processing
    if (scriptProcessorRef.current && inputAudioContextRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    // Stop playing audio
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();

    // Close contexts
    inputAudioContextRef.current?.close();
    audioContextRef.current?.close();

    setIsConnected(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-8 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-12 text-white/50">
          <div className="flex items-center gap-2">
            <Activity size={18} className={isConnected ? "text-emerald-400" : "text-slate-500"} />
            <span className="text-sm font-medium tracking-wider">
              {status === 'connecting' && 'CONNECTING...'}
              {status === 'listening' && 'LISTENING'}
              {status === 'speaking' && 'SPEAKING'}
              {status === 'error' && 'CONNECTION ERROR'}
            </span>
          </div>
          <button onClick={onClose} className="hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Main Visualizer */}
        <div className="relative mb-12">
          {/* Pulse Rings */}
          <div className={`absolute inset-0 rounded-full bg-emerald-500/20 blur-xl transition-all duration-100 ${
            status === 'speaking' ? 'scale-150 opacity-100' : 'scale-100 opacity-0'
          }`} />
          
          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
             status === 'speaking' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 
             status === 'error' ? 'bg-red-500' : 'bg-white'
          }`}>
             {status === 'speaking' ? (
               <Volume2 size={48} className="text-white animate-pulse" />
             ) : (
               <div className="relative">
                  <Mic size={48} className={status === 'error' ? "text-white" : "text-slate-800"} />
                  {/* Simple volume ring for user input */}
                  {!isMuted && status === 'listening' && (
                    <div 
                      className="absolute inset-0 rounded-full border-4 border-emerald-500 opacity-50 transition-transform duration-75"
                      style={{ transform: `scale(${1 + volumeLevel / 50})` }}
                    />
                  )}
               </div>
             )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl font-bold text-white">
            {status === 'error' ? 'Something went wrong' : 'Nutrition Coach'}
          </h2>
          <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">
            {status === 'error' 
              ? "Please check your connection and try again." 
              : "Ask about meal plans, workout routines, or healthy habits."}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${
              isMuted 
                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button 
            onClick={onClose}
            className="px-8 py-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors shadow-lg shadow-red-900/20"
          >
            End Session
          </button>
        </div>

      </div>
    </div>
  );
};

// Audio Helper Functions

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp and convert to 16-bit PCM
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default LiveAssistant;
