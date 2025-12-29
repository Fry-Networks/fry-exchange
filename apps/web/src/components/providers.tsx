'use client';

import * as React from 'react';
import { ToastContainer } from '@/components/ui/toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
