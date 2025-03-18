'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TestComponent from '@/components/TestComponent';
import SplashScreen from '@/components/SplashScreen';

export default function UIShowcasePage() {
  const [showSplash, setShowSplash] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center pb-10 border-b border-gray-800">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text animate-gradient mb-4">
            UI Component Showcase
          </h1>
          <p className="text-xl text-gray-300 max-w-xl mx-auto">
            A complete showcase of all shadcn/ui components with enhanced styling
          </p>
        </header>

        {/* Button Section */}
        <section className="space-y-8" id="buttons">
          <h2 className="text-3xl font-bold text-white">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardDescription>Different button styles for various purposes</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="default">Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="gradient" className="col-span-2">
                  Gradient
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
                <CardDescription>Different button sizes for various contexts</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
                <Button size="icon">
                  <span>🔍</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Button States</CardTitle>
                <CardDescription>Various button interaction states</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button className="relative group overflow-hidden">
                  <span className="relative z-10">Hover Effect</span>
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Button>
                <Button className="animate-pulse-gentle">Animated</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Card Section */}
        <section className="space-y-8" id="cards">
          <h2 className="text-3xl font-bold text-white">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
                <CardDescription>Basic card with header and content</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is a simple card with basic styling and no footer.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-card/80 to-card">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
                <CardDescription>Card with gradient background effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card has a subtle gradient background for enhanced visuals.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Action
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary/20 shadow-lg shadow-primary/10">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
                  Enhanced Card
                </CardTitle>
                <CardDescription>Card with advanced styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card has custom border, shadow and gradient text.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Submit</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Input Section */}
        <section className="space-y-8" id="inputs">
          <h2 className="text-3xl font-bold text-white">Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Inputs</CardTitle>
                <CardDescription>Standard input components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Standard input" />
                <Input placeholder="Disabled input" disabled />
                <Input placeholder="Email input" type="email" />
                <Input placeholder="Password input" type="password" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Styled Inputs</CardTitle>
                <CardDescription>Custom styled input components</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Border glow on focus" className="focus:animate-glow" />
                <Input placeholder="With icon" className="pl-9 relative" />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input placeholder="Amount" className="pl-8" />
                </div>
                <Input placeholder="Custom style" className="bg-primary/5 border-primary/20" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dialog Section */}
        <section className="space-y-8" id="dialogs">
          <h2 className="text-3xl font-bold text-white">Dialogs</h2>
          <Card>
            <CardHeader>
              <CardTitle>Dialog Examples</CardTitle>
              <CardDescription>Modal dialogs for various use cases</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Basic Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Basic Dialog</DialogTitle>
                    <DialogDescription>
                      This is a basic dialog with standard styling.
                    </DialogDescription>
                  </DialogHeader>
                  <p className="py-4">Dialog content goes here.</p>
                  <DialogFooter>
                    <Button>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Controlled Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Controlled Dialog</DialogTitle>
                    <DialogDescription>
                      This dialog's state is controlled by React state.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p>This dialog uses state to control opening and closing.</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="secondary" onClick={() => setShowSplash(true)}>
                Show Splash Screen
              </Button>
            </CardContent>
          </Card>

          {showSplash && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
              <div className="max-w-md w-full p-6">
                <SplashScreen onComplete={() => setShowSplash(false)} minDisplayTime={3000} />
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => setShowSplash(false)}>
                    Skip Animation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Test Component Section */}
        <section className="space-y-8" id="test-component">
          <h2 className="text-3xl font-bold text-white">Test Component</h2>
          <div className="max-w-md mx-auto">
            <TestComponent />
          </div>
        </section>
      </div>
    </main>
  );
}
