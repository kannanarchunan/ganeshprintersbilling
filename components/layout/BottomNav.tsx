'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Clock, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  // Highlight navigation options dynamically
  const navItems = [
    {
      label: 'Places',
      href: '/',
      icon: MapPin,
      activePattern: /^\/($|places)/,
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      activePattern: /^\/dashboard/,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom,16px)] pt-2 md:max-w-md md:mx-auto">
      <div className="flex justify-around items-center h-12">
        {navItems.map((item) => {
          // Robust regex matching for subpages
          const isActive = item.activePattern.test(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full select-none group active:scale-95 transition-transform duration-100"
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-300 flex items-center justify-center",
                  isActive
                    ? "bg-primary-100 text-primary-600 font-bold"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              >
                <Icon className="h-5.5 w-5.5" />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-0.5 font-medium transition-colors duration-300",
                  isActive
                    ? "text-primary-700 font-semibold"
                    : "text-slate-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
