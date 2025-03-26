'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Demo component to avoid SSR issues
const Demo = dynamic(() => import('@/components/Demo'), {
  ssr: false,
});

export default function FrameAppPage() {
  return (
    <main className="min-h-screen flex flex-col p-4">
      <Demo />
    </main>
  );
} 