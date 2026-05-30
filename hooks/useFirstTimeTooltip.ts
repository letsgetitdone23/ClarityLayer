import { useState, useEffect } from 'react';

export function useFirstTimeTooltip(messageNumber: number, hasInteracted: boolean) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // If already dismissed permanently
    const seen = localStorage.getItem('clarity_tooltip_seen') === 'true';
    if (seen) {
      setShowTooltip(false);
      return;
    }

    const nudgeCount = parseInt(localStorage.getItem('clarity_tooltip_nudge_count') || '0', 10);

    // First assistant message: trigger tooltip if it's the first nudge
    if (messageNumber === 1 && nudgeCount === 0) {
      setShowTooltip(true);
    }

    // Third assistant message: re-nudge once if they haven't interacted yet
    if (messageNumber === 3 && !hasInteracted && nudgeCount === 1) {
      setShowTooltip(true);
    }
  }, [messageNumber, hasInteracted]);

  const dismissTooltip = () => {
    localStorage.setItem('clarity_tooltip_seen', 'true');
    setShowTooltip(false);
  };

  const handleNudgeDismiss = () => {
    const current = parseInt(localStorage.getItem('clarity_tooltip_nudge_count') || '0', 10);
    localStorage.setItem('clarity_tooltip_nudge_count', (current + 1).toString());
    
    // If they dismissed the 2nd nudge, mark as permanently seen
    if (current >= 1) {
      localStorage.setItem('clarity_tooltip_seen', 'true');
    }
    
    setShowTooltip(false);
  };

  return {
    showTooltip,
    dismissTooltip,
    handleNudgeDismiss,
  };
}
