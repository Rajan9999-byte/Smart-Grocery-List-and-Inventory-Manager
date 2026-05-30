# 🍃 FreshKeep AI - Smart Grocery & Inventory Hub

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

> A production-grade, AI-powered Smart Home SaaS designed to eliminate food waste, predict grocery restocks, and generate dynamic culinary recipes based on real-time pantry inventory.

![FreshKeep Dashboard](./assets/dashboard.png)

## 📖 Overview

FreshKeep AI brings Silicon Valley-level consumer software architecture into the smart home ecosystem. By combining multi-user household syncing with applied machine learning (Google Gemini), the platform actively monitors pantry shelf life, computes visual spending analytics, and acts as an "AI Waste Reduction Chef" to triage expiring ingredients.

---

## ✨ Core Product Features

### 1. AI-Powered Waste Reduction
* **AI Recipe Generation:** Cross-references expiring shelf lots within the user's inventory to generate professional chef recipes, maximizing freshness and eliminating luxury food spoilage.
* **Expiry Heatmap Protocol:** Categorizes inventory into dynamic safety zones (Immediate Triage vs. Stable Freshness), prompting critical action for items expiring within 36 hours.

### 2. Smart Inventory & Restock Forecasting
* **Lot-Traceability Matrix:** Tracks individual bulk sweeps down to the micro-lot level (e.g., matching a specific carton of milk to its exact expiration epoch).
* **Restock Prediction Engine:** Analyzes consumption velocities and alerts users when capacity drops below customizable percentage thresholds.
* **Simulated OCR & Voice Logging:** Capable of processing simulated receipt uploads and voice transcriptions to auto-populate high-volume inventory lots.

### 3. Household Cloud Sync
* **Multi-User Collaboration:** Role-based access control (Owner, Admin, Member) allowing synchronized family grocery checklists and real-time ledger edits.
* **Visual Spend Analytics:** Aggregates dynamic cost estimations and plots monthly grocery expenditure trends using interactive Cartesian charts.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS, Motion |
| **State Management** | Centralized Hooks & Prop Drilling minimization |
| **Backend Integration** | Node.js / Express.js (Modular API routing for LLM calls) |
| **AI Processing** | Google Gemini Generative AI integration for recipe logic |
| **Data Layer** | Isolated In-Memory State (`db.ts`) simulating standard ORMs |

---

## 📸 Platform Gallery

### Command Dashboard
![Dashboard](./assets/dashboard.png)
*High-level household metrics, active chef alerts, and spend tracking.*

### Pantry Shelf Inventory
![Pantry Inventory](./assets/Pantry_self.png)
*Granular lot-tracking with incremental adjustment controls and low-stock warnings.*

### AI Waste Reduction Chef
![AI Recipes](./assets/AI_recipies.png)
*Dynamic recipe generation utilizing at-risk ingredients to prevent spoilage.*

### Smart Expiry Heatmaps
![Expiry Alerts](./assets/Expiry_alerts.png)
*Visualizing safety zones and immediate triage timelines.*

### Visual Spend Analytics
![Analytics](./assets/Visual_spend_analysis.png)
*Historical spending curves and budget category weight segmentations.*

---

## ⚙️ Local Development Environment

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Vani691/freshkeep-ai.git](https://github.com/Vani691/freshkeep-ai.git)
   cd freshkeep-ai

2. **Install dependencies:**

   ```bash
   npm install

3. **Configure Environment Variables:** 
   Duplicate .env.example to .env and add your Gemini API Key:
   ```bash
   VITE_GEMINI_API_KEY="YOUR_KEY_HERE"

4. **Launch the Application:**
   ```bash
   npm run dev

The Vite development server will start the application locally.


Architected and Engineered by **Shravani Mane** Software Engineer specializing in Full-Stack Development and Applied AI.   