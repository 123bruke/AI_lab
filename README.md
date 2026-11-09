# 🔬 MOSEB_STUDENT_LAB • 4D Cinema Virtual Chemistry Laboratory & Autonomous Multi-Agent AI System

[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black.svg?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.0-009688.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Hybrid_Search-FF4F00.svg?style=for-the-badge)](https://www.trychroma.com/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Lab_Optics-00FFFF.svg?style=for-the-badge)](https://ultralytics.com/)
[![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy-003B57.svg?style=for-the-badge&logo=sqlite)](https://sqlite.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy_Ready-000000.svg?style=for-the-badge&logo=vercel)](https://vercel.com/)

---

## 🌟 Overview

**MOSEB_STUDENT_LAB** is an ultra-photorealistic, browser-based 4D virtual chemistry laboratory powered by a team of **10+ Autonomous AI Agents**, **ChromaDB Hybrid Search**, **YOLOv8 Optical Apparatus Detection**, and a **FastAPI REST backend**.

Designed with **Cinema 4D-grade physical lighting** and an obsidian/platinum high-contrast design system, students and researchers can conduct real-time thermodynamic experiments, balance reactions, analyze optical absorbance via the Beer-Lambert law, and compile formal academic laboratory manuscripts directly saved to an expanded relational SQL database.

---

## 🏛️ System Architecture

```
AI_lab/
├── backend/
│   ├── app/
│   │   ├── agents/                   # 10+ Specialized Autonomous AI Agents & Orchestrator
│   │   │   ├── orchestrator.py       # Master Coordinator & Intent Classifier
│   │   │   ├── diagram_agent.py      # Mermaid & SVG Thermodynamic Curve Illustrator
│   │   │   ├── report_agent.py       # Academic Lab Report Author & SQL Journaler
│   │   │   ├── chemical_agent.py     # Chemical Reagent & GHS Hazard Classifier
│   │   │   ├── research_agent.py     # Literature & ChromaDB Knowledge Harvester
│   │   │   ├── simulation_agent.py   # Physical Bench Controller (Burner/Ice/Stir/Refill)
│   │   │   ├── safety_agent.py       # Safety Auditor & Thermal Runaway Monitor
│   │   │   ├── spectroscopy_agent.py # Beer-Lambert Law & Optical Absorbance Analyst
│   │   │   ├── stoichiometry_agent.py# Reaction Balancer & Yield Calculator
│   │   │   ├── vision_agent.py       # YOLOv8 Vision & PDF Protocol Parser
│   │   │   └── qa_agent.py           # Precision Metrologist & Lab Grade Auditor
│   │   ├── database/                 # SQLAlchemy ORM (moseb_lab.db)
│   │   ├── vector_store/             # ChromaDB Persistent Storage & Hybrid Search Engine
│   │   ├── vision/                   # YOLOv8 Apparatus Detection & PDF Parser
│   │   ├── logging_system/           # Rotating Python Logger & Dedicated Error Database (error_logs.db)
│   │   └── routers/                  # FastAPI Endpoints
│   ├── chroma_db/                    # Persistent Vector Embeddings
│   ├── test_data/                    # 12 Scientific Test Files (Protocols, MSDS, Reports)
│   └── run.py                        # Backend Launcher
├── src/
│   ├── components/
│   │   ├── MultiAgentCenter.tsx      # Autonomous Multi-Agent Command Deck Modal
│   │   ├── UnifiedLabSidebar.tsx     # Minimalist Black & White Action Dock
│   │   ├── Floating4DBackground.tsx  # Cinema 4D Floating Platinum/Chrome Spheres
│   │   ├── LandingPage.tsx           # Full Landing Page with Light/Dark Mode
│   │   └── LabScene.tsx              # 3D Physical Chemistry Environment
│   └── services/
│       ├── api.ts                    # REST Client for Multi-Agent AI & Database
│       └── telemetry.ts              # Intercepts Client Exceptions -> error_logs.db
├── vercel.json                       # Vercel Deployment Configuration
└── vite.config.ts                    # Vite Configuration with preserveSymlinks
```

---

## 🤖 The 10+ Autonomous AI Agents Team

| Agent | Role | Capabilities & Observable Bench Actions |
|---|---|---|
| **Master Orchestrator** | Central Router | Decomposes natural language queries, coordinates multi-agent subtasks, and executes sequential physical actions. |
| **Diagram Agent** | Visual Illustrator | Renders **Mermaid.js** flowcharts and compiles vector **SVG thermodynamic heating curves** ($T$ vs $t$). |
| **Report Agent** | Academic Documenter | Drafts complete academic lab manuscripts (Abstract, Hypothesis, Method, Calculations, Conclusion) and saves them to the SQL database. |
| **Chemical Agent** | Reagent Classifier | Calculates exact molar masses from atomic weights ($g/\text{mol}$), verifies CAS numbers, and classifies GHS hazard symbols. |
| **Research Agent** | Knowledge Harvester | Queries ChromaDB using **Hybrid Search** (dense vectors + BM25 keyword matching) to extract enthalpy tables and protocols. |
| **Simulation Agent** | Physical Apparatus Controller | **Takes real actions**: ignites the Bunsen burner, quenches with cryogenic ice (-20°C), refills the meniscus, and regulates magnetic stir RPM. |
| **Safety Agent** | Compliance Auditor | Monitors thermal runaway ($T > 95^\circ\text{C}$), prevents dry glassware heating, verifies PPE, and enforces the "Add Acid to Water (AA)" rule. |
| **Spectroscopy Agent** | Optical Analyst | Calculates optical density via Beer-Lambert Law ($A = \epsilon \cdot b \cdot c$), transmittance ($\%T = 10^{-A} \times 100\%$), and $\lambda_{\max}$. |
| **Stoichiometry Agent** | Reaction Balancer | Computes balanced reaction equations, limiting reagents, theoretical yields, and reaction enthalpies ($\Delta H_{\text{rxn}}$). |
| **Vision Agent** | Multimodal Specialist | Runs **YOLOv8** optical apparatus recognition on lab camera feeds, estimates liquid volumes, and parses scientific PDF guides. |
| **QA Agent** | Laboratory Metrologist | Computes relative error margins ($\% \text{ Error} = \frac{\lvert\text{Exp} - \text{Theo}\rvert}{\text{Theo}} \times 100\%$) and assigns performance grades (A+, A, B). |

---

## 🔍 ChromaDB Hybrid Search Engine

Combines dense vector semantic similarity with BM25 keyword term-frequency ranking using Reciprocal Rank Fusion:
$$\text{Score}_{\text{final}} = 0.65 \times \text{Score}_{\text{dense}} + 0.35 \times \text{Score}_{\text{BM25}}$$

- **Persistent Collections**:
  - `protocols`: Standard operating procedures, calorimetry, titration, distillation.
  - `msds`: Material Safety Data Sheets for $HCl$, $NaOH$, $CuSO_4$, $C_2H_5OH$.
  - `reports`: Peer-reviewed experimental manuscripts.

---

## 🛡️ Dedicated Error Logging System (`error_logs.db`)

All runtime frontend exceptions and backend API errors are logged using Python's standard `logging` library with rotating file backups (`backend/logs/moseb_lab_agents.log`) and stored in a **separate SQLite database**:
- Database: `backend/error_logs.db`
- Table: `system_error_logs`
- Client telemetry interceptor (`src/services/telemetry.ts`) transmits unhandled React errors to `/api/telemetry/log-error`.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+

### 1. Start the FastAPI Backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```
> **Backend API**: `http://127.0.0.1:8000`  
> **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

### 2. Start the Vite Frontend
```bash
npm install
npm run dev
```
> **Frontend Application**: `http://localhost:3000`

### 3. Production Build
```bash
npm run build
```
*(Compiles all 2,262 modules in ~20s with zero errors).*

---

## 🌐 Vercel Deployment

This project is pre-configured for **Vercel** with `vercel.json`:
1. Connect your repository (`123bruke/AI_lab`) to Vercel.
2. Build Command: `vite build`
3. Output Directory: `dist`
4. Deploy! All client routes and offline fallback mock sessions are active out-of-the-box.

---

## 📜 License

MIT License. Designed and engineered for modern student laboratories and advanced agentic physical science simulations.
