import React, { useState } from 'react';
import { ThumbsUp, Send } from 'lucide-react';

interface FeedbackBarProps {
  messageId: string;
  feedbackGiven?: 'helpful' | 'somewhat' | 'not_really';
  onSubmitFeedback: (messageId: string, feedback: 'helpful' | 'somewhat' | 'not_really') => void;
}

export default function FeedbackBar({
  messageId,
  feedbackGiven,
  onSubmitFeedback,
}: FeedbackBarProps) {
  const [selectedRating, setSelectedRating] = useState<'helpful' | 'somewhat' | 'not_really' | null>(feedbackGiven || null);
  const [commentText, setCommentText] = useState('');
  const [submitted, setSubmitted] = useState(!!feedbackGiven);

  const handleRatingClick = (rating: 'helpful' | 'somewhat' | 'not_really') => {
    if (submitted) return;
    setSelectedRating(rating);
  };

  const handleSend = () => {
    if (selectedRating && !submitted) {
      onSubmitFeedback(messageId, selectedRating);
      setSubmitted(true);
    }
  };

  return (
    <div className="border-t border-[#E5E5E3] dark:border-t-[#3A3A38] bg-white dark:bg-[#2A2A28] pt-3 pb-2 text-[12px]">
      {submitted ? (
        /* Gratitude View */
        <div className="flex items-center justify-center text-green-700 dark:text-green-500 font-semibold py-1.5 select-none animate-in fade-in duration-200">
          <ThumbsUp className="w-3.5 h-3.5 mr-1.5 fill-green-100 dark:fill-green-950/20" />
          Thank you for helping us improve Clarity!
        </div>
      ) : (
        /* Action form */
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-[#6B6B6A] dark:text-[#9B9B99] select-none">
              Was Clarity useful?
            </span>
            
            {/* Rating Buttons */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => handleRatingClick('helpful')}
                className={`py-1 px-2.5 border rounded-lg transition-all font-medium ${
                  selectedRating === 'helpful'
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-500 text-green-700 dark:text-green-500'
                    : 'bg-white dark:bg-[#1F1F1E] border-[#E5E5E3] dark:border-[#3A3A38] text-[#6B6B6A] dark:text-[#9B9B99] hover:bg-gray-50 dark:hover:bg-[#2F2F2D]'
                }`}
              >
                ✓ Yes
              </button>
              
              <button
                type="button"
                onClick={() => handleRatingClick('somewhat')}
                className={`py-1 px-2.5 border rounded-lg transition-all font-medium ${
                  selectedRating === 'somewhat'
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500 text-amber-700 dark:text-amber-500'
                    : 'bg-white dark:bg-[#1F1F1E] border-[#E5E5E3] dark:border-[#3A3A38] text-[#6B6B6A] dark:text-[#9B9B99] hover:bg-gray-50 dark:hover:bg-[#2F2F2D]'
                }`}
              >
                △ Somewhat
              </button>
              
              <button
                type="button"
                onClick={() => handleRatingClick('not_really')}
                className={`py-1 px-2.5 border rounded-lg transition-all font-medium ${
                  selectedRating === 'not_really'
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-500'
                    : 'bg-white dark:bg-[#1F1F1E] border-[#E5E5E3] dark:border-[#3A3A38] text-[#6B6B6A] dark:text-[#9B9B99] hover:bg-gray-50 dark:hover:bg-[#2F2F2D]'
                }`}
              >
                ✗ Not really
              </button>
            </div>
          </div>

          {/* Optional Text input for details */}
          {selectedRating && (
            <div className="flex items-center gap-2 border border-[#D1D1CF] dark:border-[#3A3A38] rounded-lg px-2.5 py-1 bg-[#EEECEA] dark:bg-[#1F1F1E] animate-in slide-in-from-top-1 duration-150">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What could be better? (optional)"
                className="flex-1 bg-transparent border-0 outline-none text-[12px] placeholder-[#9B9B99] dark:placeholder-[#6B6B6A] py-0.5 text-[#1A1A19] dark:text-[#F0EFEC]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
              />
              <button
                onClick={handleSend}
                className="text-[#6B6B6A] dark:text-[#9B9B99] hover:text-[#1A1A19] dark:hover:text-[#F0EFEC] transition-colors p-0.5"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
