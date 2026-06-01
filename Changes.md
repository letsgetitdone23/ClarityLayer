Update the Confidence Flags system in the Clarity Layer with three 
improvements. These changes affect the Clarity API prompt, the 
TypeScript types, the underline rendering, and the ConfidenceTab 
component. Apply all changes exactly as described.

---

CHANGE 1 — Update the Clarity system prompt in /lib/clarityPrompt.ts

Replace the existing flags instructions entirely with this:

Each flag object must now return five fields:
{
  "id": "f1",
  "sentence": "exact sentence copied from the response",
  "reason": "one line explanation, max 15 words, plain English",
  "confidence_level": "moderate" | "low" | "critical",
  "verification_pointer": "specific source, report, or search query — max 15 words. Must name something specific like a report, database, or search query. Never say 'check online' or 'verify with a reliable source'.",
  "depends_on": "f2" | null
}

confidence_level rules:
- "critical" = load-bearing — the response conclusion changes if this is wrong
- "low" = supporting claim — relevant but not the hinge point
- "moderate" = context or colour — output remains valid even if wrong

verification_pointer rules:
- Must be a specific, actionable pointer
- Good: "Search LinkedIn Workplace Learning Report 2024"
- Good: "Check WHO Global Health Observatory database"
- Good: "Run this against your company Q3 actuals"
- Bad: "verify online", "check a reliable source"

depends_on rules:
- If this flag's claim is only true IF another flag's claim is 
  also true, put that flag's id here (e.g. "f1")
- If the claim stands independently, return null
- Use this to build dependency chains in the UI

Keep all existing assumption rules unchanged.

---

CHANGE 2 — Update TypeScript types in /lib/types.ts

Add three new fields to the ConfidenceFlag interface:
- confidence_level: 'moderate' | 'low' | 'critical'
- verification_pointer: string
- depends_on: string | null

---

CHANGE 3 — Update underline rendering in AssistantMessage.tsx

Replace the single amber underline class with three variants 
based on each flag's confidence_level:

moderate: 
  border-b-2 border-dashed border-amber-400 cursor-pointer 
  hover:bg-amber-50 dark:hover:bg-amber-950

low: 
  border-b-2 border-solid border-amber-500 cursor-pointer 
  hover:bg-amber-50 dark:hover:bg-amber-950

critical: 
  border-b-2 border-solid border-red-500 cursor-pointer 
  hover:bg-red-50 dark:hover:bg-red-950

The function that wraps flagged sentences in span tags must 
read each flag's confidence_level and apply the corresponding 
class. No other changes to how sentence matching works.

---

CHANGE 4 — Rebuild ConfidenceTab.tsx entirely

The new ConfidenceTab has three upgrades:

A) Dependency chain grouping:
Before rendering, group flags into a tree:
- Root flags: flags where depends_on is null
- Child flags: flags where depends_on matches a root flag's id
- Render each root flag first, then its children indented 
  beneath it with a dashed left border and 
  "depends on above" label in 10px uppercase gray

B) Per-flag layout (each flag card):
Each flag renders as a card with:
- Left border 3px solid, color matches confidence_level:
    critical → red-500
    low → amber-500  
    moderate → gray-300
- Background tint:
    critical → bg-red-50 dark:bg-red-950
    low → bg-amber-50 dark:bg-amber-950
    moderate → bg-gray-50 dark:bg-gray-900
- Top-right: colored dot (same color logic) + label text:
    critical → red dot + "Critical"
    low → amber dot + "Should verify"
    moderate → gray dot + "Worth checking"
- The flagged sentence in italic, 13px, gray
- The reason text below, 12px, lighter gray
- Verification pointer section: 
    White bg inner box with rounded corners and light border
    Left label: "Verify via" in 10px uppercase gray
    Right: the verification_pointer text in 12px
- Two action buttons below:
    "Mark as verified" → on click turns underline green 
      and button becomes filled green
    "Not helpful" → ghost text, grays out the flag

C) Summary bar above flags:
Shows "N flags" and if any are critical: 
"· N critical — verify before acting" in red-600 font-medium

If flags array is empty, show:
"✓ No uncertain claims in this response" 
centered, green-600, 14px font-medium

---

CHANGE 5 — Update InlinePopover.tsx

The popover that appears on clicking an underlined sentence 
must now also show:
- The confidence_level label (Critical / Should verify / 
  Worth checking) with its colored dot — same styling as the 
  flag card header
- The verification_pointer below the reason text, 
  in a small inset box labeled "Verify via"

The popover now has four pieces of information:
1. "Claude is less certain here" header
2. The sentence in italic
3. The reason
4. "Verify via: [verification_pointer]"

Keep the same two action buttons: "See all flags" and 
"✓ Helpful"

---

CHANGE 6 — Update architecture doc

In clarity-layer-architecture.md, update Section 8 
(Clarity Panel — ConfidenceTab) to document:
- Three confidence levels and their visual treatments
- Verification pointer field and rendering
- Dependency chain grouping logic
- Updated Clarity system prompt fields

Add to Section 5 (Groq API — Clarity Prompt):
New fields added to flag object: confidence_level, 
verification_pointer, depends_on