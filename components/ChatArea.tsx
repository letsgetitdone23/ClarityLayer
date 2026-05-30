import React, { useRef, useEffect, useState } from 'react';
import {
  ArrowUp,
  Settings,
  Plus,
  Mic,
  ChevronDown,
  GraduationCap,
  PenTool,
  TrendingUp,
  Code,
  Coffee,
  X,
  Info
} from 'lucide-react';
import { Message } from '../lib/types';
import MessageBubble from './MessageBubble';
import ThemeToggle from './ThemeToggle';

interface ChatAreaProps {
  userName?: string;
  messages: Message[];
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  isSearchingWeb: boolean;
  onUpdateFlagFeedback: (messageId: string, flagId: string, feedback: 'verified' | 'not_helpful') => void;
  onToggleEdit: (messageId: string, assumptionId: string, isEditing: boolean) => void;
  onUpdateAssumption: (messageId: string, assumptionId: string, newText: string) => void;
  onRegenerate: (messageId: string) => void;
  onSubmitFeedback: (messageId: string, feedback: 'helpful' | 'somewhat' | 'not_really') => void;
}

/* Custom SVG Waveform Icon to match the Page 2 mockup */
const WaveformIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#9B9B99] hover:text-[#3D3D3C] dark:hover:text-[#F0EFEC] cursor-pointer fill-current shrink-0">
    <path d="M4 9h2v6H4zm3-2h2v10H7zm3 4h2v2h-2zm3-6h2v16h-2zm3 3h2v10h-2zm3 3h2v4h-2z" />
  </svg>
);

/* Amber sparkle icon */
const Sparkle = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0c.5 6 5.5 11 12 12-6.5.5-11.5 5.5-12 12-.5-6-5.5-11-12-12 6.5-.5 11.5-5.5 12-12z" />
  </svg>
);

