import React from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Folder,
  FileText,
  Code as CodeIcon,
  SlidersHorizontal,
  ChevronsUpDown,
  Download,
  PanelLeftClose,
} from 'lucide-react';
import { Chat } from '../lib/types';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  userName?: string;
}

export default function Sidebar({ chats, currentChatId, onNewChat, onSelectChat, userName }: SidebarProps) {
  return (
    <aside className="w-[195px] h-full bg-[#EEECEA] dark:bg-[#1F1F1E] border-r border-[#E5E5E3] dark:border-r-[#3A3A38] flex flex-col select-none flex-shrink-0 font-sans">
      {/* Brand Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="font-serif text-[18px] font-bold text-[#1A1A19] dark:text-[#F0EFEC] tracking-tight">Claude</span>
        <button className="p-1 hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-md transition-colors">
          <PanelLeftClose className="w-4 h-4 text-[#6B6B6A] dark:text-[#9B9B99]" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="px-2 py-1 flex flex-col gap-[1px]">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] text-[#3D3D3C] dark:text-[#F0EFEC] hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-lg transition-colors font-medium text-left"
        >
          <Plus className="w-4 h-4 text-[#6B6B6A] dark:text-[#9B9B99]" />
          <span>New chat</span>
        </button>

        <button className="w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] text-[#3D3D3C] dark:text-[#F0EFEC] hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-lg transition-colors font-medium text-left">
          <Search className="w-4 h-4 text-[#6B6B6A] dark:text-[#9B9B99]" />
          <span>Search</span>
        </button>

        <button className="w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] text-[#3D3D3C] dark:text-[#F0EFEC] hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-lg transition-colors font-medium text-left">
          <MessageSquare className="w-4 h-4 text-[#6B6B6A] dark:text-[#9B9B99]" />
          <span>Chats</span>
        </button>

        <button className="w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] text-[#3D3D3C] dark:text-[#F0EFEC] hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-lg transition-colors font-medium text-left">
          <Folder className="w-4 h-4 text-[#6B6B6A] dark:text-[#9B9B99]" />
          <span>Projects</span>
        </button>

        <button className="w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] text-[#3D3D3C] dark:text-[#F0EFEC] hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-lg transition-colors font-medium text-left">
          <FileText className="w-4 h-4 text-[#6B6B6A] dark:text-[#9B9B99]" />
          <span>Artifacts</span>
        </button>

        <button className="w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] text-[#3D3D3C] dark:text-[#F0EFEC] hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-lg transition-colors font-medium text-left">
          <CodeIcon className="w-4 h-4 text-[#6B6B6A] dark:text-[#9B9B99]" />
          <span className="flex-1">Code</span>
          <span className="text-[9px] bg-[#E0DFDC] dark:bg-[#2A2A28] text-[#6B6B6A] dark:text-[#9B9B99] font-bold px-1.5 py-0.5 rounded leading-none tracking-wide">UPGRADE</span>
        </button>

        <button className="w-full flex items-center gap-2.5 px-2.5 py-[7px] text-[13px] text-[#3D3D3C] dark:text-[#F0EFEC] hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-lg transition-colors font-medium text-left">
          <SlidersHorizontal className="w-4 h-4 text-[#6B6B6A] dark:text-[#9B9B99]" />
          <span>Customize</span>
        </button>
      </div>

      {/* Starred & Recents sections */}
      <div className="flex-1 overflow-y-auto px-2 pt-4 flex flex-col gap-3 custom-scrollbar">
        {/* STARRED */}
        <div>
          <div className="px-2.5 pb-1.5 text-[10px] font-bold tracking-[0.08em] text-[#9B9B99] dark:text-[#6B6B6A] uppercase">
            Starred
          </div>
        </div>

        {/* RECENTS */}
        <div>
          <div className="px-2.5 pb-1.5 text-[10px] font-bold tracking-[0.08em] text-[#9B9B99] dark:text-[#6B6B6A] uppercase">
            Recents
          </div>
          <div className="flex flex-col gap-[1px]">
            {chats.length === 0 || (chats.length === 1 && chats[0].messages.length === 0) ? (
              <div className="px-2.5 py-1 text-[11px] text-[#9B9B99] dark:text-[#6B6B6A] italic">
                No recent chats
              </div>
            ) : (
              chats.map((chat) => {
                const isActive = chat.id === currentChatId;
                return (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full flex items-center gap-2 py-[6px] text-left text-[12px] transition-all duration-150 rounded-md ${
                      isActive
                        ? 'border-l-2 border-[#D4881E] dark:border-l-amber-500 pl-2 bg-[#E3E1DE] dark:bg-[#2F2F2D] text-[#1A1A19] dark:text-[#F0EFEC] font-medium'
                        : 'pl-[10px] text-[#6B6B6A] dark:text-[#9B9B99] hover:bg-[#E3E1DE]/50 dark:hover:bg-[#2F2F2D]/50 hover:text-[#3D3D3C] dark:hover:text-[#F0EFEC] border-l-2 border-transparent'
                    }`}
                  >
                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#D4881E]' : 'text-[#9B9B99]'}`} />
                    <span className="truncate flex-1">
                      {chat.title === 'New conversation' ? 'Market Sizing for Edtec...' : chat.title}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* User profile footer */}
      {userName && (
        <div className="px-3 py-3 border-t border-[#E5E5E3] dark:border-t-[#3A3A38] flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Pink/coral avatar with amber sparkle */}
            <div className="w-7 h-7 rounded-full bg-[#E17F93] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-[#D4881E] fill-current">
                <path d="M12 0c.5 6 5.5 11 12 12-6.5.5-11.5 5.5-12 12-.5-6-5.5-11-12-12 6.5-.5 11.5-5.5 12-12z" />
              </svg>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[12px] font-semibold text-[#1A1A19] dark:text-[#F0EFEC] truncate leading-tight">
                {userName}
              </span>
              <span className="text-[10px] text-[#9B9B99] dark:text-[#6B6B6A] leading-tight">
                Free plan
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button className="p-1 hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-md transition-colors text-[#9B9B99] dark:text-[#6B6B6A] hover:text-[#3D3D3C] dark:hover:text-[#9B9B99]">
              <Download className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 hover:bg-[#E3E1DE] dark:hover:bg-[#2F2F2D] rounded-md transition-colors text-[#9B9B99] dark:text-[#6B6B6A] hover:text-[#3D3D3C] dark:hover:text-[#9B9B99]">
              <ChevronsUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
