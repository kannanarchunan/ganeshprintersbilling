'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../ui/ToastProvider';
import { LanguageProvider } from '../ui/LanguageProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Prevent QueryClient recreation across server renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30000,
            refetchOnWindowFocus: true,
            retry: 2,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
