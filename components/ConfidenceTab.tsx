import React, { useMemo } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { ConfidenceFlag } from '../lib/types';

interface ConfidenceTabProps {
  flags: ConfidenceFlag[];
  messageId: string;
  onUpdateFeedback: (messageId: string, flagId: string, feedback: 'verified' | 'not_helpful') => void;
}

// Confidence level visual config
const levelConfig = {
  critical: {
    borderColor: 'border-l-red-500',
    bg: 'bg-red-50 dark:bg-red-950',
    dotColor: 'bg-red-500',
    label: 'Critical',
    labelColor: 'text-red-600 dark:text-red-400',
  },
  low: {
    borderColor: 'border-l-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950',
    dotColor: 'bg-amber-500',
    label: 'Should verify',
    labelColor: 'text-amber-600 dark:text-amber-400',
  },
  moderate: {
    borderColor: 'border-l-gray-300',
    bg: 'bg-gray-50 dark:bg-gray-900',
    dotColor: 'bg-gray-400',
    label: 'Worth checking',
    labelColor: 'text-gray-500 dark:text-gray-400',
  },
};

interface FlagCardProps {
  flag: ConfidenceFlag;
  messageId: string;
  isChild?: boolean;
  onUpdateFeedback: (messageId: string, flagId: string, feedback: 'verified' | 'not_helpful') => void;
}

function FlagCard({ flag, messageId, isChild, onUpdateFeedback }: FlagCardProps) {
  const isVerified = flag.userFeedback === 'verified';
  const isNotHelpful = flag.userFeedback === 'not_helpful';
  const level = flag.confidence_level || 'moderate';
  const config = levelConfig[level];

  return (
    <div className={isChild ? 'ml-4 pl-3 border-l-2 border-dashed border-gray-300 dark:border-gray-700' : ''}>
      {isChild && (
        <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium mb-1 block">
          depends on above
        </span>
      )}
      <div
        className={`border-l-[3px] ${config.borderColor} ${config.bg} rounded-r-lg p-3 text-[13px] leading-relaxed transition-all duration-150 ${
          isVerified
            ? '!border-l-green-600 !bg-green-50/20 dark:!bg-green-950/10'
            : isNotHelpful
            ? '!border-l-gray-300 !bg-gray-50/30 dark:!bg-[#1F1F1E]/50 opacity-60'
            : ''
        }`}
      >
        {/* Header: confidence level dot + label */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1" />
          <div className={`flex items-center gap-1.5 ${config.labelColor}`}>
            <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-green-500' : isNotHelpful ? 'bg-gray-300' : config.dotColor}`} />
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              {isVerified ? 'Verified' : isNotHelpful ? 'Dismissed' : config.label}
            </span>
          </div>
        </div>

        {/* Flagged sentence */}
        <div className={`italic text-[13px] text-gray-600 dark:text-gray-400 mb-1.5 ${isNotHelpful ? 'line-through' : ''}`}>
          &ldquo;{flag.sentence}&rdquo;
        </div>

        {/* Reason */}
        <div className="text-[12px] text-gray-500 dark:text-gray-500 flex items-start gap-1 mb-2.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-70" />
          <span>{flag.reason}</span>
        </div>

        {/* Verification pointer */}
        {flag.verification_pointer && (
          <div className="bg-white dark:bg-[#1F1F1E] rounded-md border border-gray-200 dark:border-[#3A3A38] p-2.5 mb-2.5">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
              Verify via
            </span>
            <p className="text-[12px] text-[#1A1A19] dark:text-[#F0EFEC] mt-0.5 leading-relaxed">
              {flag.verification_pointer}
            </p>
          </div>
        )}

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
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded text-xs font-medium transition-all ${
              isNotHelpful
                ? 'text-gray-400 dark:text-gray-600 cursor-default'
                : 'text-[#6B6B6A] dark:text-[#9B9B99] hover:text-red-700 dark:hover:text-red-500'
            }`}
          >
            <X className="w-3 h-3" />
            Not helpful
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfidenceTab({
  flags,
  messageId,
  onUpdateFeedback,
}: ConfidenceTabProps) {
  // Empty state
  if (!flags || flags.length === 0) {
    return (
      <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-2 select-none">
        <p className="text-[14px] font-medium text-green-600 dark:text-green-500">
          ✓ No uncertain claims in this response
        </p>
      </div>
    );
  }

  // Group flags into dependency tree
  const { rootFlags, childrenMap, criticalCount } = useMemo(() => {
    const roots: ConfidenceFlag[] = [];
    const children: Record<string, ConfidenceFlag[]> = {};
    let criticals = 0;

    for (const flag of flags) {
      if (flag.confidence_level === 'critical') criticals++;

      if (!flag.depends_on) {
        roots.push(flag);
      } else {
        if (!children[flag.depends_on]) {
          children[flag.depends_on] = [];
        }
        children[flag.depends_on].push(flag);
      }
    }

    // If a child references a non-existent parent, treat it as a root
    for (const flag of flags) {
      if (flag.depends_on && !flags.some(f => f.id === flag.depends_on)) {
        roots.push(flag);
        if (children[flag.depends_on]) {
          delete children[flag.depends_on];
        }
      }
    }

    return { rootFlags: roots, childrenMap: children, criticalCount: criticals };
  }, [flags]);

  return (
    <div className="space-y-3 py-2">
      {/* Summary bar */}
      <div className="flex items-center gap-2 px-1 text-[13px] text-gray-600 dark:text-gray-400 font-medium">
        <span>{flags.length} flag{flags.length !== 1 ? 's' : ''}</span>
        {criticalCount > 0 && (
          <>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-red-600 dark:text-red-400 font-medium">
              {criticalCount} critical — verify before acting
            </span>
          </>
        )}
      </div>

      {/* Flag cards with dependency grouping */}
      {rootFlags.map((rootFlag) => (
        <div key={rootFlag.id} className="space-y-2">
          <FlagCard
            flag={rootFlag}
            messageId={messageId}
            onUpdateFeedback={onUpdateFeedback}
          />
          {childrenMap[rootFlag.id]?.map((childFlag) => (
            <FlagCard
              key={childFlag.id}
              flag={childFlag}
              messageId={messageId}
              isChild
              onUpdateFeedback={onUpdateFeedback}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
