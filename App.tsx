
import React, { useState, useEffect } from 'react';
import DashboardStats from './components/DashboardStats';
import MealList from './components/MealList';
import AddMealModal from './components/AddMealModal';
import RecipeGeneratorModal from './components/RecipeGeneratorModal';
import { MealEntry, MealType, AnalysisResult } from './types';
import { Plus, ChefHat, Lightbulb } from 'lucide-react';

const App: React.FC = () => {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedMeals = localStorage.getItem('nutri_meals');
    if (storedMeals) {
      try {
        setMeals(JSON.parse(storedMeals));
      } catch (e) {
        console.error("Failed to parse stored meals", e);
      }
    }
    setMounted(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('nutri_meals', JSON.stringify(meals));
    }
  }, [meals, mounted]);

  const handleAddMeal = (result: AnalysisResult, type: MealType, image?: string) => {
    const newMeal: MealEntry = {
      ...result,
      id: crypto.randomUUID(),
      type,
      imageUrl: image,
      timestamp: Date.now(),
    };
    setMeals(prev => [...prev, newMeal]);
  };

  const handleDeleteMeal = (id: string) => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
      setMeals(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative">
      
      {/* Top Navigation / Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-lg shadow-emerald-200">
              <ChefHat size={24} />
            </div>
            <div>
               <h1 className="text-xl font-bold text-slate-900 tracking-tight">NutriBalance</h1>
               <p className="text-xs text-slate-500 font-medium">AI Powered Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Meal Ideas Button */}
            <button 
              onClick={() => setIsRecipeModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Lightbulb size={16} />
              <span className="hidden sm:inline">Meal Ideas</span>
            </button>

            <div className="text-right hidden sm:block border-l border-slate-200 pl-3">
               <p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric'})}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Dashboard Stats */}
        <section>
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-slate-800">Today's Overview</h2>
           </div>
           <DashboardStats meals={meals} />
        </section>

        {/* Recent Meals */}
        <section>
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-slate-800">Meal History</h2>
             <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{meals.length} meals</span>
           </div>
           <MealList meals={meals} onDelete={handleDeleteMeal} />
        </section>

      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-emerald-300 transition-transform hover:scale-105 active:scale-95"
          aria-label="Add Meal"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Modals */}
      <AddMealModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddMeal} 
      />

      <RecipeGeneratorModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
      />
      
    </div>
  );
};

export default App;
