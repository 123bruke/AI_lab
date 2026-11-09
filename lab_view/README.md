# 🔬 lab_view • 4D Cinema Virtual Chemistry & Physics Laboratory

A dedicated, self-contained Three.js / React 19 / Vite application providing the full interactive 4D virtual laboratory workbench.

---

## 🌟 Capabilities

- **Interactive 3D/4D Chemistry Workbench**:
  - Manipulate Erlenmeyer flasks, beakers, Bunsen burner flames, and thermometers in real-time.
  - Dispense reagents ($HCl$, $NaOH$, $CuSO_4$, ethanol), stir solutions with magnetic bars, and trigger exothermic/endothermic reactions.
- **Autonomous Multi-Agent AI Command Deck**:
  - Built-in UI to communicate with all 10 specialized AI agents (Diagram, Report, Safety, Stoichiometry, Spectroscopy, Vision, QA).
- **ChromaDB Hybrid Search & MSDS Viewer**:
  - Live querying across dense vector embeddings and BM25 keywords for chemical safety protocols.
- **Relational SQL Database Explorer**:
  - View and journal formal lab reports stored in `moseb_lab.db`.

---

## 🚀 Running Locally

```bash
cd lab_view
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Building for Production

```bash
cd lab_view
npm run build
```

---

## ☁️ Deploying to Vercel

In the Vercel Project Settings:
- **Root Directory**: `lab_view`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
