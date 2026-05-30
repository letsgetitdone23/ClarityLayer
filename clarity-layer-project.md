# Clarity Layer — Claude AI Prototype
## Project Brief for Antigravity Build

---

## 1. Project Overview

**Product:** Claude by Anthropic (Graduation Project Prototype)
**Feature Being Built:** Clarity Layer — a structured transparency system that surfaces sentence-level confidence flags and assumption transparency on every AI response.
**Purpose:** Help high-frequency professional users evaluate AI-generated outputs without replacing human judgment.
**LLM:** Groq API (free tier)
**UI Theme:** Claude-like Light Theme (clean, minimal, warm white)
**Vibe Coding Tool:** Antigravity

---

## 2. Core Problem Being Solved

AI outputs look equally polished whether correct or wrong. Users have no signal to:
- Know which specific claims are uncertain
- Know what assumptions the AI made about their context
- Correct those assumptions and get a better response

The Clarity Layer solves this by attaching two transparency signals to every response:
1. **Confidence Flags** — sentence-level underlines on uncertain claims with a one-line reason
2. **Assumptions Made** — what the AI inferred about user context, with ability to correct and regenerate

---

## 3. Tech Stack (All Free)

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| LLM API | Groq API (free tier) — model: `llama-3.3-70b-versatile` |
| Markdown Rendering | react-markdown + remark-gfm |
| Icons | Lucide React |
| State Management | React useState / useReducer (no external library) |
| Fonts | Inter (Google Fonts — free) |
| Deployment | Vercel (free tier) |
| Package Manager | npm |

**No paid services. No database required. All state is in-memory per session.**

---

## 4. Application Architecture

```
/app
  /page.tsx                  → Main chat page (renders ChatInterface)
  /layout.tsx                → Root layout with font + metadata
  /api
    /chat/route.ts           → Groq API call for main response
    /clarity/route.ts        → Groq API call for Clarity Layer analysis

/components
  /ChatInterface.tsx         → Main wrapper: sidebar + chat area
  /Sidebar.tsx               → Chat history list + New Chat button
  /ChatArea.tsx              → Message thread + input box
  /MessageBubble.tsx         → Individual message (user or assistant)
  /AssistantMessage.tsx      → Response with inline underlines + Clarity pill
  /ClarityPanel.tsx          → Sliding panel: Confidence + Assumptions tabs
  /ConfidenceTab.tsx         → List of flagged sentences with reasons
  /AssumptionsTab.tsx        → List of assumptions with edit fields
  /InlinePopover.tsx         → Hover/tap popover on underlined sentence
  /FirstTimeTooltip.tsx      → One-time anchored tooltip on Clarity pill
  /FeedbackBar.tsx           → End-of-panel feedback (helpful / somewhat / not really)
  /RegeneratingIndicator.tsx → "Regenerated based on your corrections" label

/lib
  /groq.ts                   → Groq client initialisation
  /clarityPrompt.ts          → System prompt for Clarity Layer analysis
  /chatPrompt.ts             → System prompt for main chat
  /types.ts                  → TypeScript interfaces for all data shapes

/hooks
  /useChat.ts                → Chat state, send message, new chat logic
  /useClarity.ts             → Clarity panel open/close, tab switching, assumption edits
  /useFirstTimeTooltip.ts    → localStorage flag for one-time tooltip logic
```

---

## 5. Data Shapes (TypeScript Interfaces)

```typescript
// lib/types.ts

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  clarity?: ClarityData
  isRegeneratedFrom?: string   // id of original message if this is a regeneration
}

export interface ClarityData {
  flags: ConfidenceFlag[]
  assumptions: Assumption[]
  isLoading: boolean
  feedbackGiven?: 'helpful' | 'somewhat' | 'not_really'
}

export interface ConfidenceFlag {
  id: string
  sentence: string             // exact sentence from response text
  reason: string               // one-line explanation of uncertainty
  startIndex: number           // character position in response for underlining
  endIndex: number
  userFeedback?: 'verified' | 'not_helpful'
}

export interface Assumption {
  id: string
  text: string                 // e.g. "Claude assumed your target market is India-based"
  editedText?: string          // user's correction if they edited it
  isEditing: boolean
}

export interface Chat {
  id: string
  title: string                // first user message truncated to 40 chars
  messages: Message[]
  createdAt: Date
}
```

---

## 6. Groq API Integration

### 6.1 Main Chat API — `/api/chat/route.ts`

