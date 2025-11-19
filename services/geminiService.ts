
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Recipe } from "../types";

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
