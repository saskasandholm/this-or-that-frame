import { BookOpen, Code2, ExternalLink } from 'lucide-react';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

const tabs = [
  {
    title: "Frame Specification",
    href: "/docs/frame-specification",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    title: "Implementation Notes", 
    href: "/docs/implementation-notes",
    icon: <Code2 className="h-4 w-4" />,
  },
  {
    title: "External Resources",
    href: "/docs/external-resources",
    icon: <ExternalLink className="h-4 w-4" />,
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <h1 className="text-3xl font-bold">Documentation</h1>
      
      <Tabs defaultValue="frame-specification" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map((tab) => (
            <Link href={tab.href} key={tab.href} passHref>
              <TabsTrigger value={tab.href.split('/').pop() || ''} className="flex items-center gap-2">
                {tab.icon}
                {tab.title}
              </TabsTrigger>
            </Link>
          ))}
        </TabsList>
      </Tabs>
      
      <div className="border rounded-lg p-6 bg-card">
        {children}
      </div>
    </div>
  );
} 