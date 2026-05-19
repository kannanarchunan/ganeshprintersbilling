'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Bypass if already logged in
  useEffect(() => {
    const session = localStorage.getItem('ganesh_auth_session');
    if (session) {
      router.replace('/');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Short mock delay for premium feel
    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@ganesh.com';
      const altEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALT || 'ganesh@billing.com';
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'ganesh123';

      // Owner verification (configurable via environment variables)
      if (
        (trimmedEmail === adminEmail.trim().toLowerCase() && trimmedPassword === adminPassword.trim()) ||
        (trimmedEmail === altEmail.trim().toLowerCase() && trimmedPassword === adminPassword.trim())
      ) {
        localStorage.setItem('ganesh_auth_session', JSON.stringify({
          user: trimmedEmail,
          loggedInAt: new Date().toISOString()
        }));
        toast('Logged in successfully. Welcome back!', 'success');
        router.replace('/');
      } else {
        setError('Incorrect email or security password.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-primary-50/30 flex items-center justify-center p-5 select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 space-y-6 relative overflow-hidden animate-scale-up">
        {/* Glow element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100 rounded-full blur-3xl opacity-60 -mr-5 -mt-5" />

        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/25">
            <Lock className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 text-base md:text-lg">
              Ganesh Printers
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Billing Management Gateway
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          {error && (
            <div className="bg-red-50 border border-red-100/50 rounded-2xl p-3 flex items-start gap-2.5 text-[10px] text-red-700 font-semibold leading-normal">
              <ShieldAlert className="h-4.5 w-4.5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="admin@ganesh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary-400 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary-400 focus:bg-white rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold focus:outline-none transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl py-3.5 h-12 text-xs font-bold shadow-lg shadow-primary-500/20 mt-2"
          >
            {isLoading ? 'Signing In...' : 'Verify & Enter'}
          </Button>
        </form>

        <div className="text-center text-[9px] text-slate-400 font-medium">
          Owner Portal • Delivery Billing App v2.0
        </div>
      </div>
    </div>
  );
}
