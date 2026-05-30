import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { ConfidenceFlag } from '../lib/types';

interface InlinePopoverProps {
  flag: ConfidenceFlag;
  x: number;
  y: number;
  onClose: () => void;
  onSeeAllFlags: () => void;
  onMarkVerified?: (flagId: string) => void;
}

export default function InlinePopover({
  flag,
  x,
  y,
  onClose,
  onSeeAllFlags,
  onMarkVerified,
}: InlinePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      style={{ left: `${x}px`, top: `${y}px` }}
      className="absolute z-30 w-72 bg-white dark:bg-[#2A2A28] border border-[#D1D1CF] dark:border-[#3A3A38] rounded-xl shadow-xl dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] p-4 -mt-2.5 -translate-x-1/2 -translate-y-full select-none text-[13px] text-[#1A1A19] dark:text-[#F0EFEC]"
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E3] dark:border-b-[#3A3A38] mb-2">
        <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-500 font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Claude is less certain here</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-[#9B9B99] dark:text-[#6B6B6A] hover:text-[#1A1A19] dark:hover:text-[#F0EFEC] p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Flagged sentence */}
      <div className="text-[#6B6B6A] dark:text-[#9B9B99] italic line-clamp-2 my-2 leading-relaxed">
        &ldquo;{flag.sentence}&rdquo;
      </div>

      <div className="h-px bg-[#E5E5E3] dark:bg-[#3A3A38] my-2" />

      {/* Uncertainty Reason */}
      <div className="text-[#1A1A19] dark:text-[#F0EFEC] font-medium my-2 leading-relaxed">
        {flag.reason}
      </div>

      <div className="h-px bg-[#E5E5E3] dark:bg-[#3A3A38] my-2" />

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-2 pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSeeAllFlags();
            onClose();
          }}
          className="text-amber-800 dark:text-[#D4881E] font-semibold hover:underline"
        >
          See all flags
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onMarkVerified) onMarkVerified(flag.id);
            onClose();
          }}
          className="flex items-center gap-1 py-1 px-2.5 rounded bg-amber-50 dark:bg-[#1F1F1E] border border-amber-200 dark:border-[#3A3A38] text-amber-800 dark:text-[#9B9B99] hover:bg-amber-100 dark:hover:bg-[#2F2F2D] hover:text-amber-900 dark:hover:text-[#F0EFEC] transition-colors duration-150 font-medium text-xs shadow-sm"
        >
          <Check className="w-3.5 h-3.5 text-amber-700 dark:text-[#D4881E]" />
          Helpful
        </button>
      </div>

      {/* Bottom pointer arrow pointing down to the sentence */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[8px] w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white dark:border-t-[#2A2A28]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[9px] w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#D1D1CF] dark:border-t-[#3A3A38] -z-10" />
    </div>
  );
}
