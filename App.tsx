
import React, { useState, useEffect } from 'react';
import DashboardStats from './components/DashboardStats';
import MealList from './components/MealList';
import AddMealModal from './components/AddMealModal';
import RecipeGeneratorModal from './components/RecipeGeneratorModal';
import LiveAssistant from './components/LiveAssistant';
import ActiveWorkoutModal from './components/ActiveWorkoutModal';
import WorkoutList from './components/WorkoutList';
import { MealEntry, MealType, AnalysisResult, WorkoutEntry, WorkoutAnalysis, DraftExercise } from './types';
import { Plus, ChefHat, Lightbulb, Mic, Utensils, Dumbbell } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'nutrition' | 'fitness'>('nutrition');
  
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  
  const [mounted, setMounted] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedMeals = localStorage.getItem('nutri_meals');
    const storedWorkouts = localStorage.getItem('nutri_workouts');
    
    if (storedMeals) {
      try {
        setMeals(JSON.parse(storedMeals));
      } catch (e) {
        console.error("Failed to parse stored meals", e);
      }
    }
    if (storedWorkouts) {
      try {
        setWorkouts(JSON.parse(storedWorkouts));
      } catch (e) {
        console.error("Failed to parse stored workouts", e);
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

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('nutri_workouts', JSON.stringify(workouts));
    }
  }, [workouts, mounted]);

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

  const handleFinishWorkout = (data: { copy_paste_report: string; structured_summary: WorkoutAnalysis }, exercises: DraftExercise[]) => {
    const newWorkout: WorkoutEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      copy_paste_report: data.copy_paste_report,
      structured_summary: data.structured_summary,
      // For the list view image, we use the first image found in the session if available
      imageUrl: exercises.find(e => e.image)?.image,
      // Combine all draft texts for a raw summary
      rawInput: exercises.map(e => e.text).join('\n')
    };
    setWorkouts(prev => [newWorkout, ...prev]);
  };

  const handleDeleteWorkout = (id: string) => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      setWorkouts(prev => prev.filter(w => w.id !== id));
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
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Talk Button */}
            <button 
              onClick={() => setIsLiveOpen(true)}
              className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors border border-rose-100"
            >
              <Mic size={16} />
              <span className="hidden sm:inline">Coach</span>
            </button>

            {/* Meal Ideas Button */}
            <button 
              onClick={() => setIsRecipeModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors border border-indigo-100"
            >
              <Lightbulb size={16} />
              <span className="hidden sm:inline">Ideas</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-200/50 rounded-2xl">
           <button
             onClick={() => setActiveTab('nutrition')}
             className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
               activeTab === 'nutrition' 
                 ? 'bg-white text-slate-800 shadow-sm' 
                 : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <Utensils size={16} /> Nutrition
           </button>
           <button
             onClick={() => setActiveTab('fitness')}
             className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
               activeTab === 'fitness' 
                 ? 'bg-white text-slate-800 shadow-sm' 
                 : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             <Dumbbell size={16} /> Fitness
           </button>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
          {activeTab === 'nutrition' ? (
            <>
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
            </>
          ) : (
            <>
              {/* Workouts Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 mb-6">
                 <h2 className="text-2xl font-bold mb-1">FlowSet Log</h2>
                 <p className="text-blue-100 text-sm">Track your progress, get AI analysis, and recover smarter.</p>
                 <div className="mt-4 flex gap-4">
                    <div>
                       <div className="text-2xl font-bold">{workouts.length}</div>
                       <div className="text-xs text-blue-200 uppercase font-medium">Sessions</div>
                    </div>
                    <div className="w-px bg-blue-500/50"></div>
                    <div>
                       <div className="text-2xl font-bold">{workouts.reduce((acc, w) => acc + w.structured_summary.overview.total_duration_minutes, 0)}</div>
                       <div className="text-xs text-blue-200 uppercase font-medium">Minutes</div>
                    </div>
                 </div>
              </div>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800">Recent Sessions</h2>
                </div>
                <WorkoutList workouts={workouts} onDelete={handleDeleteWorkout} />
              </section>
            </>
          )}
        </div>

      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => activeTab === 'nutrition' ? setIsMealModalOpen(true) : setIsWorkoutModalOpen(true)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95 text-white ${
            activeTab === 'nutrition' 
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-300' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-300'
          }`}
          aria-label={activeTab === 'nutrition' ? 'Add Meal' : 'Log Workout'}
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Modals */}
      <AddMealModal 
        isOpen={isMealModalOpen} 
        onClose={() => setIsMealModalOpen(false)} 
        onAdd={handleAddMeal} 
      />

      <ActiveWorkoutModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        onFinish={handleFinishWorkout}
      />

      <RecipeGeneratorModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
      />

      <LiveAssistant
        isOpen={isLiveOpen}
        onClose={() => setIsLiveOpen(false)}
      />
      
    </div>
  );
};

export default App;
