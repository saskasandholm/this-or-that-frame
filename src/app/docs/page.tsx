'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NavigationBar from '@/components/NavigationBar';
import { Book, Code, FileText, Globe, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocumentationPage() {
  const [frameImplementation, setFrameImplementation] = useState('');
  const [implementationNotes, setImplementationNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDocumentation() {
      try {
        const frameRes = await fetch('/docs/FRAME_IMPLEMENTATION.md');
        const implementationRes = await fetch('/docs/implementation-notes.md');

        if (frameRes.ok) {
          const frameText = await frameRes.text();
          setFrameImplementation(frameText);
        }

        if (implementationRes.ok) {
          const implementationText = await implementationRes.text();
          setImplementationNotes(implementationText);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading documentation:', error);
        setIsLoading(false);
      }
    }

    loadDocumentation();
  }, []);

  const formatMarkdown = (text: string) => {
    // Very basic markdown formatting
    const formatted = text
      // Format headers
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')

      // Format code blocks
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-muted/50 p-4 rounded-md overflow-auto my-4 text-sm">$1</pre>'
      )

      // Format inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted/30 px-1 py-0.5 rounded text-sm">$1</code>')

      // Format lists
      .replace(/^- (.*$)/gm, '<li class="ml-6 list-disc my-1">$1</li>')
      .replace(/^\d\. (.*$)/gm, '<li class="ml-6 list-decimal my-1">$1</li>')

      // Format paragraphs
      .replace(/^(?!<[h|l|p|u|c|o])(.*$)/gm, '<p class="my-2">$1</p>')

      // Format horizontal rules
      .replace(/^---$/gm, '<hr class="my-4 border-t border-border" />');

    return formatted;
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 bg-clip-text text-transparent">
            Project Documentation
          </h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                About This Documentation
              </CardTitle>
              <CardDescription>
                Technical documentation and implementation details for the This or That Farcaster
                Frame
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This documentation provides an overview of how the This or That frame is
                implemented, including details about the frame specification, API endpoints, and
                technical decisions. It is intended for developers who want to understand how the
                project works or contribute to its development.
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="frame" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="frame" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Frame Implementation</span>
                <span className="inline sm:hidden">Frame</span>
              </TabsTrigger>
              <TabsTrigger value="implementation" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">Implementation Notes</span>
                <span className="inline sm:hidden">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                <span className="hidden sm:inline">External Resources</span>
                <span className="inline sm:hidden">Resources</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="frame">
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">
                    Loading documentation...
                  </div>
                </div>
              ) : (
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Farcaster Frame Implementation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 pb-8 prose prose-invert max-w-none">
                    <div
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(frameImplementation) }}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="implementation">
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse text-muted-foreground">
                    Loading documentation...
                  </div>
                </div>
              ) : (
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Implementation Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 pb-8 prose prose-invert max-w-none">
                    <div
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(implementationNotes) }}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="resources">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    External Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    <li className="border border-border rounded-lg p-4 transition-colors hover:bg-muted/20">
                      <a
                        href="https://docs.farcaster.xyz/reference/frames/spec"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col"
                      >
                        <span className="font-medium text-primary">
                          Farcaster Frame Specification
                        </span>
                        <span className="text-sm text-muted-foreground mt-1">
                          Official documentation for the Farcaster Frame specification
                        </span>
                      </a>
                    </li>
                    <li className="border border-border rounded-lg p-4 transition-colors hover:bg-muted/20">
                      <a
                        href="https://www.npmjs.com/package/@farcaster/frame-sdk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col"
                      >
                        <span className="font-medium text-primary">Farcaster Frame SDK</span>
                        <span className="text-sm text-muted-foreground mt-1">
                          NPM package for developing Farcaster Frames
                        </span>
                      </a>
                    </li>
                    <li className="border border-border rounded-lg p-4 transition-colors hover:bg-muted/20">
                      <a
                        href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col"
                      >
                        <span className="font-medium text-primary">Web Share API</span>
                        <span className="text-sm text-muted-foreground mt-1">
                          Mozilla documentation for the Web Share API used in the direct challenge
                          feature
                        </span>
                      </a>
                    </li>
                    <li className="border border-border rounded-lg p-4 transition-colors hover:bg-muted/20">
                      <a
                        href="https://nextjs.org/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col"
                      >
                        <span className="font-medium text-primary">Next.js Documentation</span>
                        <span className="text-sm text-muted-foreground mt-1">
                          Official documentation for Next.js, the framework used for this
                          application
                        </span>
                      </a>
                    </li>
                    <li className="border border-border rounded-lg p-4 transition-colors hover:bg-muted/20">
                      <a
                        href="https://www.prisma.io/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col"
                      >
                        <span className="font-medium text-primary">Prisma Documentation</span>
                        <span className="text-sm text-muted-foreground mt-1">
                          Official documentation for Prisma, the ORM used for database access
                        </span>
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
