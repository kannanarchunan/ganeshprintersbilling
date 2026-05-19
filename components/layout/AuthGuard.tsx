'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('ganesh_auth_session');
    if (!session) {
      setIsAuthenticated(false);
      router.replace('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Loading state during auth handshake
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center select-none">
        <div className="h-7 w-7 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
          Authenticating Session...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
