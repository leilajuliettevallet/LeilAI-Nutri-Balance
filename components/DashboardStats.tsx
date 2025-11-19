import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MealEntry, DailyGoal } from '../types';
import { Activity, Flame, Droplet, Wheat } from 'lucide-react';

interface DashboardStatsProps {
  meals: MealEntry[];
}

const DEFAULT_GOAL: DailyGoal = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 70
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ meals }) => {
  // Calculate totals
  const totals = meals.reduce((acc, meal) => {
    return {
      calories: acc.calories + meal.nutrition.calories,
      protein: acc.protein + meal.nutrition.protein,
      carbs: acc.carbs + meal.nutrition.carbs,
      fat: acc.fat + meal.nutrition.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const data = [
    { name: 'Protein', value: totals.protein, color: '#10b981' }, // Emerald 500
    { name: 'Carbs', value: totals.carbs, color: '#3b82f6' },    // Blue 500
    { name: 'Fat', value: totals.fat, color: '#f59e0b' },       // Amber 500
  ];

  const caloriesPercent = Math.min(100, Math.round((totals.calories / DEFAULT_GOAL.calories) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Calorie Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Daily Calories</h3>
          <Flame className="text-orange-500 w-5 h-5" />
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-slate-800">{Math.round(totals.calories)}</span>
          <span className="text-slate-400 mb-1">/ {DEFAULT_GOAL.calories} kcal</span>
        </div>
        <div className="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${caloriesPercent > 100 ? 'bg-red-500' : 'bg-emerald-500'}`} 
            style={{ width: `${caloriesPercent}%` }}
          />
        </div>
      </div>

      {/* Macros Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
         <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-2">Macro Balance</h3>
         <div className="flex flex-row items-center h-32">
            <div className="flex-1 h-full">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600"><Activity size={14} className="text-emerald-500"/> Protein</span>
                <span className="font-semibold text-slate-800">{Math.round(totals.protein)}g</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-600"><Wheat size={14} className="text-blue-500"/> Carbs</span>
                <span className="font-semibold text-slate-800">{Math.round(totals.carbs)}g</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="flex items-center gap-1 text-slate-600"><Droplet size={14} className="text-amber-500"/> Fats</span>
                 <span className="font-semibold text-slate-800">{Math.round(totals.fat)}g</span>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DashboardStats;