
import React, { useState } from 'react';
import { X, Sparkles, Loader2, ChefHat, Clock, Flame, List, CheckCircle } from 'lucide-react';
import { generateRecipe } from '../services/geminiService';
import { Recipe } from '../types';

interface RecipeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecipeGeneratorModal: React.FC<RecipeGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    
    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const result = await generateRecipe(ingredients);
      setRecipe(result);
    } catch (e) {
      setError("Couldn't generate a recipe. Please try different ingredients.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-2 text-emerald-600">
            <ChefHat size={24} />
            <h2 className="text-lg font-bold text-slate-800">Meal Planner AI</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {!recipe ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                 <h3 className="text-xl font-bold text-slate-800">What's in your fridge?</h3>
                 <p className="text-slate-500 text-sm">Enter ingredients you have or what you're craving, and I'll design a balanced meal for you.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Your Ingredients / Ideas</label>
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="e.g., Chicken breast, spinach, rice, lemon..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none text-base shadow-sm"
                  rows={4}
                />
              </div>

              {error && (
                 <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                    {error}
                 </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !ingredients.trim()}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  loading || !ingredients.trim()
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Creating Recipe...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Suggest a Meal
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Recipe Title Header */}
              <div>
                 <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-2">{recipe.title}</h2>
                 <p className="text-slate-500 leading-relaxed">{recipe.description}</p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg font-medium">
                  <Flame size={16} />
                  {recipe.estimatedCalories} kcal
                </div>
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
                  <Clock size={16} />
                  {recipe.cookingTime}
                </div>
              </div>
              
              {/* Macros Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <div className="text-xs text-slate-400 uppercase font-bold">Protein</div>
                  <div className="font-semibold text-slate-700">{recipe.macros.protein}g</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <div className="text-xs text-slate-400 uppercase font-bold">Carbs</div>
                  <div className="font-semibold text-slate-700">{recipe.macros.carbs}g</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <div className="text-xs text-slate-400 uppercase font-bold">Fat</div>
                  <div className="font-semibold text-slate-700">{recipe.macros.fat}g</div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Ingredients */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                   <List size={18} className="text-emerald-500"/> Ingredients
                </h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                       <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
                       {ing}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                   <CheckCircle size={18} className="text-emerald-500"/> Instructions
                </h3>
                <div className="space-y-4">
                  {recipe.instructions.map((inst, i) => (
                    <div key={i} className="flex gap-3 text-slate-600 text-sm">
                       <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-xs">
                         {i + 1}
                       </span>
                       <p className="pt-0.5">{inst}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                 onClick={() => setRecipe(null)}
                 className="w-full py-3 mt-4 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                 Start Over
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RecipeGeneratorModal;
