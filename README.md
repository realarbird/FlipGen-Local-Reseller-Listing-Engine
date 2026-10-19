# ⚡ FlipGen: Local Reseller Listing Engine

[![DEV Hacktoberfest 2026](https://img.shields.io/badge/DEV_Hacktoberfest_2026-Week_2:_Side_Hustle-FF6F00?style=for-the-badge&logo=dev.to)](https://dev.to)
[![Model](https://img.shields.io/badge/Model-Gemma_2-4285F4?style=for-the-badge&logo=google)](https://ollama.com/library/gemma2)
[![Runtime](https://img.shields.io/badge/Runtime-Local_Ollama_(0%24_Tokens)-000000?style=for-the-badge&logo=ollama)](https://ollama.com)
[![Deployed on Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)

> **FlipGen** turns messy thrift store notes and condition observations into search-optimized listings for **eBay**, **Poshmark**, and **Mercari** simultaneously—running locally on **Google's Gemma 2 via Ollama** at **$0 token cost**.

---

## 🎯 The Side Hustle Problem & The Gemma 2 Solution

Reselling thrift finds, vintage electronics, streetwear, sneakers, and collectibles is one of the world's most accessible and lucrative side hustles. However, cross-listing inventory across multiple marketplaces is exhausting:
- **eBay** requires a strict **80-character maximum SEO title** packed with keywords, bulleted condition disclosures, and item specifics.
- **Poshmark** requires a warm, aesthetic, conversational closet tone and trending style tags.
- **Mercari** rewards concise titles, honest flaw disclosure, and fast shipping assurances.

Existing AI tools use closed APIs (OpenAI GPT-4o, Claude) that charge per token. When processing **50 to 500 inventory items a month**, token fees eat directly into a reseller's profit margins.

**FlipGen eliminates token costs entirely** by orchestrating open-weight **Gemma 2** locally through Ollama. You get infinite, private, high-speed listing generation directly on your machine.

---

## ✨ Core Features

### 1. 🌟 Ollama Connection Status & Judge Demo Mode
- **Live Status Indicator:** Real-time ping to `http://localhost:11434/api/tags` displays connection health and auto-detects installed models.
- **Interactive CORS Guide:** Modal explaining `OLLAMA_ORIGINS="*" ollama serve` with 1-click copy and instructions for macOS, Linux, and Windows.
- **Judge Demo Mode:** Hackathon judges evaluating on Render can test every feature instantly with realistic simulated Gemma 2 responses without needing Ollama installed.

### 2. 🛍️ Single Item Generator
- **Inputs:** Item Name, Condition dropdown (*Brand New with Tags*, *Like New / Mint*, *Good / Gently Used*, *Fair / Minor Flaws*, *For Parts*), Target Price, Thrift Purchase Cost (COGS), and Raw Notes & Flaws.
- **1-Click Presets:** Instant test items for *Vintage Electronics*, *Thrift Workwear*, *Retro Gaming*, and *Sneaker Flips*.
- **Platform Outputs:**
  - **eBay:** Enforces strict $\le 80$ character cap with a dynamic color-coded character counter badge (`74 / 80 chars - Optimal SEO`), bulleted condition specs, and search keywords.
  - **Poshmark:** Aesthetic brand-forward title, closet styling description, and 5 style tags.
  - **Mercari:** Concise title, honest flaw disclosure, fast-ship guarantee, and 5 hashtags.
- **1-Click Copy:** Copy individual titles, descriptions, tags, or the entire formatted listing.

### 3. 💰 Reseller Fee & Profit Intelligence Calculator
- Automatically calculates estimated marketplace fees and net payouts:
  - **eBay:** ~13.25% + $0.30 standard fee.
  - **Mercari:** 10% selling fee.
  - **Poshmark:** 20% commission (or flat $2.95 under $15).
- Highlights the **Best Payout Platform** and calculates estimated ROI % on your thrift cost.
- Delivers an actionable **Gemma 2 Pricing Strategy Tip** (e.g., Best Offer thresholds and bundle pricing).

### 4. 📦 Batch CSV Engine (50+ Items at $0 Cost)
- **Upload Any CSV:** Drop any inventory spreadsheet with columns `item_name`, `condition`, `raw_notes`, `price`.
- **1-Click Sample Batch:** Populates 5 curated vintage flips immediately for instant testing.
- **Sequential Pipeline:** Processes items sequentially with live progress bar, tokens/sec calculation, and a live **"Money Saved vs. Closed APIs ($0.00 spent)"** ticker.
- **Interactive Results Table:** Filter and search items, inspect full multi-platform copy in a slide-over modal.
- **Export Enriched CSV:** Download a ready-to-use CSV containing all generated titles, descriptions, and tags.

### 5. 📑 Sales Archive & Inventory Ledger
- **Archival Desk:** Save generated specimens directly to a persistent local ledger tracking inventory valuation, COGS, projected net profit, and ROI %.
- **1-Click Platform Copy:** Instant title copy shortcuts for eBay, Poshmark, and Mercari directly from the table.
- **CSV Export:** Download a complete financial ledger report with specimen IDs, dates, and economics.

---

## 🏛️ Strict JSON Prompting Schema (Gemma 2)

FlipGen enforces Ollama's `format: "json"` with a strict prompt schema:

```json
{
  "ebay": {
    "title": "string (strictly 80 characters or fewer, keyword-dense)",
    "description": "string (bulleted features, exact condition, specifics)",
    "keywords": ["string", "string", "string", "string", "string"]
  },
  "poshmark": {
    "title": "string (clean, aesthetic, brand-first)",
    "description": "string (friendly closet tone, styling suggestions)",
    "tags": ["string", "string", "string", "string", "string"]
  },
  "mercari": {
    "title": "string (concise, high searchability)",
    "description": "string (honest flaw disclosure, fast shipping guarantee)",
    "hashtags": ["string", "string", "string", "string", "string"]
  },
  "pricing_tip": "string (actionable reseller pricing & offer strategy)"
}
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js:** v18+ installed.
- **Ollama (Optional for local AI):** Install from [ollama.com](https://ollama.com).

### 2. Local Setup
```bash
# Clone the repository
git clone https://github.com/your-username/flipgen-reseller-engine.git
cd flipgen-reseller-engine

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🔌 Connecting Local Ollama & Enabling CORS

To allow web applications (running on `localhost:5173` or hosted on Render) to communicate with your local Ollama instance, enable CORS:

### Quick Command (macOS / Linux / Windows Terminal):
```bash
OLLAMA_ORIGINS="*" ollama serve
```

### Pull Gemma 2 Model:
```bash
ollama run gemma2
```

*(You can also use `gemma2:9b` or `gemma2:27b` by selecting them in FlipGen's Settings modal).*

### Persistent Configuration:
- **macOS:**
  ```bash
  launchctl setenv OLLAMA_ORIGINS "*"
  ```
  *(Then restart the Ollama desktop app).*
- **Linux (systemd):**
  ```bash
  sudo systemctl edit ollama.service
  # Add: Environment="OLLAMA_ORIGINS=*"
  sudo systemctl daemon-reload && sudo systemctl restart ollama
  ```
- **Windows:**
  Add a User Environment Variable:
  - Variable: `OLLAMA_ORIGINS`
  - Value: `*`
  *(Then restart Ollama from the system tray).*

---

## 🔒 Connecting Local Ollama with Render

When connecting FlipGen (hosted on Render) directly to your local Ollama instance:

### 1. Enable CORS on Ollama
- **macOS (Recommended 1-Liner):**
  ```bash
  launchctl setenv OLLAMA_ORIGINS "*" && pkill -f Ollama && open -a Ollama
  ```
- **Terminal (All Platforms):**
  ```bash
  OLLAMA_ORIGINS="*" ollama serve
  ```
  *(Note: If you see `bind: address already in use`, quit the running Ollama menu bar app first).*

### 2. Allow Localhost in Chrome Site Settings (Render HTTPS)
To allow the Render website to call `http://localhost:11434` directly without browser blocking:
1. In your browser on the Render site, click the **tune / padlock icon** next to the URL in the address bar.
2. Click **Site settings**.
3. Find **Insecure content** and change it from *Block (default)* to **Allow**.
4. Reload the page! The status badge will turn green (**Ollama Online**).

### 3. Zero-Setup Judge Demo Mode
Hackathon judges can simply toggle **"Judge Demo Mode"** in the top navbar to test the entire application with realistic Gemma 2 outputs without needing Ollama or a GPU.

---

## ☁️ Deploying to Render (1-Click Blueprint)

This repository includes a pre-configured `render.yaml` file for static site deployment:

1. Push this repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and deploy:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Routes:** Single-Page App rewrite (`/*` $\rightarrow$ `/index.html`)

---

## 📁 Project Structure

```
├── public/
│   └── sample_vintage_batch.csv   # Downloadable sample CSV for testing
├── src/
│   ├── components/
│   │   ├── Navbar.jsx             # Top header, status pill, demo toggle
│   │   ├── SingleItemGenerator.jsx# Single listing generator with presets
│   │   ├── PlatformCard.jsx       # eBay (80-char), Poshmark, Mercari cards
│   │   ├── FeeCalculator.jsx      # Reseller fee & net profit intelligence
│   │   ├── BatchGenerator.jsx     # Batch CSV processor & table
│   │   ├── CorsHelpModal.jsx      # Interactive CORS setup terminal guide
│   │   └── SettingsModal.jsx      # Model selection & Ollama host settings
│   ├── services/
│   │   ├── ollamaService.js       # Ollama API client & Judge Demo simulator
│   │   └── sampleData.js          # Curated thrift items & sample presets
│   ├── App.jsx                    # Root app shell
│   ├── index.css                  # Tailwind styles & glassmorphism
│   └── main.jsx                   # React entry point
├── index.html                     # HTML5 template with SEO meta
├── package.json                   # Dependencies & scripts
├── postcss.config.js              # PostCSS config
├── render.yaml                    # Render static site blueprint
├── tailwind.config.js             # Tailwind CSS theme & custom colors
├── vite.config.js                 # Vite bundler config
└── README.md                      # Documentation & submission details
```

---

## 🏆 Hackathon Details
- **Event:** DEV Hacktoberfest 2026 Challenge
- **Theme:** Week 2 — *"Side Hustle"*
- **Target Audience:** Resellers, thrift flippers, vintage collectors, estate sale scouts.
- **Impact:** Democratizes AI-powered e-commerce optimization at **$0 token cost** using local Google Gemma 2.
