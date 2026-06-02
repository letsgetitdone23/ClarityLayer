"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import Onboarding from './Onboarding';
import { useChat } from '../hooks/useChat';

export default function ChatInterface() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingName, setIsLoadingName] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastFading, setToastFading] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('clarity_user_name');
    if (savedName) {
      setUserName(savedName);
    }
    setIsLoadingName(false);
  }, []);

  const handleNameSubmit = (name: string) => {
    localStorage.setItem('clarity_user_name', name);
    setUserName(name);
  };

  const {
    chats,
    currentChat,
    messages,
    inputText,
    setInputText,
    sendMessage,
    startNewChat,
    selectChat,
    isTyping,
    isSearchingWeb,
    updateFlagFeedback,
    toggleEditingAssumption,
    updateAssumption,
    regenerateWithCorrections,
    submitClarityFeedback,
  } = useChat();

  const handleNewChat = () => {
    if (currentChat && currentChat.messages.length === 0) return;

    startNewChat();

    // Show toast
    setToastVisible(true);
    setToastFading(false);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setToastFading(true);
      toastTimeoutRef.current = setTimeout(() => {
        setToastVisible(false);
        setToastFading(false);
      }, 300); // fade out duration
    }, 2500);
  };

  if (isLoadingName) {
    return <div className="h-screen w-screen bg-[#EEECEA] dark:bg-[#1A1A19]" />;
  }

  if (!userName) {
    return <Onboarding onComplete={handleNameSubmit} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#EEECEA] dark:bg-[#1A1A19] text-[#1A1A19] dark:text-[#F0EFEC] font-sans antialiased">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar — always visible on md+, slide-over on mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-[250ms] ease md:relative md:translate-x-0 md:z-auto ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar
          chats={chats}
          currentChatId={currentChat ? currentChat.id : null}
          onNewChat={() => { handleNewChat(); setIsSidebarOpen(false); }}
          onSelectChat={(id) => { selectChat(id); setIsSidebarOpen(false); }}
          userName={userName}
        />
      </div>

      {/* Right Chat Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col min-w-0">
        <ChatArea
          userName={userName}
          messages={messages}
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={sendMessage}
          isTyping={isTyping}
          isSearchingWeb={isSearchingWeb}
          onUpdateFlagFeedback={updateFlagFeedback}
          onToggleEdit={toggleEditingAssumption}
          onUpdateAssumption={updateAssumption}
          onRegenerate={regenerateWithCorrections}
          onSubmitFeedback={submitClarityFeedback}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </main>

      {/* Toast Notification */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(110%); }
          to { transform: translateX(0); }
        }
      `}</style>
      {toastVisible && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white dark:bg-[#2A2A28] px-4 py-[10px] rounded-lg pointer-events-none transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-transparent dark:border-[#3A3A38]"
          style={{
            animation: toastFading ? 'none' : 'slideInRight 200ms ease-out',
            opacity: toastFading ? 0 : 1,
          }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#D4881E] fill-current">
            <path d="M12 0c.5 6 5.5 11 12 12-6.5.5-11.5 5.5-12 12-.5-6-5.5-11-12-12 6.5-.5 11.5-5.5 12-12z" />
          </svg>
          <span className="text-[#1A1A19] dark:text-[#F0EFEC]" style={{ fontSize: '13px', fontWeight: 500 }}>
            Fresh session started
          </span>
        </div>
      )}
    </div>
  );
}
