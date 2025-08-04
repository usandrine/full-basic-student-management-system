// frontend/app/providers.tsx
"use client"; // <-- This component uses AuthProvider, which uses client-side hooks

import { AuthProvider } from '@/context/AuthContext';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}