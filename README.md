# ✦ Clarity Layer

**Clarity Layer** is a structured transparency interface designed to explicitly model AI uncertainty and expose hidden context assumptions in LLM responses. It helps professional users evaluate AI outputs critically rather than relying on blind trust.

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [How It Works (Architecture)](#%EF%B8%8F-how-it-works-architecture)
3. [Tech Stack](#-tech-stack)
4. [Environment Setup](#-environment-setup)
5. [Local Development](#-local-development)
6. [Deployment to Vercel](#-deployment-to-vercel)

---

## 🌟 Core Features

### 1. Confidence Underlines
* **Sentence-Level Uncertainty**: Sentences containing claims where the AI is less certain (estimated, outdated, or unverifiable info) are underlined in amber.
* **Inline Popovers**: Clicking any underline opens a floating popover detailing exactly why the AI flagged that claim.
* **Granular Feedback**: Users can mark flags as verified (turning the underline green) or dismiss them.

### 2. Context Assumptions Tab (Redesigned Flow)
* **Impact Labels**: Surfaced assumptions show their impact level (`HIGH`, `MEDIUM`, or `LOW`) based on how heavily they shaped the response structure or framing.
* **Smart Suggestion Chips**: Offers 2-3 alternative quick-select chips (max 5 words) to swap assumptions with a single tap.
* **"Something else?" Free Text**: Users can type custom corrections if the pre-configured chips don't fit. Inputs are mutually exclusive with chips.
* **One-Tap Selection**: Chip selection instantly logs the correction and closes the edit card to show a clean visual diff state.
* **Contextual Regeneration**: Clicking the amber "Regenerate with corrections →" button refines the system prompt with the exact `original → correction` pairs to produce a corrected response.

### 3. Real-Time Web Search Integration
* **Query Classification**: Automatically detects time-sensitive or real-time queries.
* **Tavily Search API**: Queries the web for current data context and injects facts directly into the system prompt.
* **Live-Search Signalling**: Displays a "Sources checked" label beneath the response and unshifts a static "used live web search" card into the Assumptions list.

### 4. Premium Claude-Like Aesthetics
* **Sleek Typography**: High-quality Google Fonts (Inter) and custom spacing.
* **Unified Theme Toggling**: Fluid light and dark mode variables tailored using Tailwind CSS.
* **Toast Systems**: Custom slide-in notifications for fresh chat sessions.

---

## ⚙️ How It Works (Architecture)

To maintain a fast time-to-first-byte (TTFB), Clarity Layer uses a **two-pass completion pipeline**:

```
[User Message] 
      │
      ▼
1. Main Chat Stream (Groq: llama-3.3-70b-versatile) ──► Streams response to UI immediately
      │
      ▼ (Stream Ends)
2. Background Clarity API (Groq) ──────────────────────► Parsed JSON (Flags + Assumptions)
      │
      ▼
3. Render Underlines & Clarity Pill ───────────────────► Interactive Panel Ready
```

---

## 🛠️ Tech Stack

* **Framework**: Next.js 14 (App Router)
* **Styling**: Tailwind CSS & Vanilla CSS Transitions
* **AI Engine**: Groq SDK (`llama-3.3-70b-versatile`)
* **Search Engine**: Tavily API
* **Icons & Typo**: Lucide React & Inter Sans Font

---

## 🔌 Environment Setup

Create a `.env.local` file in the root directory and add your API keys:

```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

* Get a free **Groq** API key at the [Groq Console](https://console.groq.com).
* Get a free **Tavily** API key at [Tavily Search](https://tavily.com).

---

## 🚀 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run the server**:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment to Vercel

1. Push your code to your GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your **`letsgetitdone23/ClarityLayer`** repository.
4. Add your **`GROQ_API_KEY`** and **`TAVILY_API_KEY`** environment variables in the settings.
5. Click **Deploy**. Vercel will host both the frontend files and the serverless API routes on its global edge network.
