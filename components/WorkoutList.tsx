
import React, { useState } from 'react';
import { WorkoutEntry } from '../types';
import { Calendar, MapPin, Clock, Activity, ChevronDown, ChevronUp, ClipboardCopy, Check, Award, Zap, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface WorkoutListProps {
  workouts: WorkoutEntry[];
  onDelete: (id: string) => void;
}

const WorkoutList: React.FC<WorkoutListProps> = ({ workouts, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (workouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <Activity className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-600 font-medium mb-1">No workouts logged yet</h3>
        <p className="text-slate-400 text-sm">Log your first session to get AI insights.</p>
      </div>
    );
  }

  const sortedWorkouts = [...workouts].sort((a, b) => b.timestamp - a.timestamp);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helpers for Charts
  const getMuscleData = (exercises: any[]) => {
    const counts: {[key: string]: number} = {};
    exercises.forEach(ex => {
       const muscle = ex.primary_muscle_group || 'Other';
       counts[muscle] = (counts[muscle] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  };

  const getVolumeData = (exercises: any[]) => {
     return exercises
       .filter(e => e.total_volume && e.total_volume > 0)
       .map(e => ({
         name: e.name.length > 12 ? e.name.substring(0,12)+'...' : e.name,
         full_name: e.name,
         volume: e.total_volume
       }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

  return (
    <div className="space-y-6 pb-24">
      {sortedWorkouts.map((workout) => {
        const { overview, exercises, highlights, expert_critique, smart_suggestions } = workout.structured_summary;
        const isExpanded = expandedId === workout.id;
        const muscleData = getMuscleData(exercises);
        const volumeData = getVolumeData(exercises);

        return (
          <div key={workout.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all">
            
            {/* Card Header / Summary */}
            <div 
              className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleExpand(workout.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                    {overview.main_focus}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                     <Calendar size={12} /> {overview.date}
                  </span>
                </div>
                <div className="text-slate-300 hover:text-red-400 text-xs" onClick={(e) => { e.stopPropagation(); onDelete(workout.id); }}>
                   Delete
                </div>
              </div>

              <div className="flex gap-4">
                {workout.imageUrl && (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    <img src={workout.imageUrl} alt="Workout Log" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                   <h3 className="font-bold text-slate-800 text-lg">{exercises.length} Exercises</h3>
                   <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={14} /> {overview.total_duration_minutes} min</span>
                      {overview.key_stats?.estimated_total_weight_lifted && (
                        <span className="flex items-center gap-1"><Activity size={14} /> {overview.key_stats.estimated_total_weight_lifted}kg Vol</span>
                      )}
                      <span className="flex items-center gap-1"><MapPin size={14} /> {overview.location}</span>
                   </div>
                </div>
                <div className="flex items-center justify-center w-8 text-slate-300">
                   {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>

            {/* Expanded Report View */}
            {isExpanded && (
              <div className="border-t border-slate-100 bg-slate-50/50 animate-in fade-in slide-in-from-top-2">
                
                {/* Action Bar */}
                <div className="px-5 py-3 flex justify-between items-center bg-white border-b border-slate-100">
                   <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                     <Brain size={16} className="text-indigo-500"/> AI Coach Analysis
                   </h4>
                   <button 
                     onClick={(e) => { e.stopPropagation(); copyToClipboard(workout.copy_paste_report, workout.id); }}
                     className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                   >
                     {copiedId === workout.id ? <Check size={14} /> : <ClipboardCopy size={14} />}
                     {copiedId === workout.id ? 'Copied!' : 'Copy Text'}
                   </button>
                </div>

                <div className="p-5 space-y-6">
                  
                  {/* Expert Critique Box */}
                  <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
                     <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-indigo-100 text-xs font-bold uppercase tracking-widest">
                           <Award size={16} /> Expert Insight
                        </div>
                        <p className="text-lg font-medium leading-relaxed text-white">
                           "{expert_critique || "Great session! Consistency is key."}"
                        </p>
                     </div>
                     <div className="absolute -right-4 -bottom-8 opacity-10 text-white">
                        <Award size={128} />
                     </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Muscle Split */}
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-4 text-center">Muscle Focus</h5>
                        <div className="h-48">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie
                                    data={muscleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                 >
                                    {muscleData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                 </Pie>
                                 <Tooltip contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                              </PieChart>
                           </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                           {muscleData.map((entry, index) => (
                              <div key={index} className="flex items-center gap-1 text-xs text-slate-500">
                                 <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                                 {entry.name}
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Volume Chart */}
                     {volumeData.length > 0 && (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                           <h5 className="text-xs font-bold text-slate-400 uppercase mb-4 text-center">Volume Load (kg)</h5>
                           <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={volumeData}>
                                    <XAxis dataKey="name" hide />
                                    <Tooltip 
                                       cursor={{fill: '#f1f5f9'}}
                                       contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                 </BarChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Detailed Exercise Log */}
                  <div>
                     <h5 className="text-slate-800 font-bold text-lg mb-3">Session Log</h5>
                     <div className="space-y-3">
                        {exercises.map((ex, i) => (
                           <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4">
                              <div className="flex-1">
                                 <div className="flex justify-between items-start">
                                    <h6 className="font-bold text-slate-700">{ex.name}</h6>
                                    <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase font-medium">{ex.primary_muscle_group}</span>
                                 </div>
                                 
                                 {/* Sets display */}
                                 <div className="mt-2 flex flex-wrap gap-2">
                                    {ex.reps_per_set?.map((reps, j) => (
                                       <div key={j} className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-sm font-mono text-slate-600">
                                          <span className="font-bold">{reps}</span>
                                          <span className="text-slate-400 text-xs ml-1">reps</span>
                                          {ex.weight_per_set?.[j] && (
                                             <>
                                                <span className="mx-1 text-slate-300">|</span>
                                                <span className="font-bold">{ex.weight_per_set[j]}</span>
                                                <span className="text-slate-400 text-xs ml-1">kg</span>
                                             </>
                                          )}
                                       </div>
                                    ))}
                                    {(!ex.reps_per_set || ex.reps_per_set.length === 0) && ex.duration_seconds && (
                                       <div className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-sm font-mono text-slate-600">
                                          {Math.floor(Number(ex.duration_seconds) / 60)}m {Number(ex.duration_seconds) % 60}s
                                       </div>
                                    )}
                                 </div>

                                 {/* Note */}
                                 {ex.notes_summary && (
                                    <p className="text-xs text-slate-400 mt-2 italic">"{ex.notes_summary}"</p>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Highlights & Suggestions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                        <h5 className="text-emerald-800 font-bold text-sm mb-2 flex items-center gap-2">
                           <Zap size={16}/> Highlights
                        </h5>
                        <ul className="space-y-2">
                           {highlights.map((h, i) => (
                              <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                                 <Check size={14} className="mt-1 flex-shrink-0 text-emerald-500"/>
                                 <span className="leading-tight">{h}</span>
                              </li>
                           ))}
                        </ul>
                     </div>

                     <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4">
                        <h5 className="text-orange-800 font-bold text-sm mb-2">Next Session</h5>
                        <p className="text-sm text-orange-900 mb-2">{smart_suggestions.next_day_focus.description}</p>
                        <div className="text-xs text-orange-800/70 bg-orange-100/50 p-2 rounded-lg">
                           <strong>Tip:</strong> {smart_suggestions.next_day_focus.options[0]?.label}
                        </div>
                     </div>
                  </div>

                  {/* Collapsible Raw Report */}
                  <div className="pt-4 border-t border-slate-100">
                     <details className="group">
                        <summary className="text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-600 transition-colors select-none list-none flex items-center gap-1 w-fit">
                           <span>View Raw Text Report</span>
                           <ChevronDown size={12} className="group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="mt-3 p-4 bg-slate-800 rounded-xl overflow-hidden">
                           <pre className="text-slate-300 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                              {workout.copy_paste_report}
                           </pre>
                        </div>
                     </details>
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WorkoutList;
