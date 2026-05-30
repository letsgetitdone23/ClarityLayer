import { useState } from 'react';

export function useClarity() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'confidence' | 'assumptions'>('confidence');

  const togglePanel = () => setIsOpen(prev => !prev);
  
  const openPanel = (tab?: 'confidence' | 'assumptions') => {
    setIsOpen(true);
    if (tab) setActiveTab(tab);
  };

  const closePanel = () => setIsOpen(false);

  return {
    isOpen,
    activeTab,
    setIsOpen,
    setActiveTab,
    togglePanel,
    openPanel,
    closePanel,
  };
}
