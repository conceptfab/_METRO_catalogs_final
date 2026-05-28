'use client';

import WebMcpProvider from '@/components/catalog/WebMcpProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WebMcpProvider />
    </>
  );
}
