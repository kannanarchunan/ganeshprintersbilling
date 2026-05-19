import React from 'react';
import BottomNav from './BottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export default function MobileLayout({ children, showNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-stretch font-sans antialiased text-slate-800">
      {/* Centered mobile framing container */}
      <div className="w-full max-w-md bg-white flex flex-col shadow-xl border-x border-slate-100 min-h-screen relative pb-16 md:pb-20">
        <main className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
