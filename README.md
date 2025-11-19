<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NutriBalance AI – Nutrition & Fitness Coach (Prototype)

NutriBalance AI is a prototype health application built with **Google AI Studio** and **Gemini**.  
Its goal is to help users take care of their health by combining:

- **Nutrition tracking** (calories + macros)
- **Exercise logging**
- A **voice-activated AI coach** for conversational guidance

The system is currently a **mock-up / proof of concept** created for an assignment. It focuses on the user experience and AI interactions; full user accounts and persistent databases are not implemented yet.

---

## 1. Problem & Concept

Most people struggle to:

- Keep track of what they eat  
- Understand their calorie and macronutrient balance  
- Plan healthy meals with what they already have at home  
- Log workouts and make sense of the data over time  

**NutriBalance AI** addresses this by combining voice dictation, AI analysis, and smart recommendations in one place.

High-level goals:

1. **Track nutrition**
   - Log foods eaten during the day
   - Estimate **calories**, **protein**, **carbs**, and **fat**
   - Help users understand their daily energy and macro balance

2. **Track exercise**
   - Log workouts exercise by exercise
   - Capture **time, distance, weight, reps, sets**, etc.
   - Generate a **session report** with stats, graphs, and coach feedback

3. **Guide the user through conversation**
   - A **voice-activated coach** for:
     - Nutrition questions
     - Workout ideas
     - Healthy habits
   - Users can talk to the AI in natural language instead of filling long forms

---

## 2. Key Features

### 2.1 Nutrition & Recipe Support

- **Food logging**
  - Log meals via **voice dictation** or **text input**
  - The AI interprets foods and portions to estimate:
    - Total calories
    - Protein / carbohydrates / fat

- **Fridge-based suggestions**
  - Users can describe the foods they have in their **fridge or pantry**
  - The app suggests:
    - Healthy **recipes**
    - Daily or weekly **menus**
  - The goal is to promote **realistic, healthy eating** using what is already available at home.

### 2.2 Exercise Tracking

- **Exercise log per session**
  - Add exercises one by one
  - Input modes:
    - **Voice dictation**
    - **Typed text**
    - **Picture + text** (e.g., photo of a machine or treadmill screen)

- **Metrics per exercise**
  - Time (duration)
  - Weight
  - Distance
  - Reps / sets
  - Any metric aligned with the activity

- **End-of-session report**
  - Automatically generated summary that includes:
    - List of exercises and metrics
    - Total training volume / duration
    - Basic statistics and graphs (prototype level)
    - **Coach’s analysis and explanations** in plain language

- **Smart coaching suggestions**
  - Recommendations for **future workouts**
  - Suggestions for:
    - **Stretching routines**
    - **Warm-up exercises**
  - Designed to support safe and sustainable training habits.

### 2.3 AI Voice Coach

- Voice-activated **conversational interface** for:
  - Asking questions about nutrition or exercise
  - Getting feedback on a specific day or session
  - Receiving personalized tips based on what the user logged

- The coach can:
  - Explain why certain food choices are more or less balanced
  - Suggest modifications to improve micronutrient balance
  - Propose progressive exercise plans within the current session

---

## 3. Current Status & Limitations

At the moment, NutriBalance AI is primarily a **conceptual prototype**:

- ✅ Demonstrates:
  - The **user experience** of logging food and exercises
  - How the **AI coach** responds and generates reports
  - How voice / text input can be combined with analytics

- ❌ Not yet implemented:
  - **User account creation**
  - **Persistent database** (no long-term storage of past sessions)
  - Full authentication and authorization
  - Long-term progress dashboards

Right now:

- Each run behaves like a **single-user, single-session mock-up**.
- Data is **not** stored across sessions.
- The focus is on **interaction flows** and AI-powered reasoning.

---

## 4. Future Directions

If development continues beyond this assignment, possible extensions include:

- **User accounts & profiles**
  - Secure sign-in
  - Personalized goals and preferences

- **Persistent history**
  - Save all nutrition and workout sessions
  - Visual dashboards for weekly/monthly trends

- **Long-term coaching**
  - AI analysis of several weeks or months of data
  - Adaptive training plans instead of only per-session suggestions
  - Personalized nutrition plans based on history, preferences, and constraints

- **Deeper analytics**
  - Recovery estimates, load management, macro balance over time
  - Integration with wearables or health APIs

The possibilities are essentially open-ended; this project is a **starting point**.

---

## 5. Why Google AI Studio & Gemini?

We chose **Google AI Studio** because:

- Google has recently released **Gemini 3**, a very powerful multimodal AI model.
- AI Studio offers a **new paradigm of app development**:
  - You explain what you want in **natural language**
  - The system helps transform those explanations into a **working AI-powered app**
- It is well-suited for:
  - Rapid prototyping
  - Experimenting with **voice and chat-based interfaces**
  - Integrating AI reasoning with a web front-end

NutriBalance AI uses AI Studio primarily for:

- Natural language understanding (food & exercise logging)
- Calorie and macronutrient estimation
- Coach explanations and recommendations

---

## 6. Run and Deploy Your AI Studio App

This repository contains everything you need to run the NutriBalance AI prototype locally and to view it in AI Studio.

### Access the Deployed App

- **Live app (prototype)**  
  `https://nutribalance-ai-940696915160.us-west1.run.app`

- **View / edit in Google AI Studio**  
  `https://ai.studio/apps/drive/1InzawdPqN3hojswO9AeJfTsNws8VM8bH`

> Note: These URLs may be restricted or temporary depending on the assignment setup.

---

## 7. Run Locally

### Prerequisites

- **Node.js** (recent LTS version recommended)
- A **Gemini API key** from Google AI Studio

### 1. Install Dependencies

```bash
npm install
