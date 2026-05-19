'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogOut, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button'; 
import { cn } from '@/lib/utils';
import { useLanguage } from '../ui/LanguageProvider';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
  showLogout?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  showBack = false,
  backHref,
  rightAction,
  showLogout = false,
}: PageHeaderProps) {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  // Sync / Online check
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    // Clear custom authentication session
    localStorage.removeItem('ganesh_auth_session');
    router.replace('/login');
  };

  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 shadow-[0_4px_12px_rgba(22,163,74,0.12)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => {
                if (backHref) {
                  router.push(backHref);
                } else {
                  router.back();
                }
              }}
              className="text-white/90 hover:text-white hover:bg-white/10 active:scale-90 p-1.5 rounded-full transition-transform duration-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="font-bold text-base md:text-lg line-clamp-1 flex items-center gap-2">
              {title}
              {/* Sync Status Badge Indicator */}
              <span className="inline-flex items-center" title={isOnline ? "Online" : "Offline"}>
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-emerald-300 fill-emerald-300" />
                ) : (
                  <WifiOff className="h-3 w-3 text-amber-300 fill-amber-300 animate-pulse" />
                )}
              </span>
            </h1>
            {subtitle && (
              <p className="text-[10px] text-primary-100 font-medium tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleLanguage}
            className="text-white/90 hover:text-white px-2 py-0.5 hover:bg-white/15 rounded-lg active:scale-95 transition-all text-[10px] font-bold border border-white/20 shrink-0 select-none cursor-pointer"
            title={language === 'en' ? 'தமிழ் மொழிக்கு மாற்றவும்' : 'Switch to English'}
          >
            {language === 'en' ? 'தமிழ்' : 'EN'}
          </button>
          {rightAction}
          {showLogout && (
            <button
              onClick={handleLogout}
              className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full active:scale-90 transition-all duration-100"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="absolute top-full left-0 right-0 bg-amber-500 text-amber-95 text-[10px] py-1 text-center font-bold tracking-wide animate-slide-down shadow-sm">
          ⚠️ You're offline — changes will sync when reconnected
        </div>
      )}
    </header>
  );
}
