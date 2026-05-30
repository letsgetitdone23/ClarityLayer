import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-1.5 rounded-full transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/10 text-[#6B6B6A] dark:text-[#9B9B99] hover:text-[#1A1A19] dark:hover:text-[#F0EFEC] focus:outline-none flex items-center justify-center"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      <div className="transition-opacity duration-150">
        {theme === 'light' ? (
          <Sun className="w-[18px] h-[18px]" />
        ) : (
          <Moon className="w-[18px] h-[18px]" />
        )}
      </div>
    </button>
  );
}
