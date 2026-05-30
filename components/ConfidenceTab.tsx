import React from 'react';
import { Check, Trash2, AlertCircle } from 'lucide-react';
import { ConfidenceFlag } from '../lib/types';

interface ConfidenceTabProps {
  flags: ConfidenceFlag[];
  messageId: string;
  onUpdateFeedback: (messageId: string, flagId: string, feedback: 'verified' | 'not_helpful') => void;
}

export default function ConfidenceTab({
  flags,
  messageId,
  onUpdateFeedback,
}: ConfidenceTabProps) {
  if (!flags || flags.length === 0) {
    return (
      <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-2 select-none">
        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 flex items-center justify-center text-green-600 dark:text-green-500 text-lg font-semibold">
          ✓
        </div>
        <p className="text-sm font-semibold text-green-700 dark:text-green-500">
          No uncertain claims in this response
        </p>
        <p className="text-xs text-[#6B6B6A] dark:text-[#9B9B99]">
          Claude generated this answer without flagging any low-confidence claims.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {flags.map((flag) => {
        const isVerified = flag.userFeedback === 'verified';
        const isNotHelpful = flag.userFeedback === 'not_helpful';

        return (
          <div
            key={flag.id}
            className={`border-l-4 border-y border-r border-[#E5E5E3] dark:border-[#3A3A38] rounded-r-lg p-3 text-[13px] leading-relaxed transition-all duration-150 ${
              isVerified
                ? 'border-l-green-600 bg-green-50/20 dark:bg-green-950/10'
                : isNotHelpful
                ? 'border-l-gray-300 bg-gray-50/30 dark:bg-[#1F1F1E]/50 opacity-60'
                : 'border-l-[#D4881E] bg-[#FFFBEB] dark:bg-[#1F1F1E]'
            }`}
          >
            {/* Flagged sentence */}
            <div className={`italic font-medium text-[#1A1A19] dark:text-[#F0EFEC] mb-1 ${isNotHelpful ? 'line-through' : ''}`}>
              &ldquo;{flag.sentence}&rdquo;
            </div>

            {/* Rationale explanation */}
            <div className="text-xs text-[#6B6B6A] dark:text-[#9B9B99] flex items-start gap-1 mb-2.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-70" />
              <span>{flag.reason}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 pt-1.5 border-t border-dashed border-gray-200/50 dark:border-[#3A3A38]">
              <button
                onClick={() => onUpdateFeedback(messageId, flag.id, 'verified')}
                disabled={isVerified}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-semibold transition-all border ${
                  isVerified
                    ? 'bg-green-600 border-green-600 text-white cursor-default dark:bg-green-700 dark:border-green-700'
                    : 'bg-white dark:bg-[#2A2A28] border-[#D1D1CF] dark:border-[#3A3A38] text-[#6B6B6A] dark:text-[#9B9B99] hover:text-green-700 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20'
                }`}
              >
                <Check className="w-3 h-3" />
                {isVerified ? 'Verified' : 'Mark as verified'}
              </button>
              
              <button
                onClick={() => onUpdateFeedback(messageId, flag.id, 'not_helpful')}
                disabled={isNotHelpful}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-medium transition-all border ${
                  isNotHelpful
                    ? 'bg-gray-100 dark:bg-[#1F1F1E] border-gray-200 dark:border-[#3A3A38] text-gray-400 dark:text-gray-600 cursor-default'
                    : 'bg-white dark:bg-[#2A2A28] border-[#D1D1CF] dark:border-[#3A3A38] text-[#6B6B6A] dark:text-[#9B9B99] hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                }`}
              >
                <Trash2 className="w-3 h-3" />
                Not helpful
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
