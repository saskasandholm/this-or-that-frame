'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { setTheme } = useTheme();

  // Force dark theme on mount
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 rounded-full bg-background flex items-center justify-center"
      aria-label="Dark theme"
      disabled={true}
    >
      <span className="text-xs">🌙</span>
    </Button>
  );
}
