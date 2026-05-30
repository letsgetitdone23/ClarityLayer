// lib/types.ts

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  clarity?: ClarityData
  isRegeneratedFrom?: string   // id of original message if this is a regeneration
  searchPerformed?: boolean    // true if web search was used
}

export interface ClarityData {
  flags: ConfidenceFlag[]
  assumptions: Assumption[]
  isLoading: boolean
  feedbackGiven?: 'helpful' | 'somewhat' | 'not_really'
  isError?: boolean
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
  isStatic?: boolean           // true if it cannot be edited
  impact?: 'high' | 'medium' | 'low'
  suggestions?: string[]
}

export interface Chat {
  id: string
  title: string                // first user message truncated to 40 chars
  messages: Message[]
  createdAt: Date
}
