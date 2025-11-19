
export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack'
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AnalysisResult {
  foodName: string;
  description: string;
  nutrition: NutritionalInfo;
  suggestions: string; // Advice to balance the meal
  healthScore: number; // 1-10
}

export interface MealEntry extends AnalysisResult {
  id: string;
  type: MealType;
  imageUrl?: string; // Base64 string if image was used
  timestamp: number;
}

export interface DailyGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  estimatedCalories: number;
  cookingTime: string;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  }
}

// --- Workout Types ---

export interface DraftExercise {
  id: string;
  text: string;
  image?: string; // Base64
  timestamp: number;
}

export interface WorkoutExercise {
  name: string;
  category: string;
  primary_muscle_group: string;
  sets?: number;
  reps_per_set?: number[];
  weight_per_set?: number[];
  total_volume?: number;
  duration_seconds?: number[]; // Array or single number handled by UI logic
  distance?: number;
  notes_summary?: string;
}

export interface SmartSuggestions {
  next_day_focus: {
    description: string;
    options: Array<{ label: string; details: string[] }>;
  };
  warmup_for_next_session: {
    description: string;
    steps: string[];
  };
  flexibility_and_mobility_after_today: {
    description: string;
    lower_body: string[];
    upper_body: string[];
    estimated_duration_minutes: number;
  };
}

export interface WorkoutAnalysis {
  overview: {
    date: string;
    location: string;
    total_duration_minutes: number;
    total_exercises: number;
    main_focus: string;
    key_stats: {
      estimated_total_weight_lifted?: number;
      total_active_time_minutes?: number;
    };
  };
  exercises: WorkoutExercise[];
  highlights: string[];
  expert_critique: string; // New field for expert advice
  notes_to_self: string[];
  smart_suggestions: SmartSuggestions;
}

export interface WorkoutEntry {
  id: string;
  timestamp: number;
  copy_paste_report: string;
  structured_summary: WorkoutAnalysis;
  rawInput?: string;
  imageUrl?: string;
}
