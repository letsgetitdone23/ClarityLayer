# Clarity Layer — Full Architecture Documentation

## 1. Project Overview
Clarity Layer is an advanced chat interface designed to explicitly model AI uncertainty and expose the hidden context assumptions LLMs make. Built with Next.js (App Router), React, Tailwind CSS, and the Groq API (running `llama-3.3-70b-versatile`), the application introduces a post-generation analysis step. Every assistant response is analyzed to flag uncertain sentences and list assumptions, allowing users to correct their context and regenerate answers.

## 2. File Structure

- `/app/page.tsx` — Next.js entry point; renders the `ChatInterface`.
- `/app/globals.css` — Global CSS variables and Tailwind directives.
- `/app/api/chat/route.ts` — API endpoint handling streaming chat completions via Groq.
- `/app/api/clarity/route.ts` — API endpoint running the post-generation Clarity analysis via Groq.
- `/components/ChatInterface.tsx` — Main wrapper; handles onboarding check, toast notifications, and layout split.
- `/components/Onboarding.tsx` — Landing screen for capturing user's name on first load.
- `/components/Sidebar.tsx` — Left sidebar rendering in-memory session history and "New Chat" controls.
- `/components/ChatArea.tsx` — Main container for the message thread and user input box.
- `/components/MessageBubble.tsx` — Renders individual messages, handles markdown parsing, inline popovers, and Clarity integration.
- `/components/ClarityPanel.tsx` — Collapsible panel attached to AI messages housing Confidence and Assumptions tabs.
- `/components/ConfidenceTab.tsx` — Tab rendering uncertain sentences with feedback toggles.
- `/components/AssumptionsTab.tsx` — Tab rendering AI assumptions with inline editing and regeneration triggers.
- `/components/FeedbackBar.tsx` — Global feedback footer shown on AI messages.
- `/components/InlinePopover.tsx` — Floating tooltip for underlined uncertain sentences in the message body.
- `/components/FirstTimeTooltip.tsx` — Educational tooltip attached to the first Clarity pill.
- `/components/ThemeToggle.tsx` — Small Sun/Moon theme toggle button to switch modes.
- `/hooks/useChat.ts` — Core React hook managing session history, message streaming, and clarity state updates.
- `/hooks/useTheme.tsx` — Theme context custom hook for global theme preference sync and toggling.
- `/lib/types.ts` — TypeScript interfaces (`Chat`, `Message`, `ClarityData`, `ConfidenceFlag`, `Assumption`).
- `/lib/chatPrompt.ts` — Contains the main chat system instructions.
- `/lib/clarityPrompt.ts` — Contains the strict JSON instruction prompt for the Clarity analysis model.

## 3. Phase 1 — UI Shell
- **What was built**: A split-pane layout featuring a fixed-width `Sidebar` and a flexible `ChatArea`.
- **Key Components**: `ChatInterface` (container), `Sidebar` (navigation), `ChatArea` (thread view).
- **State managed**: `currentChatId` determines the active conversation view.

## 4. Phase 2 — Groq Chat Integration
- **What was built**: `/api/chat/route.ts` connects to Groq using the `llama-3.3-70b-versatile` model.
- **API details**: Filters client-side message properties and injects a robust system prompt for behavior.
- **Streaming implementation approach**: The endpoint uses `ReadableStream` and `TextEncoder` to stream chunks in real-time. In `useChat.ts`, `response.body.getReader()` decodes chunks and iteratively updates the `accumulatedText` state, rendering a smooth typing effect.

## 5. Phase 3 — Clarity Core
- **What was built**: `/api/clarity/route.ts` runs automatically when the chat stream completes.
- **Clarity system prompt**: Instructs the model to identify uncertain sentences and hidden context assumptions. The prompt explicitly requests `"impact"` and `"suggestions"` fields on every returned assumption:
```text
You are a clarity analysis engine. Given an AI response and the user's original prompt, you must:

1. Identify sentences in the response that contain uncertain, estimated, potentially outdated, or unverifiable claims.
2. Identify assumptions the AI made about the user's context, intent, domain, audience, or constraints that were NOT explicitly stated in the prompt.

Return ONLY valid JSON in this exact format:
{
  "flags": [ ... ],
  "assumptions": [
    {
      "id": "a1",
      "text": "Claude assumed...",
      "impact": "high" | "medium" | "low",
      "suggestions": [ ... ]
    }
  ]
}
```
- **Sentence matching logic**: Uses `accumulatedText.indexOf(f.sentence)` to find character indices in the frontend state, which are then used to underline matching substrings inside `MessageBubble`.
- **ClarityData state shape**:
```typescript
export interface ClarityData {
  flags: ConfidenceFlag[]
  assumptions: Assumption[]
  isLoading: boolean
  feedbackGiven?: 'helpful' | 'somewhat' | 'not_really'
  isError?: boolean
}
```

## 6. Phase 4 — Clarity Panel (Clarity Analysis API)
- **What was built**: `ClarityPanel` renders dynamically below messages. It groups `ConfidenceTab` and `AssumptionsTab`.
- **Assumption object schema**:
```json
{
  "id": "a1",
  "text": "Claude assumed your audience is general professionals",
  "impact": "high" | "medium" | "low",
  "suggestions": ["Domain experts", "Students", "Executive audience"]
}
```
- **Regeneration implementation**: When a user edits an assumption and requests regeneration, `useChat` fires `regenerateWithCorrections`. This slices the message history up to the original user prompt and injects the edited assumptions into the system prompt:
  `[CONTEXT CORRECTION]: The user has clarified/corrected their context. You MUST adjust your reasoning and subsequent answers to align with these corrections: ...`
