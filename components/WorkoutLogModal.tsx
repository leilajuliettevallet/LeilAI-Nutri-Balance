
import React, { useState, useRef } from 'react';
import { Camera, Type as TypeIcon, X, Loader2, Upload, Dumbbell } from 'lucide-react';
import { analyzeWorkout } from '../services/geminiService';
import { WorkoutAnalysis } from '../types';

interface WorkoutLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { copy_paste_report: string; structured_summary: WorkoutAnalysis }, image?: string, rawInput?: string) => void;
}

const WorkoutLogModal: React.FC<WorkoutLogModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [mode, setMode] = useState<'text' | 'camera'>('camera');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText && !selectedImage) {
      setError("Please provide an image of your log or a description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const draftExercises = [{
        id: crypto.randomUUID(),
        text: inputText || "Workout Log",
        image: selectedImage || undefined,
        timestamp: Date.now()
      }];
      
      const result = await analyzeWorkout(draftExercises);
      onAdd(result, selectedImage || undefined, inputText);
      // Reset and close
      setInputText('');
      setSelectedImage(null);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Failed to analyze workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 text-blue-600">
             <Dumbbell size={20} />
             <h2 className="text-lg font-bold text-slate-800">Log Workout</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          {/* Mode Toggles */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('camera')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'camera' ? 'bg-white shadow text-blue-600' : 'text-slate-500'
              }`}
            >
              <Camera size={18} /> Photo Log
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'text' ? 'bg-white shadow text-blue-600' : 'text-slate-500'
              }`}
            >
              <TypeIcon size={18} /> Text Desc
            </button>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            {mode === 'camera' && (
              <div className="space-y-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative ${
                    selectedImage ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                  }`}
                >
                  {selectedImage ? (
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="bg-blue-100 p-4 rounded-full mb-3">
                        <Upload className="text-blue-600 w-6 h-6" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Tap to upload gym log</p>
                      <p className="text-xs text-slate-400 mt-1">Snap a picture of your notebook or screen</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    capture="environment" 
                  />
                </div>
                {selectedImage && (
                   <button 
                     onClick={() => { setSelectedImage(null); fileInputRef.current!.value = ''; }}
                     className="text-xs text-red-500 font-medium hover:underline w-full text-center"
                   >
                     Remove Image
                   </button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {mode === 'camera' ? 'Additional Notes (Optional)' : 'Workout Details'}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'camera' ? "e.g. 'I felt tired today'" : "e.g. Bench Press 3x10 @ 60kg, Squats 3x5 @ 100kg..."}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none text-sm"
                rows={4}
              />
            </div>
          </div>

          {error && (
             <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
             </div>
          )}

        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleAnalyze}
            disabled={loading || (!inputText && !selectedImage)}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              loading || (!inputText && !selectedImage)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyzing Session...
              </>
            ) : (
              <>
                <Dumbbell size={18} />
                Save Workout
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default WorkoutLogModal;
