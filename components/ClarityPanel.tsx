import React from 'react';
import { X } from 'lucide-react';
import { Message } from '../lib/types';
import ConfidenceTab from './ConfidenceTab';
import AssumptionsTab from './AssumptionsTab';
import FeedbackBar from './FeedbackBar';

interface ClarityPanelProps {
  message: Message;
  activeTab: 'confidence' | 'assumptions';
  onTabChange: (tab: 'confidence' | 'assumptions') => void;
  onClose: () => void;
  onUpdateFeedback: (messageId: string, flagId: string, feedback: 'verified' | 'not_helpful') => void;
  onToggleEdit: (messageId: string, assumptionId: string, isEditing: boolean) => void;
  onUpdateAssumption: (messageId: string, assumptionId: string, newText: string) => void;
  onRegenerate: (messageId: string) => void;
  onSubmitFeedback: (messageId: string, feedback: 'helpful' | 'somewhat' | 'not_really') => void;
  isMobile?: boolean;
}

export default function ClarityPanel({
  message,
  activeTab,
  onTabChange,
  onClose,
  onUpdateFeedback,
  onToggleEdit,
  onUpdateAssumption,
  onRegenerate,
  onSubmitFeedback,
  isMobile = false,
}: ClarityPanelProps) {
  const flags = message.clarity?.flags || [];
  const assumptions = message.clarity?.assumptions || [];

  const hasInteracted = 
    flags.some(f => f.userFeedback !== undefined) || 
    assumptions.some(a => a.editedText !== undefined) ||
    message.clarity?.feedbackGiven !== undefined;

  if (isMobile) {
    return (
      <div className="bg-white dark:bg-[#2A2A28] border-t-2 border-[#D4881E] rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] flex flex-col max-h-[70vh] z-20">
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-0 border-b border-[#E5E5E3] dark:border-b-[#3A3A38] select-none flex-shrink-0">
          <div className="flex space-x-5 text-sm">
            <button
              onClick={() => onTabChange('confidence')}
              className={`pb-2.5 font-semibold border-b-2 transition-all ${
                activeTab === 'confidence'
                  ? 'border-[#D4881E] text-[#1A1A19] dark:text-[#F0EFEC]'
                  : 'border-transparent text-[#6B6B6A] dark:text-[#6B6B6A] hover:text-[#1A1A19] dark:hover:text-[#F0EFEC]'
              }`}
            >
              Confidence Flags ({flags.length})
            </button>
            <button
              onClick={() => onTabChange('assumptions')}
              className={`pb-2.5 font-semibold border-b-2 transition-all ${
                activeTab === 'assumptions'
                  ? 'border-[#D4881E] text-[#1A1A19] dark:text-[#F0EFEC]'
                  : 'border-transparent text-[#6B6B6A] dark:text-[#6B6B6A] hover:text-[#1A1A19] dark:hover:text-[#F0EFEC]'
              }`}
            >
              Assumptions Made ({assumptions.length})
            </button>
          </div>
          <button
            onClick={onClose}
            className="pb-2.5 min-h-[44px] flex items-center text-[#9B9B99] dark:text-[#6B6B6A] hover:text-[#1A1A19] dark:hover:text-[#F0EFEC] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Panel Content */}
        <div className="flex-grow overflow-y-auto px-5 py-4 min-h-0 bg-white dark:bg-[#2A2A28]">
          {activeTab === 'confidence' ? (
            <ConfidenceTab
              flags={flags}
              messageId={message.id}
              onUpdateFeedback={onUpdateFeedback}
            />
          ) : (
            <AssumptionsTab
              assumptions={assumptions}
              messageId={message.id}
              onToggleEdit={onToggleEdit}
              onUpdateAssumption={onUpdateAssumption}
              onRegenerate={(id) => {
                onRegenerate(id);
                onClose();
              }}
            />
          )}
        </div>

        {/* Sticky Feedback Bar */}
        {hasInteracted && (
          <div className="px-5 border-t border-[#E5E5E3] dark:border-[#3A3A38] bg-white dark:bg-[#2A2A28] flex-shrink-0">
            <FeedbackBar
              messageId={message.id}
              feedbackGiven={message.clarity?.feedbackGiven}
              onSubmitFeedback={onSubmitFeedback}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#2A2A28] border-t-2 border-[#D4881E] rounded-b-[12px] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)] flex flex-col z-20 transition-all duration-300 transform translate-y-0 max-h-[400px]">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 pt-3 border-b border-[#E5E5E3] dark:border-b-[#3A3A38] select-none">
        {/* Tabs */}
        <div className="flex space-x-5 text-sm">
          <button
            onClick={() => onTabChange('confidence')}
            className={`pb-2.5 font-semibold border-b-2 transition-all ${
              activeTab === 'confidence'
                ? 'border-[#D4881E] text-[#1A1A19] dark:text-[#F0EFEC]'
                : 'border-transparent text-[#6B6B6A] dark:text-[#6B6B6A] hover:text-[#1A1A19] dark:hover:text-[#F0EFEC]'
            }`}
          >
            Confidence Flags ({flags.length})
          </button>
          
          <button
            onClick={() => onTabChange('assumptions')}
            className={`pb-2.5 font-semibold border-b-2 transition-all ${
              activeTab === 'assumptions'
                ? 'border-[#D4881E] text-[#1A1A19] dark:text-[#F0EFEC]'
                : 'border-transparent text-[#6B6B6A] dark:text-[#6B6B6A] hover:text-[#1A1A19] dark:hover:text-[#F0EFEC]'
            }`}
          >
            Assumptions Made ({assumptions.length})
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="pb-2.5 text-[#9B9B99] dark:text-[#6B6B6A] hover:text-[#1A1A19] dark:hover:text-[#F0EFEC] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Panel Content */}
      <div className="flex-grow overflow-y-auto px-5 py-4 min-h-0 bg-white dark:bg-[#2A2A28]">
        {activeTab === 'confidence' ? (
          <ConfidenceTab
            flags={flags}
            messageId={message.id}
            onUpdateFeedback={onUpdateFeedback}
          />
        ) : (
          <AssumptionsTab
            assumptions={assumptions}
            messageId={message.id}
            onToggleEdit={onToggleEdit}
            onUpdateAssumption={onUpdateAssumption}
            onRegenerate={(id) => {
              onRegenerate(id);
              onClose();
            }}
          />
        )}
      </div>

      {/* Sticky Feedback Bar at the bottom */}
      {hasInteracted && (
        <div className="px-5 border-t border-[#E5E5E3] dark:border-[#3A3A38] bg-white dark:bg-[#2A2A28]">
          <FeedbackBar
            messageId={message.id}
            feedbackGiven={message.clarity?.feedbackGiven}
            onSubmitFeedback={onSubmitFeedback}
          />
        </div>
      )}
    </div>
  );
}
