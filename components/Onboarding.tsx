import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface OnboardingProps {
  onComplete: (name: string) => void;
}

const Sparkle = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0c.5 6 5.5 11 12 12-6.5.5-11.5 5.5-12 12-.5-6-5.5-11-12-12 6.5-.5 11.5-5.5 12-12z" />
  </svg>
);

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#EEECEA] dark:bg-[#1A1A19] text-gray-900 dark:text-[#F0EFEC] font-sans antialiased overflow-hidden relative select-none">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Decorative amber sparkles in corners */}
      <div className="absolute top-[8%] left-[4%] pointer-events-none">
        <Sparkle className="w-[52px] h-[52px] text-[#D4881E] opacity-[0.18] dark:opacity-20" />
      </div>
      <div className="absolute top-[11%] right-[6%] pointer-events-none">
        <Sparkle className="w-[38px] h-[38px] text-[#D4881E] opacity-[0.14] dark:opacity-20" />
      </div>
      <div className="absolute bottom-[12%] right-[4%] pointer-events-none">
        <Sparkle className="w-[44px] h-[44px] text-[#D4881E] opacity-[0.16] dark:opacity-20" />
      </div>

      {/* Main card */}
      <div className="flex flex-col items-center w-[90%] max-w-sm md:max-w-[420px] px-6 py-8 md:px-10 md:py-10 bg-white dark:bg-[#2A2A28] border border-[#E5E5E3] dark:border-[#3A3A38] shadow-[0_8px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] rounded-[16px] relative z-10">
        {/* Amber sparkle icon */}
        <div className="mb-3 text-[#D4881E]">
          <Sparkle className="w-7 h-7" />
        </div>

        {/* Brand heading */}
        <h2 className="text-[28px] font-serif font-bold text-[#1A1A19] dark:text-[#F0EFEC] mb-3 tracking-tight">Claude</h2>

        {/* Title & description */}
        <div className="text-center mb-6">
          <h1 className="text-[20px] font-serif font-semibold text-[#1A1A19] dark:text-[#F0EFEC] mb-2">What should we call you?</h1>
          <p className="text-[13px] text-[#9B9B99] dark:text-[#6B6B6A]">We&apos;ll use your name to personalise your experience.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-white dark:bg-[#1F1F1E] border border-[#D1D1CF] dark:border-[#3A3A38] focus:border-[#1A1A19] dark:focus:border-[#F0EFEC] outline-none py-3 px-4 rounded-xl text-[14px] text-[#1A1A19] dark:text-[#F0EFEC] placeholder:text-[#B5B5B3] dark:placeholder-[#6B6B6A] transition-colors duration-200"
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className={`w-full py-3 rounded-xl font-medium text-[14px] transition-all duration-200 flex items-center justify-center gap-2 ${
              name.trim()
                ? 'bg-[#1A1A19] dark:bg-[#F0EFEC] text-white dark:text-[#1A1A19] hover:bg-black/90 dark:hover:bg-white/90 active:scale-[0.98]'
                : 'bg-[#F0F0EE] dark:bg-[#1F1F1E] text-[#B5B5B3] dark:text-[#6B6B6A] cursor-not-allowed border border-transparent dark:border-[#3A3A38]'
            }`}
          >
            <span>Let&apos;s go</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <span className="text-[11px] text-[#B5B5B3] dark:text-[#6B6B6A] mt-4 text-center">
          Your name is only stored in this session.
        </span>
      </div>
    </div>
  );
}
