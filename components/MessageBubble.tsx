import React from 'react';
import { Globe } from 'lucide-react';
import { Message } from '../lib/types';
import AssistantMessage from './AssistantMessage';
import ClarityPanel from './ClarityPanel';
import FirstTimeTooltip from './FirstTimeTooltip';
import { useClarity } from '../hooks/useClarity';
import { useFirstTimeTooltip } from '../hooks/useFirstTimeTooltip';

interface MessageBubbleProps {
  message: Message;
  messageIndex: number;
  messages: Message[];
  onUpdateFlagFeedback: (messageId: string, flagId: string, feedback: 'verified' | 'not_helpful') => void;
  onToggleEdit: (messageId: string, assumptionId: string, isEditing: boolean) => void;
  onUpdateAssumption: (messageId: string, assumptionId: string, newText: string) => void;
  onRegenerate: (messageId: string) => void;
  onSubmitFeedback: (messageId: string, feedback: 'helpful' | 'somewhat' | 'not_really') => void;
}

export default function MessageBubble({
  message,
  messageIndex,
  messages,
  onUpdateFlagFeedback,
  onToggleEdit,
  onUpdateAssumption,
  onRegenerate,
  onSubmitFeedback,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const { isOpen, activeTab, setActiveTab, openPanel, closePanel, togglePanel } = useClarity();

  const assistantMessages = messages.slice(0, messageIndex + 1).filter(m => m.role === 'assistant');
  const messageNumber = assistantMessages.length;

  const hasInteractedAnywhere = messages.some(m => 
    m.clarity?.flags.some(f => f.userFeedback !== undefined) || 
    m.clarity?.assumptions.some(a => a.editedText !== undefined)
  );

  const { showTooltip, handleNudgeDismiss } = useFirstTimeTooltip(messageNumber, hasInteractedAnywhere);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} py-2`}>
      <div className={`w-full ${isUser ? 'max-w-[75%]' : 'max-w-[100%]'}`}>
        {isUser ? (
          <div className="flex flex-col items-end">
            <div className="bg-[#EEECEA] dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] text-[#1A1A19] dark:text-[#F0EFEC] px-4 py-3 rounded-[12px_12px_3px_12px] md:rounded-[16px_16px_4px_16px] shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#6B6B6A] dark:text-[#9B9B99] select-none pl-1">
              <span className="text-[#D4881E]">✦</span>
              <span>Claude</span>
              {message.isRegeneratedFrom && (
                <span className="text-[10px] bg-[#FEF3C7] dark:bg-[#3A3A38] text-[#92400E] dark:text-[#D4881E] px-1.5 py-0.5 rounded font-semibold select-none">
                  Regenerated based on corrections
                </span>
              )}
            </div>
            
            {/* Assistant message card */}
            <div className="border border-[#E5E5E3] dark:border-[#3A3A38] rounded-[12px] p-5 w-full bg-transparent relative pb-12 shadow-sm">
              <AssistantMessage 
                message={message} 
                onUpdateFlagFeedback={onUpdateFlagFeedback}
                onOpenClarityPanel={() => openPanel('confidence')}
              />
              
              {/* Web Search Sources Checked Label */}
              {message.searchPerformed && (
                <div className="flex items-center gap-1.5 mt-3 select-none text-[11px] font-semibold text-[#6B6B6A] dark:text-[#9B9B99]">
                  <Globe className="w-3.5 h-3.5 text-[#9B9B99] dark:text-[#6B6B6A]" />
                  <span>Sources checked</span>
                </div>
              )}
              
              {/* Clarity Pill Badge */}
              {message.clarity && (
                <div className="absolute bottom-3 right-4 select-none">
                  {message.clarity.isLoading ? (
                    <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-amber-50 dark:bg-[#2A2A28] border border-amber-200 dark:border-[#3A3A38] text-[#92400E] dark:text-[#D4881E] text-xs font-semibold animate-pulse">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                      ✦ Analyzing…
                    </div>
                  ) : message.clarity.isError ? (
                    <div className="py-1 px-3 rounded-full bg-[#EEECEA] dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] text-[#9B9B99] dark:text-[#6B6B6A] text-xs font-medium cursor-not-allowed">
                      ✦ Clarity unavailable
                    </div>
                  ) : (
                    <button
                      onClick={togglePanel}
                      className={`flex items-center gap-1 py-1 px-3 rounded-full transition-all text-xs font-semibold border shadow-sm ${
                        isOpen 
                          ? 'bg-[#1A1A19] dark:bg-[#F0EFEC] text-white dark:text-[#1A1A19] border-[#1A1A19] dark:border-[#F0EFEC]'
                          : 'bg-[#FEF3C7] dark:bg-[#2A2A28] text-[#92400E] dark:text-[#D4881E] hover:opacity-90 active:scale-95 border-amber-200/50 dark:border-[#3A3A38]'
                      }`}
                    >
                      ✦ Clarity
                    </button>
                  )}

                  {/* First Time Tooltip */}
                  {showTooltip && !isOpen && !message.clarity.isLoading && !message.clarity.isError && (
                    <FirstTimeTooltip onClose={handleNudgeDismiss} />
                  )}
                </div>
              )}

              {/* Clarity Panel — single instance, adapts via responsive classes inside ClarityPanel */}
              {isOpen && message.clarity && !message.clarity.isLoading && !message.clarity.isError && (
                <>
                  {/* Mobile-only overlay backdrop — tap to close */}
                  <div
                    className="md:hidden fixed inset-0 bg-black/40 z-40"
                    onClick={closePanel}
                  />
                  <ClarityPanel
                    message={message}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onClose={closePanel}
                    onUpdateFeedback={onUpdateFlagFeedback}
                    onToggleEdit={onToggleEdit}
                    onUpdateAssumption={onUpdateAssumption}
                    onRegenerate={onRegenerate}
                    onSubmitFeedback={onSubmitFeedback}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
