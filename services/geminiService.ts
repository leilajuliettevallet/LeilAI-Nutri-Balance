
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Recipe, WorkoutAnalysis, DraftExercise } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for structured output
const mealAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING, description: "A short, clear name of the identified food." },
    description: { type: Type.STRING, description: "A one-sentence description of the meal content." },
    nutrition: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER, description: "Estimated total calories (kcal)." },
        protein: { type: Type.NUMBER, description: "Estimated protein in grams." },
        carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams." },
        fat: { type: Type.NUMBER, description: "Estimated fat in grams." },
      },
      required: ["calories", "protein", "carbs", "fat"]
    },
    suggestions: { type: Type.STRING, description: "Specific advice on what to add or remove to make this meal nutritionally balanced (e.g., 'Add a leafy green salad for fiber')." },
    healthScore: { type: Type.NUMBER, description: "A score from 1 to 10 rating the nutritional balance of this meal." }
  },
  required: ["foodName", "description", "nutrition", "suggestions", "healthScore"]
};

// Schema for Recipe Generator
const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Name of the dish" },
    description: { type: Type.STRING, description: "Brief appetizing description" },
    ingredients: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "List of ingredients with quantities" 
    },
    instructions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "Step by step cooking instructions" 
    },
    estimatedCalories: { type: Type.NUMBER, description: "Total estimated calories per serving" },
    cookingTime: { type: Type.STRING, description: "e.g. '30 mins'" },
    macros: {
      type: Type.OBJECT,
      properties: {
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fat: { type: Type.NUMBER },
      },
      required: ["protein", "carbs", "fat"]
    }
  },
  required: ["title", "description", "ingredients", "instructions", "estimatedCalories", "cookingTime", "macros"]
};

// Schema for Workout Analysis (FlowSet Blueprint)
const workoutSchema = {
  type: Type.OBJECT,
  properties: {
    copy_paste_report: { type: Type.STRING, description: "A nicely formatted markdown full report for the user." },
    structured_summary: {
      type: Type.OBJECT,
      properties: {
        overview: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            location: { type: Type.STRING },
            total_duration_minutes: { type: Type.NUMBER },
            total_exercises: { type: Type.NUMBER },
            main_focus: { type: Type.STRING },
            key_stats: {
              type: Type.OBJECT,
              properties: {
                estimated_total_weight_lifted: { type: Type.NUMBER, nullable: true },
                total_active_time_minutes: { type: Type.NUMBER, nullable: true }
              }
            }
          },
          required: ["date", "location", "total_duration_minutes", "total_exercises", "main_focus"]
        },
        exercises: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              primary_muscle_group: { type: Type.STRING },
              sets: { type: Type.NUMBER, nullable: true },
              reps_per_set: { type: Type.ARRAY, items: { type: Type.NUMBER }, nullable: true },
              weight_per_set: { type: Type.ARRAY, items: { type: Type.NUMBER }, nullable: true },
              total_volume: { type: Type.NUMBER, nullable: true },
              duration_seconds: { type: Type.ARRAY, items: { type: Type.NUMBER }, nullable: true },
              distance: { type: Type.NUMBER, nullable: true },
              notes_summary: { type: Type.STRING, nullable: true }
            },
            required: ["name", "category", "primary_muscle_group"]
          }
        },
        highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
        expert_critique: { type: Type.STRING, description: "A critical expert analysis of the session's balance and quality." },
        notes_to_self: { type: Type.ARRAY, items: { type: Type.STRING } },
        smart_suggestions: {
          type: Type.OBJECT,
          properties: {
            next_day_focus: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      details: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["label", "details"]
                  }
                }
              },
              required: ["description", "options"]
            },
            warmup_for_next_session: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                steps: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["description", "steps"]
            },
            flexibility_and_mobility_after_today: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                lower_body: { type: Type.ARRAY, items: { type: Type.STRING } },
                upper_body: { type: Type.ARRAY, items: { type: Type.STRING } },
                estimated_duration_minutes: { type: Type.NUMBER }
              },
              required: ["description", "lower_body", "upper_body", "estimated_duration_minutes"]
            }
          },
          required: ["next_day_focus", "warmup_for_next_session", "flexibility_and_mobility_after_today"]
        }
      },
      required: ["overview", "exercises", "highlights", "expert_critique", "notes_to_self", "smart_suggestions"]
    }
  },
  required: ["copy_paste_report", "structured_summary"]
};

export const analyzeMeal = async (
  textInput: string,
  imageBase64?: string,
  mimeType: string = 'image/jpeg'
): Promise<AnalysisResult> => {
  
  try {
    const parts: any[] = [];

    // Add image if present
    if (imageBase64) {
      // Strip header if present (e.g., "data:image/jpeg;base64,")
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType
        }
      });
    }

    // Add text prompt
    let promptText = "Analyze this meal.";
    if (textInput) {
      promptText += ` The user described it as: "${textInput}".`;
    }
    promptText += " Provide estimated nutritional values, a health score, and constructive suggestions to balance the meal better.";
    
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: mealAnalysisSchema,
        systemInstruction: "You are an expert nutritionist AI. Your goal is to help users track calories accurately and improve their diet balance. Be encouraging but realistic with estimates. If the image is unclear or the text is vague, make a best-effort average estimate."
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing meal with Gemini:", error);
    throw error;
  }
};

export const generateRecipe = async (ingredients: string): Promise<Recipe> => {
  try {
    const prompt = `Create a healthy, balanced meal recipe using the following ingredients/ideas: "${ingredients}". 
    If the input is vague (e.g., "dinner"), suggest a popular healthy option.
    Provide a complete recipe with ingredients list and step-by-step instructions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        systemInstruction: "You are a creative chef and nutritionist. Create delicious, healthy, and balanced recipes based on user requests."
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }
    
    return JSON.parse(resultText) as Recipe;

  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
};

export const analyzeWorkout = async (
  exercises: DraftExercise[]
): Promise<{ copy_paste_report: string; structured_summary: WorkoutAnalysis }> => {
  try {
    const parts: any[] = [];

    // Construct context from multiple exercises
    let textLog = "Here is the log of my workout session, recorded exercise by exercise:\n";
    
    exercises.forEach((ex, index) => {
      textLog += `\nExercise #${index + 1} (Logged at ${new Date(ex.timestamp).toLocaleTimeString()}): ${ex.text}`;
      
      if (ex.image) {
        const cleanBase64 = ex.image.split(',')[1] || ex.image;
        parts.push({
          inlineData: {
            data: cleanBase64,
            mimeType: 'image/jpeg'
          }
        });
        textLog += " [Image attached for this exercise]";
      }
    });

    textLog += "\n\nPlease analyze this full session.";
    parts.push({ text: textLog });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: workoutSchema,
        systemInstruction: `You are "FlowSet", an expert fitness coach AI. 
        The user has logged their workout session exercise-by-exercise. 

        Your Job:
        1. Parse the messy input into a clean, structured session log.
        2. **CRITICAL:** Provide an "Expert Critique" field. Analyze the balance (push/pull, upper/lower), the volume quality, and intensity. Tell the user strictly but helpfully where they might be overtraining or undertraining, or if their order of exercises was suboptimal.
        3. Compute stats (Volume, Duration).
        4. Generate Smart Suggestions for recovery and next workout.
        
        Return a JSON object containing a markdown report and structured data.`
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(resultText);

  } catch (error) {
    console.error("Error analyzing workout:", error);
    throw error;
  }
};
