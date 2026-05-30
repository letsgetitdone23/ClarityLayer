import React, { useState } from 'react';
import { Edit2, Check, RefreshCw, AlertTriangle, Globe } from 'lucide-react';
import { Assumption } from '../lib/types';

interface AssumptionsTabProps {
  assumptions: Assumption[];
  messageId: string;
  onToggleEdit: (messageId: string, assumptionId: string, isEditing: boolean) => void;
  onUpdateAssumption: (messageId: string, assumptionId: string, newText: string) => void;
  onRegenerate: (messageId: string) => void;
}

export default function AssumptionsTab({
  assumptions,
  messageId,
  onToggleEdit,
  onUpdateAssumption,
  onRegenerate,
}: AssumptionsTabProps) {
  // Local edit states
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [typedText, setTypedText] = useState<string>('');

  const handleStartEdit = (assumption: Assumption) => {
    // Populate local edit states based on current editedText
    if (assumption.editedText) {
      if (assumption.suggestions?.includes(assumption.editedText)) {
        setSelectedChip(assumption.editedText);
        setTypedText('');
      } else {
        setSelectedChip(null);
        setTypedText(assumption.editedText);
      }
    } else {
      setSelectedChip(null);
      setTypedText('');
    }
    onToggleEdit(messageId, assumption.id, true);
  };

  const handleSelectChip = (assumptionId: string, chipText: string) => {
    if (selectedChip === chipText) {
      // Toggle off if clicked again
      setSelectedChip(null);
      onUpdateAssumption(messageId, assumptionId, '');
    } else {
      setSelectedChip(chipText);
      setTypedText('');
      onUpdateAssumption(messageId, assumptionId, chipText);
    }
  };

  const handleType = (text: string) => {
    setSelectedChip(null);
    setTypedText(text);
  };

  const handleConfirmTypedText = (assumptionId: string) => {
    const trimmed = typedText.trim();
    if (trimmed) {
      onUpdateAssumption(messageId, assumptionId, trimmed);
    }
  };

  const handleCancel = (assumptionId: string) => {
    setSelectedChip(null);
    setTypedText('');
    onToggleEdit(messageId, assumptionId, false);
  };

  const hasCorrections = assumptions.some(a => a.editedText !== undefined && a.editedText !== '');

  if (!assumptions || assumptions.length === 0) {
    return (
      <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-2 select-none">
        <p className="text-sm font-semibold text-[#6B6B6A] dark:text-[#9B9B99]">
          No specific assumptions detected
        </p>
        <p className="text-xs text-[#9B9B99] dark:text-[#6B6B6A]">
          Claude generated this answer without relying on implicit assumptions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2 flex flex-col h-full">
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {assumptions.map((a) => {
          const isCorrected = a.editedText !== undefined && a.editedText !== '';

          // Determine dot color based on impact level
          let dotColor = 'bg-gray-300 dark:bg-[#6B6B6A]';
          if (a.impact === 'high') dotColor = 'bg-red-400';
          else if (a.impact === 'medium') dotColor = 'bg-amber-400';

          return (
            <div
              key={a.id}
              className={`border rounded-xl p-3.5 text-[13px] leading-relaxed transition-all duration-150 ${isCorrected
                  ? 'bg-[#FFFBEB] dark:bg-amber-500/10 border-amber-300 dark:border-amber-600'
                  : a.isStatic
                    ? 'bg-blue-50/30 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50'
                    : 'bg-[#EEECEA] dark:bg-[#1F1F1E] border-[#E5E5E3] dark:border-[#3A3A38]'
                }`}
            >
              {a.isEditing ? (
                /* ZONE 2 — The edit area (expanded / editing state) */
                <div className="flex flex-col space-y-3.5">
                  {/* ZONE 1 (Header inside expanded view) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[#1A1A19] dark:text-[#F0EFEC] font-medium leading-relaxed flex-1">
                      {a.text}
                    </div>
                    {a.impact && (
                      <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5 select-none">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span className="text-[10px] font-medium uppercase tracking-wide text-[#6B6B6A] dark:text-[#9B9B99]">
                          {a.impact}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PART A — Smart suggestion chips */}
                  {a.suggestions && a.suggestions.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">
                        Quick select:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {a.suggestions.map((suggestion, sIdx) => {
                          const isSelected = selectedChip === suggestion;
                          return (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleSelectChip(a.id, suggestion)}
                              className={`border rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-all duration-150 ${isSelected
                                  ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                                  : 'border-gray-200 dark:border-[#3A3A38] text-gray-600 dark:text-gray-400 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-400 bg-white dark:bg-[#1F1F1E]'
                                }`}
                            >
                              {suggestion}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* PART B — "Something else?" free text option */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">
                      Something else?
                    </span>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={selectedChip ? '' : typedText}
                        disabled={selectedChip !== null}
                        onChange={(e) => handleType(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleConfirmTypedText(a.id);
                          }
                        }}
                        placeholder="Type your own..."
                        className={`text-xs border rounded-lg pl-3 pr-8 py-1.5 w-full focus:outline-none transition-all duration-150 ${selectedChip
                            ? 'bg-gray-100 dark:bg-[#252523] border-gray-200 dark:border-[#3A3A38] text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                            : 'border-gray-200 dark:border-[#3A3A38] bg-white dark:bg-[#1F1F1E] text-gray-800 dark:text-[#F0EFEC] focus:border-amber-400 dark:focus:border-amber-500'
                          }`}
                        autoFocus={selectedChip === null}
                      />
                      {/* Confirm checkmark button */}
                      {!selectedChip && typedText.trim() && (
                        <button
                          type="button"
                          onClick={() => handleConfirmTypedText(a.id)}
                          className="absolute right-2.5 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 p-0.5 rounded transition-colors"
                          title="Confirm correction"
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PART C — Done / Cancel */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleCancel(a.id)}
                      className="text-xs text-gray-400 hover:text-amber-600 dark:text-gray-500 dark:hover:text-amber-500 cursor-pointer font-medium hover:underline bg-transparent border-0 outline-none transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ZONE 1 — The assumption statement (default / collapsed state) */
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 flex gap-2">
                    {a.isStatic && (
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-[#1A1A19] dark:text-[#F0EFEC] font-medium leading-relaxed">
                        {a.editedText || a.text}
                      </div>
                      {isCorrected && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-500 font-semibold mt-1">
                          ✓ Corrected from: <span className="italic line-through font-normal opacity-70">{a.text}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2.5 flex-shrink-0 select-none">
                    {/* Impact Label */}
                    {a.impact && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span className="text-[10px] font-medium uppercase tracking-wide text-[#6B6B6A] dark:text-[#9B9B99]">
                          {a.impact}
                        </span>
                      </div>
                    )}

                    {!a.isStatic && (
                      <button
                        onClick={() => handleStartEdit(a)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#B45309] dark:text-[#D4881E] bg-amber-50 dark:bg-[#2A2A28] hover:bg-amber-100 dark:hover:bg-[#2F2F2D] border border-amber-200/50 dark:border-[#3A3A38] py-1 px-2.5 rounded-md transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                        Change
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning nudge & Regenerate with corrections button */}
      <div className="pt-2.5 border-t border-[#E5E5E3] dark:border-[#3A3A38] mt-4 space-y-3">
        {/* Subtle warning nudge */}
        {hasCorrections && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-[#3A3A38] text-amber-850 dark:text-[#F0EFEC] text-xs font-medium leading-normal animate-in fade-in slide-in-from-top-1 duration-150">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>You have unsaved corrections — regenerate to apply?</span>
          </div>
        )}

        <button
          onClick={() => hasCorrections && onRegenerate(messageId)}
          disabled={!hasCorrections}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-[13px] font-bold shadow-md transition-all active:scale-[0.99] ${hasCorrections
              ? 'bg-[#F59E0B] text-[#92400E] dark:text-[#FEF3C7] hover:opacity-95 cursor-pointer'
              : 'bg-[#EEECEA] dark:bg-[#1A1A19] border border-[#E5E5E3] dark:border-[#3A3A38] text-[#9B9B99] dark:text-[#6B6B6A] cursor-not-allowed shadow-none'
            }`}
        >
          {hasCorrections ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Regenerate with corrections &rarr;</span>
            </>
          ) : (
            <span>Select or type a correction above</span>
          )}
        </button>
      </div>
    </div>
  );
}
