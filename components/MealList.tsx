import React from 'react';
import { MealEntry } from '../types';
import { Clock, Info, Leaf, TrendingUp } from 'lucide-react';

interface MealListProps {
  meals: MealEntry[];
  onDelete: (id: string) => void;
}

const MealList: React.FC<MealListProps> = ({ meals, onDelete }) => {
  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <Leaf className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-600 font-medium mb-1">No meals logged today</h3>
        <p className="text-slate-400 text-sm">Tap the + button to track your nutrition.</p>
      </div>
    );
  }

  // Sort meals by timestamp (newest first)
  const sortedMeals = [...meals].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4 pb-24">
      {sortedMeals.map((meal) => (
        <div key={meal.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 group">
          
          {/* Header: Type & Time */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide">
                {meal.type}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={12} />
                {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button 
              onClick={() => onDelete(meal.id)}
              className="text-slate-300 hover:text-red-400 text-xs transition-colors"
            >
              Remove
            </button>
          </div>

          <div className="flex gap-4">
            {/* Optional Image */}
            {meal.imageUrl && (
              <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                <img src={meal.imageUrl} alt={meal.foodName} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1 truncate">{meal.foodName}</h4>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{meal.description}</p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-slate-50 rounded-lg p-2 text-center">
                   <div className="text-xs text-slate-400 font-medium">Kcal</div>
                   <div className="font-bold text-slate-700">{meal.nutrition.calories}</div>
                </div>
                 <div className="bg-slate-50 rounded-lg p-2 text-center">
                   <div className="text-xs text-slate-400 font-medium">Prot</div>
                   <div className="font-bold text-slate-700">{meal.nutrition.protein}</div>
                </div>
                 <div className="bg-slate-50 rounded-lg p-2 text-center">
                   <div className="text-xs text-slate-400 font-medium">Carb</div>
                   <div className="font-bold text-slate-700">{meal.nutrition.carbs}</div>
                </div>
                 <div className="bg-slate-50 rounded-lg p-2 text-center">
                   <div className="text-xs text-slate-400 font-medium">Fat</div>
                   <div className="font-bold text-slate-700">{meal.nutrition.fat}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Suggestion Box */}
          <div className="mt-2 bg-indigo-50 rounded-xl p-3 border border-indigo-100 flex gap-3 items-start">
             <div className="bg-indigo-100 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                <TrendingUp size={14} className="text-indigo-600" />
             </div>
             <div>
                <p className="text-xs font-semibold text-indigo-800 mb-0.5 uppercase tracking-wide">AI Suggestion</p>
                <p className="text-sm text-indigo-700 leading-relaxed">
                  {meal.suggestions}
                </p>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MealList;