```typescript
// Calls Groq with user's message history
// Model: llama-3.3-70b-versatile
// Returns: streamed text response

import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const { messages } = await req.json()

  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: MAIN_SYSTEM_PROMPT },
      ...messages
    ],
    stream: true,
    max_tokens: 2048,
    temperature: 0.7,
  })

  // Return as ReadableStream for streaming UI
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ''
        controller.enqueue(new TextEncoder().encode(text))
      }
      controller.close()
    }
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

### 6.2 Clarity Analysis API — `/api/clarity/route.ts`

```typescript
// Called AFTER main response is complete
// Sends the full response text to Groq with a structured analysis prompt
// Returns: JSON with flags[] and assumptions[]

export async function POST(req: Request) {
  const { responseText, userPrompt } = await req.json()

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: CLARITY_SYSTEM_PROMPT },
      { role: 'user', content: `
USER PROMPT: ${userPrompt}

AI RESPONSE TO ANALYZE:
${responseText}

Return JSON only. No preamble. No markdown fences.
      `}
    ],
    stream: false,
    max_tokens: 1024,
    temperature: 0.3,    // Low temp for consistent structured output
  })

  const raw = completion.choices[0].message.content || '{}'
  const parsed = JSON.parse(raw)

  return Response.json(parsed)
}
```

### 6.3 Clarity System Prompt — `/lib/clarityPrompt.ts`

```typescript
export const CLARITY_SYSTEM_PROMPT = `
You are a clarity analysis engine. Given an AI response and the user's original prompt, you must:

1. Identify sentences in the response that contain uncertain, estimated, potentially outdated, or unverifiable claims.
2. Identify assumptions the AI made about the user's context, intent, domain, audience, or constraints that were NOT explicitly stated in the prompt.

Return ONLY valid JSON in this exact format:
{
  "flags": [
    {
      "id": "f1",
      "sentence": "exact sentence from the response that is uncertain",
      "reason": "one line explanation of why this is uncertain (max 15 words)"
    }
  ],
  "assumptions": [
    {
      "id": "a1",
      "text": "Claude assumed [specific assumption about user context or intent]"
    }
  ]
}

Rules:
- flags array: 0-4 items only. Only flag genuinely uncertain claims. Do not flag well-established facts.
- assumptions array: 2-4 items. Always find at least 2 assumptions. Be specific — not generic.
- sentences in flags must be copied EXACTLY as they appear in the response.
- reason must be plain English, max 15 words, no jargon.
- Return empty arrays if nothing qualifies, not null.
- Never return anything other than the JSON object.
`
```

---

## 7. Complete User Flow Implementation

### Flow Sequence:
```
1. User types message → hits send
2. Main chat API called → response streams in token by token
3. Response fully received → Clarity API called with full response text
4. Clarity panel data loads → underlines render on flagged sentences
5. ✦ Clarity pill badge appears on response card
6. [First time only] Anchored tooltip appears pointing at pill
7. User hovers/taps underline → inline popover shows
8. User taps "See all flags" → Clarity panel slides up
9. User switches between Confidence Flags tab and Assumptions tab
10. User edits an assumption → taps "Regenerate with corrections"
11. New response streams in → "Regenerated based on your corrections" label shows
12. New Clarity analysis runs on new response
13. User gives per-flag feedback (verified / not helpful) or end-panel feedback
```

---

## 8. Component Specifications

### 8.1 ChatInterface.tsx
**Layout:** Two-column · Left sidebar (260px fixed) + Right chat area (flex-1)
**Sidebar:** List of past chats (current session only, no persistence) + "New Chat" button at top with "+" icon
**Chat area:** Scrollable message thread + fixed bottom input bar
**New chat behavior:** Clears current messages · starts fresh · previous chat title saved in sidebar list

### 8.2 AssistantMessage.tsx
**Renders:** Response text with underlined sentences for confidence flags
**Underline style:** `border-b-2 border-amber-400 cursor-pointer` on flagged sentence spans
**Clarity pill:** Positioned bottom-right of the message card
```
✦ Clarity   [amber pill, always visible on every assistant message]
```
**Loading state:** While Clarity is analyzing, pill shows `✦ Analyzing…` with a subtle pulse animation

### 8.3 Inline Sentence Rendering Logic
The response text must be parsed to wrap flagged sentences in `<span>` tags:

```typescript
function renderResponseWithFlags(text: string, flags: ConfidenceFlag[]) {
  // For each flag, find the sentence in text and wrap it:
  // <span 
  //   className="border-b-2 border-amber-400 cursor-pointer hover:bg-amber-50"
  //   onClick={() => openPopover(flag)}
  // >
  //   {flag.sentence}
  // </span>
  // All other text renders as plain text
}
```

### 8.4 InlinePopover.tsx
**Trigger:** Click/tap on underlined sentence
**Position:** Appears above the clicked sentence (use absolute positioning relative to span)
**Content:**
```
⚠ Claude is less certain here
─────────────────────────
[sentence text in italic, truncated to 2 lines]
─────────────────────────
[reason text]
─────────────────────────
[ See all flags ]    [ ✓ Helpful ]
```
**Dismiss:** Click anywhere outside · or press Escape

### 8.5 ClarityPanel.tsx
**Trigger:** Click on ✦ Clarity pill OR "See all flags" in popover
**Animation:** Slides up from bottom of message card (not full screen, not sidebar)
**Height:** Max 400px · scrollable inside
**Two tabs:** "Confidence Flags" (default) | "Assumptions Made"
**Close button:** X in top-right corner of panel

### 8.6 ConfidenceTab.tsx
Each flag renders as:
```
⚠ [sentence in italic, amber left border]
   [reason text — gray, smaller]
   [ ✓ Mark as verified ]  [ Not helpful ]
```
- "Mark as verified" → underline on that sentence turns green
- "Not helpful" → flag grayed out · logged to state
- If no flags: `✓ No uncertain claims in this response` — green, positive reinforcement

### 8.7 AssumptionsTab.tsx
Each assumption renders as:
```
[assumption text]
[ ✎ Change ]
```
On clicking Change, row expands:
```
[editable input field pre-filled with assumption text]
[ Done ]
```
After editing, row shows checkmark · assumption marked as corrected
Bottom of tab (if any corrections made):
```
[ Regenerate with corrections ]  ← primary amber button
```

### 8.8 FirstTimeTooltip.tsx
**Trigger:** First assistant message ever received by user
**Position:** Anchored to ✦ Clarity pill · appears above/beside it
**Content:**
```
✦ Meet Clarity

Underlined text = claims Claude is less certain about.
Tap any underline to see why.

Open Clarity to review what Claude assumed — and correct it.

[ Got it ]
```
**Persistence:** Use `localStorage.setItem('clarity_tooltip_seen', 'true')` on dismiss
**Re-nudge:** If user never tapped an underline after 3 messages, show once more then never again

### 8.9 FeedbackBar.tsx
**Position:** Bottom of ClarityPanel, always visible
**Trigger:** Shows after user has interacted with at least one flag or assumption
**Content:**
```
Was Clarity useful?
[ ✓ Yes ]  [ △ Somewhat ]  [ ✗ Not really ]
[Optional text field — placeholder: "What could be better?"]
[ Send ]  ← ghost button, low pressure
```
**Behavior:** Can only submit once per message · state saved in ClarityData.feedbackGiven

---

## 9. UI Design Specifications (Claude-Like Light Theme)

### Colors
```css
/* Background */
--bg-primary: #FFFFFF
--bg-secondary: #F7F7F5       /* sidebar, input area */
--bg-tertiary: #EFEFED        /* hover states */

/* Text */
--text-primary: #1A1A19
--text-secondary: #6B6B6A
--text-tertiary: #9B9B99

/* Clarity-specific */
--clarity-underline: #F59E0B   /* amber-400 */
--clarity-hover-bg: #FFFBEB    /* amber-50 */
--clarity-pill-bg: #FEF3C7     /* amber-100 */
--clarity-pill-text: #92400E   /* amber-800 */
--clarity-verified: #16A34A    /* green-600 */
--clarity-flag-border: #F59E0B /* amber-400 */

/* Borders */
--border-light: #E5E5E3
--border-medium: #D1D1CF

/* Input */
--input-bg: #FFFFFF
--input-border: #D1D1CF
--input-focus: #1A1A19
```

### Typography
```css
font-family: 'Inter', sans-serif
--text-base: 15px / 1.7
--text-sm: 13px / 1.6
--text-xs: 11px / 1.5
font-weight-normal: 400
font-weight-medium: 500
```

### Layout
```css
/* Sidebar */
sidebar-width: 260px
sidebar-bg: #F7F7F5
sidebar-border-right: 1px solid #E5E5E3

/* Chat area */
chat-max-width: 720px
chat-padding: 0 24px
message-gap: 24px

/* Input bar */
input-bar-bg: #FFFFFF
input-bar-border-top: 1px solid #E5E5E3
input-border-radius: 12px
input-padding: 12px 16px

/* Message bubbles */
user-message-bg: #F7F7F5
user-message-border-radius: 16px 16px 4px 16px
assistant-message-bg: #FFFFFF (no background — flows inline)
message-card-border: 1px solid #E5E5E3
message-card-radius: 12px
```

### Clarity Panel
```css
panel-bg: #FFFFFF
panel-border-top: 2px solid #F59E0B
panel-border-radius: 0 0 12px 12px
panel-max-height: 400px
panel-shadow: 0 -4px 16px rgba(0,0,0,0.06)
tab-active-color: #1A1A19
tab-active-border-bottom: 2px solid #F59E0B
tab-inactive-color: #6B6B6A
```

---

## 10. Environment Variables

```env
# .env.local
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

Get free GROQ key at: https://console.groq.com
Get free Tavily key at: https://tavily.com

---

## 11. Key Behaviors & Edge Cases

| Scenario | Behavior |
|---|---|
| Groq returns no flags | Flags tab shows: "✓ No uncertain claims in this response" |
| Groq returns no assumptions | Assumptions tab shows: "No specific assumptions detected" |
| User corrects assumption but does not regenerate | Subtle nudge: "You have unsaved corrections — regenerate to apply?" |
| Regenerated response | New message appended · labeled "Regenerated based on your corrections" · original still visible above with "View original" toggle |
| Clarity API fails | Pill shows "Clarity unavailable" in gray · no crash · main chat unaffected |
| Very short response (1-2 sentences) | Clarity panel still renders · may have 0 flags · pill always present |
| User on mobile | Popovers become tap-triggered bottom sheets · panel slides up full-width |
| New chat pressed | All messages cleared · sidebar adds previous chat as "Chat 1", "Chat 2" etc · fresh state |
| Multiple messages in one chat | Each assistant message has its own independent Clarity pill and panel |

---

## 12. Build Phases

### Phase 1 — Foundation
- Next.js project setup with Tailwind
- Claude-like UI shell: sidebar + chat area layout
- Basic message sending and rendering (no AI yet)
- New chat functionality with sidebar history

### Phase 2 — LLM Integration
- Groq API integration for main chat
- Streaming response rendering token by token
- Message history maintained across turns in same chat

### Phase 3 — Clarity Layer Core
- Clarity API route with structured Groq prompt
- Sentence-level underline rendering in AssistantMessage
- Inline popover on underline click
- ✦ Clarity pill badge on each assistant message

### Phase 4 — Clarity Panel
- Sliding panel with two tabs
- Confidence Flags tab with per-flag feedback
- Assumptions tab with inline editing
- Regenerate with corrections flow

### Phase 5 — Polish & UX
- First-time tooltip (one-time, anchored to pill)
- "Analyzing…" loading state on pill
- "Regenerated based on your corrections" label
- End-of-panel feedback bar
- Verified flag → green underline state
- Edge case handling (empty flags, API failure)

---

## 13. File Structure to Generate

```
clarity-layer/
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── chat/
│       │   └── route.ts
│       └── clarity/
│           └── route.ts
├── components/
│   ├── ChatInterface.tsx
│   ├── Sidebar.tsx
│   ├── ChatArea.tsx
│   ├── MessageBubble.tsx
│   ├── AssistantMessage.tsx
│   ├── ClarityPanel.tsx
│   ├── ConfidenceTab.tsx
│   ├── AssumptionsTab.tsx
│   ├── InlinePopover.tsx
│   ├── FirstTimeTooltip.tsx
│   └── FeedbackBar.tsx
├── hooks/
│   ├── useChat.ts
│   ├── useClarity.ts
│   └── useFirstTimeTooltip.ts
└── lib/
    ├── groq.ts
    ├── clarityPrompt.ts
    ├── chatPrompt.ts
    └── types.ts
```

---

## 14. Success Criteria for Prototype

The prototype is considered complete when:
- [ ] User can send messages and receive streaming responses in a Claude-like UI
- [ ] Uncertain sentences are visibly underlined in amber on every assistant response
- [ ] Clicking an underline shows an inline popover with a one-line reason
- [ ] ✦ Clarity pill is visible on every assistant message
- [ ] Clicking Clarity pill opens a panel with two tabs
- [ ] Confidence Flags tab lists all flagged sentences with reasons and per-flag feedback
- [ ] Assumptions tab lists inferred assumptions with editable fields
- [ ] Correcting assumptions and clicking Regenerate produces a new response
- [ ] New chat button works — clears thread, saves to sidebar
- [ ] First-time tooltip appears once and dismisses cleanly
- [ ] End-of-panel feedback bar captures helpful / not helpful
- [ ] UI matches Claude light theme: clean, minimal, warm white

---

## 15. Notes for Antigravity

- Build phase by phase as specified in Section 12
- Do not use any paid APIs, databases, or services
- All state is in-memory (React state) — no persistence required across browser sessions except the localStorage flag for first-time tooltip
- The Clarity analysis is a SEPARATE Groq API call from the main chat — it runs AFTER the main response is complete, not simultaneously
- Sentence matching for underlines: use exact string matching between `flag.sentence` and the response text — wrap matching substrings in styled `<span>` tags
- The Clarity panel slides up WITHIN the message card — it is not a global sidebar or modal
- Every assistant message gets its own independent Clarity state
- The regeneration creates a NEW message in the thread — it does not replace the original message in-place
