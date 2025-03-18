'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const TestComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  const handleIncrement = () => {
    setCount(prevCount => prevCount + 1);
  };

  const handleDecrement = () => {
    setCount(prevCount => Math.max(0, prevCount - 1));
  };

  const handleReset = () => {
    setCount(0);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCount(Math.max(0, value));
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden border-gray-800/40 bg-gradient-to-b from-card/80 to-card shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent animate-gradient">
          Test Component
        </CardTitle>
        <CardDescription>This is a test component using shadcn/ui with Tailwind v4</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="p-6 bg-muted/30 rounded-xl shadow-inner backdrop-blur-sm">
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            Current count is {count}
          </div>
          <p className="text-3xl font-semibold text-center bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
            Count: {count}
          </p>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-400 to-secondary-400 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, count * 5)}%` }}
              role="progressbar"
              aria-valuenow={count}
              aria-valuemin={0}
              aria-valuemax={20}
            ></div>
          </div>
        </div>

        <Input
          type="number"
          value={count}
          onChange={handleInputChange}
          aria-label="Set count value"
          min={0}
          className="text-center shadow-sm"
        />
      </CardContent>

      <CardFooter className="flex justify-between pt-2 pb-6">
        <Button
          variant="destructive"
          onClick={handleDecrement}
          aria-label="Decrease count"
          className="relative overflow-hidden group"
          disabled={count === 0}
        >
          <span className="relative z-10">Decrease</span>
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              aria-label="Show dialog with current count"
              className="relative group"
            >
              <span className="relative z-10">Show Dialog</span>
              <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Current Count: {count}</DialogTitle>
              <DialogDescription>
                This dialog demonstrates the shadcn/ui components working with Tailwind v4.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setOpen(false)} variant="secondary" className="flex-1">
                Close
              </Button>
              <Button variant="destructive" onClick={handleReset} className="flex-1">
                Reset Count
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="gradient"
          onClick={handleIncrement}
          aria-label="Increase count"
          className="relative overflow-hidden group"
        >
          Increase
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestComponent;