- **Panel animation**: Handled via local CSS transitions on height and opacity toggles based on an `isOpen` state in `MessageBubble`.

## 7. Phase 5 — Polish
- **FirstTimeTooltip**: Uses `localStorage` to display a pulsing tooltip over the Clarity pill the very first time an analysis completes.
- **FeedbackBar**: Appears at the bottom of assistant messages only when `isLoading` is false, collecting user sentiment (Helpful / Somewhat / Not Really).
- **Edge cases handled**: Graceful error UI fallback if the Clarity API times out or hallucinates invalid JSON.

## 8. Additional Changes (Post-Phase 5)
- **AssumptionsTab — Updated Editing Flow (Phase 4 — Clarity Panel)**:
  - Each assumption shows impact level (high/medium/low) as colored dot + label
  - Clicking ✎ Change expands edit area with two inputs:
    a) Smart suggestion chips (2-3 alternatives from Clarity API) — tap to select instantly, amber filled when selected
    b) "Something else?" free text input — type own correction, chip-and-text are mutually exclusive
  - Cancel collapses edit area without saving
  - Regenerate button inactive until at least one correction made
  - Active state: amber button "Regenerate with corrections →"
  - Inactive state: gray button "Select or type a correction above"
  - Regeneration injects: "original → correction" pairs into Groq system prompt
- **UI Design Implementation & Flow Wiring**: Imported the provided UI designs (Page 1 and Page 2) and implemented the following wired flow:
  1. **App loads**: `ChatInterface.tsx` checks `localStorage` for `clarity_user_name`. If missing, it shows the Landing Page (`Onboarding.tsx`).
  2. **Name Entry**: User enters their name and clicks "Let's go". This saves the name to `localStorage` and transitions seamlessly to the Home screen.
  3. **Home Screen Greeting**: `ChatArea.tsx` dynamically uses the saved name in the empty state greeting ("Hey [name], what are we thinking through today?").
  4. **Active Chat Transition**: Sending a message immediately transitions to the active chat view, triggering the exact Clarity Layer behavior (streaming Groq response followed by the background Clarity analysis) built in earlier phases, preserving all functionality with the new UI wrapper on top.
- **Session Chat History**: Stored strictly in-memory (`useState<Chat[]>`) in `useChat.ts`. It correctly resets on full page refresh. The `Sidebar` automatically populates the history. The active chat is styled distinctly with a `#EFEFED` background and a `#F59E0B` (amber) left border. 
- **New Chat Toast**: Triggered in `ChatInterface.tsx`. Uses fixed positioning, `#1A1A19` text, and a `Sparkles` icon. It slides in via a CSS keyframe animation and auto-dismisses after 2.5 seconds. Rapid consecutive clicks clear and reset the timeout to prevent toast stacking.
- **Light/Dark Mode Theme System**: Integrated a React Context-based `ThemeProvider` wrapper around the root node. It detects system preferences via `window.matchMedia` on initial load, persists user choices to `localStorage` under `clarity_theme`, and toggles the `dark` class on the `<html>` element. All styling uses Tailwind CSS `dark:` classes combined with a global transition transition rule in `globals.css` to allow smooth theme switches.
- **Real-Time Web Search Integration**: Implemented a two-step response generation pipeline. The server-side API classifier detects if a user query requires real-time or time-sensitive information. If so, it queries the Tavily Search API (with a 3-second safety timeout) and prepends the live search results as context in the system prompt. The UI shows a transient "Searching the web..." indicator, a permanent "Sources checked" label beneath the response, and injects a static, non-editable "Claude used live web search results to answer this question" assumption into the Clarity tab.

## 9. Environment Variables
- **`GROQ_API_KEY`**: Required environment variable stored in `.env.local` for Groq API chat streaming and clarity analysis.
- **`TAVILY_API_KEY`**: Required environment variable stored in `.env.local` to access the Tavily Search API for real-time web search capabilities.

## 10. Key Design Decisions
- **Why Clarity runs as a separate API call**: LLMs struggle to output complex structured JSON in the exact same stream as freeform prose. A two-pass architecture (stream response -> fire background clarity analysis) guarantees immediate perceived performance (fast TTFB) while accurately parsing logic behind the scenes.
- **Why state is in-memory only**: To focus tightly on frontend UX and logic flows without the overhead of database schema syncs and authentication overhead during the prototyping phase.
- **Why the panel is attached to the message card**: Attaching the panel directly to the specific conversational turn maintains strict temporal context. If it were a global sidebar, scrolling up to read previous turns would disconnect the user from the assumptions the AI made at that specific point in time.

## 11. Deployment Strategy
- **Frontend Infrastructure**: The Next.js client-side application (UI components, styling, and session management) will be deployed on **Vercel** to leverage its optimized edge network and seamless Next.js integration.
- **Backend Infrastructure**: The core AI orchestration, data ingestion, and API routes will be decoupled and hosted on **Streamlit**. This separation of concerns allows the heavier backend processes to run independently of the Vercel edge environment.
