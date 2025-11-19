import React, { useState, useRef } from 'react';
import { Camera, Type as TypeIcon, X, Loader2, Upload, Sparkles } from 'lucide-react';
import { analyzeMeal } from '../services/geminiService';
import { MealType, AnalysisResult } from '../types';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (mealData: AnalysisResult, type: MealType, image?: string) => void;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [mode, setMode] = useState<'text' | 'camera'>('camera');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>(MealType.Lunch);
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
      setError("Please provide an image or description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeMeal(inputText, selectedImage || undefined);
      onAdd(result, mealType, selectedImage || undefined);
      // Reset and close
      setInputText('');
      setSelectedImage(null);
      onClose();
    } catch (e) {
      setError("Failed to analyze meal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">Log a Meal</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          {/* Meal Type Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {Object.values(MealType).map((t) => (
              <button
                key={t}
                onClick={() => setMealType(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  mealType === t 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Mode Toggles */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('camera')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'camera' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'
              }`}
            >
              <Camera size={18} /> Photo
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'text' ? 'bg-white shadow text-emerald-600' : 'text-slate-500'
              }`}
            >
              <TypeIcon size={18} /> Text
            </button>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            {mode === 'camera' && (
              <div className="space-y-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative ${
                    selectedImage ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
                  }`}
                >
                  {selectedImage ? (
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="bg-emerald-100 p-4 rounded-full mb-3">
                        <Upload className="text-emerald-600 w-6 h-6" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Tap to capture or upload</p>
                      <p className="text-xs text-slate-400 mt-1">Supports JPEG, PNG, WEBP</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    // 'capture' attribute prompts native camera on mobile devices
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
                {mode === 'camera' ? 'Add a note (optional)' : 'Describe your meal'}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={mode === 'camera' ? "e.g. 'I didn't eat the fries'" : "e.g. Grilled chicken breast with quinoa and steamed broccoli"}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none text-sm"
                rows={3}
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
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                AI is analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Analyze & Log
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddMealModal;