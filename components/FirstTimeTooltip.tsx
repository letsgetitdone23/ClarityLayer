import React from 'react';
import { Sparkles, X } from 'lucide-react';

interface FirstTimeTooltipProps {
  onClose: () => void;
}

export default function FirstTimeTooltip({ onClose }: FirstTimeTooltipProps) {
  return (
    <div className="absolute bottom-full right-0 mb-3.5 w-72 bg-amber-50 dark:bg-[#2A2A28] border border-amber-300 dark:border-[#3A3A38] rounded-xl shadow-xl p-4 select-none text-[13px] text-amber-950 dark:text-[#F0EFEC] z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Title */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-amber-200/60 dark:border-[#3A3A38]">
        <div className="flex items-center space-x-1 text-amber-800 dark:text-[#D4881E] font-bold">
          <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-600 dark:text-[#D4881E] dark:fill-[#D4881E]/20" />
          <span>Meet Clarity</span>
        </div>
        <button
          onClick={onClose}
          className="text-amber-700 dark:text-[#6B6B6A] hover:text-amber-950 dark:hover:text-[#F0EFEC] p-0.5 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Description */}
      <div className="space-y-2 leading-relaxed text-amber-900 dark:text-[#9B9B99]">
        <p>
          <span className="font-semibold text-amber-950 dark:text-[#F0EFEC]">Underlined text</span> represents claims Claude is less certain about. Tap any underline to see why.
        </p>
        <p>
          Open the <span className="font-semibold text-amber-950 dark:text-[#F0EFEC]">Clarity panel</span> to review what assumptions Claude made — and correct them inline.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end mt-3 pt-2 border-t border-amber-200/60 dark:border-[#3A3A38]">
        <button
          onClick={onClose}
          className="py-1 px-3 rounded bg-amber-700 hover:bg-amber-850 dark:bg-[#F0EFEC] dark:text-[#1A1A19] dark:hover:bg-white font-semibold text-xs shadow-sm transition-all duration-150 active:scale-95"
        >
          Got it
        </button>
      </div>

      {/* Bottom pointer arrow pointing down to the Clarity Badge */}
      <div className="absolute bottom-0 right-6 translate-y-[8px] w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-amber-50 dark:border-t-[#2A2A28]" />
      <div className="absolute bottom-0 right-6 translate-y-[9px] w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-amber-300 dark:border-t-[#3A3A38] -z-10" />
    </div>
  );
}
