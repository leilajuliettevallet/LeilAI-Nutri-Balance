
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