export default function ChatArea({
  userName,
  messages,
  inputText,
  setInputText,
  onSendMessage,
  isTyping,
  isSearchingWeb,
  onUpdateFlagFeedback,
  onToggleEdit,
  onUpdateAssumption,
  onRegenerate,
  onSubmitFeedback,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInputText(suggestionText);
    textareaRef.current?.focus();
  };

  const handleSeeHowItWorks = () => {
    setShowBanner(false);
    setShowInfoModal(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EEECEA] dark:bg-[#1A1A19] overflow-hidden relative font-sans">
      {/* Top Header Bar */}
      <header className="h-11 flex items-center justify-between px-5 bg-[#EEECEA] dark:bg-[#1A1A19] border-b border-transparent dark:border-b-[#3A3A38] relative z-20 flex-shrink-0 select-none">
        <div className="flex-1" />
        {/* Clarity Layer active indicator — top center */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#B45309] font-medium">
          <Sparkle className="w-3 h-3 text-[#D4881E]" />
          <span>Clarity Layer active</span>
        </div>
        <div className="flex-1 flex justify-end items-center gap-3">
          <span className="text-[12px] text-[#9B9B99] font-medium">
            Free plan <span className="mx-1 text-[#D1D1CF] dark:text-[#3A3A38]">·</span>{' '}
            <button className="text-[#1A1A19] dark:text-[#F0EFEC] hover:underline transition-colors font-semibold">Upgrade</button>
          </span>
          <ThemeToggle />
          <button className="p-1 hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-md transition-colors text-[#9B9B99] hover:text-[#3D3D3C] dark:hover:text-[#F0EFEC]">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main chat thread or welcome empty state */}
      <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar flex flex-col">
        {messages.length === 0 ? (
          /* ──── Welcome Empty State (Page 2 design) ──── */
          <div className="flex-1 flex flex-col items-center justify-center max-w-[700px] mx-auto w-full px-6 py-8 gap-6 my-auto select-none">
            {/* Greeting heading */}
            <h1 className="text-[38px] font-serif font-normal text-[#1A1A19] dark:text-[#F0EFEC] tracking-tight text-center leading-[1.2]">
              <Sparkle className="w-6 h-6 text-[#D4881E] inline-block align-baseline mr-2 -mt-1" />
              <span className="text-[#D4881E]">Hey {userName || 'there'},</span>{' '}
              what are we thinking through today?
            </h1>

            {/* Chat input container */}
            <form onSubmit={handleSubmit} className="w-full max-w-[660px] relative">
              <div className="relative flex flex-col border border-[#E5E5E3] dark:border-[#3A3A38] focus-within:border-[#C5C5C3] dark:focus-within:border-[#6B6B6A] rounded-2xl bg-white dark:bg-[#2A2A28] p-4 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)] transition-all duration-200">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="How can I help you today?"
                  className="w-full bg-transparent border-0 outline-none focus:ring-0 resize-none text-[15px] leading-relaxed max-h-40 px-1 py-1 text-[#1A1A19] dark:text-[#F0EFEC] placeholder:text-[#B5B5B3] dark:placeholder-[#6B6B6A] placeholder:font-normal"
                />

                {/* Bottom controls bar */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0F0EE] dark:border-[#3A3A38]">
                  <div className="flex items-center">
                    <button type="button" className="p-1 hover:bg-[#F0F0EE] dark:hover:bg-[#2F2F2D] rounded-full transition-colors text-[#9B9B99] hover:text-[#6B6B6A] dark:hover:text-[#F0EFEC]">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Model selector pill */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F7F7F5] dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] hover:bg-[#EFEFED] dark:hover:bg-[#2F2F2D] transition-all cursor-pointer">
                      <div className="flex flex-col text-left leading-none">
                        <span className="text-[11px] font-semibold text-[#3D3D3C] dark:text-[#F0EFEC] leading-none">Sonnet</span>
                        <span className="text-[9px] text-[#9B9B99] dark:text-[#6B6B6A] font-bold leading-none mt-[2px]">4.6</span>
                      </div>
                      <div className="flex items-center gap-0.5 border-l border-[#E5E5E3] dark:border-[#3A3A38] pl-1.5 h-4">
                        <span className="text-[9px] font-bold text-[#9B9B99] dark:text-[#6B6B6A] uppercase tracking-wider leading-none">Low</span>
                        <ChevronDown className="w-3 h-3 text-[#9B9B99] dark:text-[#6B6B6A]" />
                      </div>
                    </div>

                    <button type="button" className="p-1 hover:bg-[#F0F0EE] dark:hover:bg-[#2F2F2D] rounded-full transition-colors text-[#9B9B99] hover:text-[#6B6B6A] dark:hover:text-[#F0EFEC]">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button type="button" className="p-1 hover:bg-[#F0F0EE] dark:hover:bg-[#2F2F2D] rounded-full transition-colors">
                      <WaveformIcon />
                    </button>

                    {inputText.trim() && (
                      <button
                        type="submit"
                        className="p-1.5 rounded-full bg-[#1A1A19] dark:bg-[#F0EFEC] text-white dark:text-[#1A1A19] hover:bg-black/90 dark:hover:bg-white/90 active:scale-95 transition-all shadow-sm flex items-center justify-center"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>

            {/* Quick Actions Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 select-none">
              <button
                onClick={() => handleSuggestionClick("Can you explain a complex concept simply?")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] hover:bg-[#F7F7F5] dark:hover:bg-[#2F2F2D] rounded-full text-[12px] font-medium text-[#6B6B6A] dark:text-[#9B9B99] cursor-pointer transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#9B9B99]" />
                <span>Learn</span>
              </button>
              <button
                onClick={() => handleSuggestionClick("Can you help me draft a professional email?")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] hover:bg-[#F7F7F5] dark:hover:bg-[#2F2F2D] rounded-full text-[12px] font-medium text-[#6B6B6A] dark:text-[#9B9B99] cursor-pointer transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <PenTool className="w-3.5 h-3.5 text-[#9B9B99]" />
                <span>Write</span>
              </button>
              <button
                onClick={() => handleSuggestionClick("Can you help me plan a business strategy for a new startup?")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] hover:bg-[#F7F7F5] dark:hover:bg-[#2F2F2D] rounded-full text-[12px] font-medium text-[#6B6B6A] dark:text-[#9B9B99] cursor-pointer transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#9B9B99]" />
                <span>Strategize</span>
              </button>
              <button
                onClick={() => handleSuggestionClick("Can you help me debug a React useEffect issue?")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] hover:bg-[#F7F7F5] dark:hover:bg-[#2F2F2D] rounded-full text-[12px] font-medium text-[#6B6B6A] dark:text-[#9B9B99] cursor-pointer transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <Code className="w-3.5 h-3.5 text-[#9B9B99]" />
                <span>Code</span>
              </button>
              <button
                onClick={() => handleSuggestionClick("Can you suggest a healthy weekly meal prep plan?")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] hover:bg-[#F7F7F5] dark:hover:bg-[#2F2F2D] rounded-full text-[12px] font-medium text-[#6B6B6A] dark:text-[#9B9B99] cursor-pointer transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <Coffee className="w-3.5 h-3.5 text-[#9B9B99]" />
                <span>Life stuff</span>
              </button>
            </div>
          </div>
        ) : (
          /* ──── Scrollable Message Thread ──── */
          <div className="flex-1 px-6 py-8">
            <div className="max-w-[720px] mx-auto w-full space-y-6">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  messageIndex={index}
                  messages={messages}
                  onUpdateFlagFeedback={onUpdateFlagFeedback}
                  onToggleEdit={onToggleEdit}
                  onUpdateAssumption={onUpdateAssumption}
                  onRegenerate={onRegenerate}
                  onSubmitFeedback={onSubmitFeedback}
                />
              ))}

              {isSearchingWeb && (
                <div className="flex items-center space-x-2 text-[#9B9B99] dark:text-[#6B6B6A] text-xs pl-2 select-none">
                  <span className="animate-spin text-[11px]">🔍</span>
                  <span className="italic">Searching the web...</span>
                </div>
              )}

              {isTyping && !isSearchingWeb && (
                <div className="flex items-center space-x-2 text-[#9B9B99] dark:text-[#6B6B6A] text-xs pl-2 select-none">
                  <div className="w-1.5 h-1.5 bg-[#9B9B99] dark:bg-[#6B6B6A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#9B9B99] dark:bg-[#6B6B6A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#9B9B99] dark:bg-[#6B6B6A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="italic pl-1">Claude is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Docked bottom input bar (only visible when there are messages) */}
      {messages.length > 0 && (
        <div className="bg-[#EEECEA] dark:bg-[#1A1A19] border-t border-[#E5E5E3] dark:border-t-[#3A3A38] px-6 py-4 relative z-10">
          <form onSubmit={handleSubmit} className="max-w-[720px] mx-auto w-full relative">
            <div className="relative flex flex-col border border-[#E5E5E3] dark:border-[#3A3A38] focus-within:border-[#C5C5C3] dark:focus-within:border-[#6B6B6A] rounded-2xl bg-white dark:bg-[#2A2A28] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200">
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Claude..."
                className="w-full bg-transparent border-0 outline-none focus:ring-0 resize-none text-[15px] leading-relaxed max-h-40 px-2 py-1.5 text-[#1A1A19] dark:text-[#F0EFEC] placeholder:text-[#B5B5B3] dark:placeholder-[#6B6B6A] placeholder:font-normal"
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0F0EE] dark:border-[#3A3A38]">
                <div className="flex items-center">
                  <button type="button" className="p-1 hover:bg-[#F0F0EE] dark:hover:bg-[#2F2F2D] rounded-full transition-colors text-[#9B9B99] hover:text-[#6B6B6A] dark:hover:text-[#F0EFEC]">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F7F7F5] dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] text-[9px] font-semibold text-[#6B6B6A] dark:text-[#9B9B99]">
                    <span>Sonnet 4.6</span>
                  </div>
                  <button type="button" className="p-0.5 text-[#9B9B99] hover:text-[#6B6B6A] dark:hover:text-[#F0EFEC]">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-0.5">
                    <WaveformIcon />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`p-1.5 rounded-full transition-all duration-200 flex-shrink-0 flex items-center justify-center shadow-sm ${
                      inputText.trim()
                        ? 'bg-[#1A1A19] dark:bg-[#F0EFEC] text-white dark:text-[#1A1A19] hover:bg-black/90 dark:hover:bg-white/90 active:scale-95'
                        : 'bg-[#F0F0EE] dark:bg-[#1F1F1E] text-[#D1D1CF] dark:text-[#6B6B6A] cursor-not-allowed border border-[#E5E5E3] dark:border-[#3A3A38] shadow-none'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ──── Bottom Clarity Layer Banner (dismissible) ──── */}
      {showBanner && (
        <div className="bg-[#EEECEA] dark:bg-[#1A1A19] px-6 pb-5 pt-1 flex justify-center items-center select-none flex-shrink-0">
          <div className="bg-white dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] rounded-xl px-4 py-3 flex items-center justify-between w-full max-w-[720px] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2.5 text-[12px] text-[#6B6B6A] dark:text-[#9B9B99] leading-snug flex-1 min-w-0">
              <Sparkle className="w-3.5 h-3.5 text-[#D4881E] flex-shrink-0" />
              <Info className="w-3.5 h-3.5 text-[#9B9B99] dark:text-[#6B6B6A] flex-shrink-0" />
              <span className="dark:text-[#F0EFEC]">
                This is a new trial feature — <strong className="text-[#1A1A19] dark:text-[#F0EFEC] font-semibold">Clarity Layer</strong>, designed to improve transparency, reasoning visibility, and user trust during AI conversations.
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <button
                onClick={handleSeeHowItWorks}
                className="text-[12px] text-[#B45309] font-semibold hover:underline whitespace-nowrap"
              >
                See how it works →
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="p-0.5 hover:bg-[#F0F0EE] dark:hover:bg-[#2F2F2D] rounded transition-colors text-[#9B9B99] hover:text-[#6B6B6A] dark:hover:text-[#F0EFEC]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──── Information Modal ──── */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-[#1A1A19]/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#2A2A28] rounded-[20px] max-w-md w-full border border-[#E5E5E3] dark:border-[#3A3A38] p-6 shadow-2xl animate-fade-in flex flex-col relative select-none">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-[#EFEFED] dark:hover:bg-[#2F2F2D] rounded-md transition-colors text-[#6B6B6A] dark:text-[#9B9B99] hover:text-[#1A1A19] dark:hover:text-[#F0EFEC]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[#B45309] mb-4">
              <Sparkle className="w-5 h-5 text-[#D4881E]" />
              <h3 className="text-lg font-serif font-bold text-[#1A1A19] dark:text-[#F0EFEC]">Clarity Layer</h3>
            </div>

            <div className="space-y-4 text-[13px] text-[#6B6B6A] dark:text-[#9B9B99] leading-relaxed font-sans font-medium">
              <p>
                The Clarity Layer prototype introduces two visibility signals directly on Claude&apos;s responses to help you evaluate and guide AI outputs:
              </p>

              <div className="p-3 bg-amber-50/30 dark:bg-[#1F1F1E] border border-amber-200/50 dark:border-[#3A3A38] rounded-xl space-y-2">
                <h4 className="font-bold text-[#92400E] flex items-center gap-1.5">
                  <span className="inline-block border-b-2 border-amber-400 leading-none">1. Confidence Underlines</span>
                </h4>
                <p className="text-[12px]">
                  Claims or sentences where Claude is less certain are underlined in amber. Click any underline to view a detailed context explanation.
                </p>
              </div>

              <div className="p-3 bg-amber-50/30 dark:bg-[#1F1F1E] border border-amber-200/50 dark:border-[#3A3A38] rounded-xl space-y-2">
                <h4 className="font-bold text-[#92400E] flex items-center gap-1.5">
                  <span>2. Context Assumptions</span>
                </h4>
                <p className="text-[12px]">
                  Open the Clarity panel to see what assumptions Claude made about your target goals. You can directly edit those assumptions and regenerate a response.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#1A1A19] dark:bg-[#F0EFEC] text-white dark:text-[#1A1A19] hover:bg-black/90 dark:hover:bg-white/90 font-medium text-[13px] transition-all flex items-center justify-center"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
