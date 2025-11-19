
import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Mic, MicOff, Send, Trash2, Camera, Dumbbell, Play, Square, Plus } from 'lucide-react';
import { analyzeWorkout } from '../services/geminiService';
import { WorkoutAnalysis, DraftExercise } from '../types';

interface ActiveWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (data: { copy_paste_report: string; structured_summary: WorkoutAnalysis }, exercises: DraftExercise[]) => void;
}

const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({ isOpen, onClose, onFinish }) => {
  // Session State
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [startTime] = useState(Date.now());
  
  // Input State
  const [inputMode, setInputMode] = useState<'voice' | 'text' | 'camera'>('voice');
  const [inputText, setInputText] = useState('');
  const [inputImage, setInputImage] = useState<string | null>(null);
  
  // Processing State
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Speech Recognition Ref
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
            setInputText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
        setExercises([]);
        setInputText('');
        setInputImage(null);
        setInputMode('voice');
    }
  }, [isOpen]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setInputText(''); // Clear previous text when starting new recording to avoid duplication if needed
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleAddExercise = () => {
    if (!inputText.trim() && !inputImage) return;

    const newExercise: DraftExercise = {
      id: crypto.randomUUID(),
      text: inputText,
      image: inputImage || undefined,
      timestamp: Date.now()
    };

    setExercises([...exercises, newExercise]);
    setInputText('');
    setInputImage(null);
    // Keep current mode or reset? Keeping current mode is usually better for flow.
  };

  const handleFinishSession = async () => {
    if (exercises.length === 0) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeWorkout(exercises);
      onFinish(result, exercises);
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to analyze session. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:rounded-3xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <Dumbbell className={isAnalyzing ? "animate-bounce" : ""} size={20} />
             </div>
             <div>
                 <h2 className="text-lg font-bold text-slate-800">Live Session</h2>
                 <p className="text-xs text-slate-400 font-medium">Started {new Date(startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            {exercises.length > 0 && (
              <button 
                onClick={handleFinishSession}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide rounded-full transition-all flex items-center gap-2"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={14}/> : "Finish"}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content: List of Exercises */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 custom-scrollbar pb-48 sm:pb-4">
           {exercises.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-60 py-12">
                <Dumbbell size={48} strokeWidth={1.5} />
                <p className="text-center max-w-xs">Your session log is empty.<br/>Tap the mic or add text to log your first exercise.</p>
             </div>
           ) : (
             <div className="space-y-3">
                {exercises.map((ex, idx) => (
                  <div key={ex.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                     <div className="bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                       {idx + 1}
                     </div>
                     <div className="flex-1 min-w-0">
                        {ex.text && <p className="text-slate-800 font-medium text-sm whitespace-pre-wrap">{ex.text}</p>}
                        {ex.image && (
                          <div className="mt-2 w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                             <img src={ex.image} alt="Exercise" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-2">{new Date(ex.timestamp).toLocaleTimeString()}</p>
                     </div>
                     <button 
                       onClick={() => setExercises(exercises.filter(e => e.id !== ex.id))}
                       className="text-slate-300 hover:text-red-400 self-start p-1"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Input Area (Sticky Bottom) */}
        <div className="bg-white border-t border-slate-200 p-4 pt-2 z-20 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
           
           {/* Mode Tabs */}
           <div className="flex gap-6 mb-3 justify-center">
              <button 
                onClick={() => setInputMode('voice')}
                className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${inputMode === 'voice' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Voice
              </button>
              <button 
                onClick={() => setInputMode('text')}
                className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${inputMode === 'text' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Text
              </button>
              <button 
                onClick={() => setInputMode('camera')}
                className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${inputMode === 'camera' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Camera
              </button>
            </div>

           {/* Input Controls */}
           <div className="flex flex-col gap-3">
              
              {/* Active Input Interface */}
              <div className="min-h-[80px] flex items-center justify-center">
                
                {/* Voice Mode */}
                {inputMode === 'voice' && (
                   <div className="w-full flex flex-col items-center gap-3">
                      <div className="flex items-center gap-4 w-full">
                        <button
                          onClick={toggleRecording}
                          className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${
                            isRecording 
                              ? 'bg-red-500 text-white animate-pulse shadow-red-300 scale-105' 
                              : 'bg-blue-600 text-white shadow-blue-200 hover:scale-105'
                          }`}
                        >
                          {isRecording ? <Square fill="currentColor" size={20} /> : <Mic size={24} />}
                        </button>
                        
                        <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-200 h-16 overflow-y-auto flex items-center text-slate-600 text-sm relative">
                           {inputText ? (
                             <>
                              <span className="mr-6">{inputText}</span>
                              <button onClick={() => setInputText('')} className="absolute top-2 right-2 text-slate-300 hover:text-slate-500"><X size={14}/></button>
                             </>
                           ) : (
                             <span className="text-slate-400 italic">{isRecording ? "Listening..." : "Tap mic to speak..."}</span>
                           )}
                        </div>

                        <button
                          onClick={handleAddExercise}
                          disabled={!inputText && !inputImage}
                          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            !inputText && !inputImage
                              ? 'bg-slate-100 text-slate-300'
                              : 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600'
                          }`}
                        >
                           <Send size={20} />
                        </button>
                      </div>
                   </div>
                )}

                {/* Text Mode */}
                {inputMode === 'text' && (
                   <div className="w-full flex gap-2 items-end">
                      <div className="relative flex-1">
                        <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="e.g. Bench Press 3x10 60kg..."
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none text-slate-800 placeholder:text-slate-400"
                          rows={3}
                          autoFocus
                        />
                      </div>
                      <button
                          onClick={handleAddExercise}
                          disabled={!inputText && !inputImage}
                          className={`mb-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            !inputText && !inputImage
                              ? 'bg-slate-100 text-slate-300'
                              : 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600'
                          }`}
                        >
                           <Send size={18} />
                      </button>
                   </div>
                )}

                {/* Camera Mode */}
                {inputMode === 'camera' && (
                  <div className="w-full flex flex-col gap-3">
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all gap-2 ${
                         inputImage ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'
                       }`}
                     >
                        {inputImage ? (
                          <div className="relative h-full w-full p-1 flex items-center justify-center">
                             <img src={inputImage} className="h-full object-contain rounded-lg" alt="Preview"/>
                             <button 
                                onClick={(e) => { e.stopPropagation(); setInputImage(null); if(fileInputRef.current) fileInputRef.current.value = '' }}
                                className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-red-500 shadow-sm"
                             >
                                <X size={14} />
                             </button>
                          </div>
                        ) : (
                          <>
                            <Camera className="text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">Tap to capture photo</span>
                          </>
                        )}
                        <input 
                          ref={fileInputRef} 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          className="hidden"
                          onChange={handleFileChange} 
                        />
                     </div>
                     
                     <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="What's in this photo? (e.g., 'Setup for squats, 100kg')"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none text-slate-800 placeholder:text-slate-400"
                        rows={2}
                     />

                     <button
                        onClick={handleAddExercise}
                        disabled={!inputImage && !inputText}
                        className={`w-full py-3 rounded-xl font-semibold shadow-md transition-colors ${
                           !inputImage && !inputText 
                           ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                           : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                     >
                        Save Photo Entry
                     </button>
                  </div>
                )}

              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ActiveWorkoutModal;
