'use client';

import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export default function ExternalResourcesPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Official Documentation</h2>
        <Card className="p-4">
          <ul className="space-y-3">
            <ResourceLink 
              title="Farcaster Frames Docs" 
              description="Official documentation for Farcaster Frames"
              url="https://docs.farcaster.xyz/learn/frames/introduction"
            />
            <ResourceLink 
              title="Frame Protocol Specification" 
              description="Technical specification for the Frame protocol"
              url="https://docs.farcaster.xyz/reference/frames/spec"
            />
            <ResourceLink 
              title="Farcaster Developer Hub" 
              description="Resources, SDKs, and tools for developers"
              url="https://docs.farcaster.xyz/developers"
            />
          </ul>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Libraries & SDKs</h2>
        <Card className="p-4">
          <ul className="space-y-3">
            <ResourceLink 
              title="@farcaster/core" 
              description="Official JavaScript SDK for Farcaster"
              url="https://github.com/farcasterxyz/hub-monorepo/tree/main/packages/core"
            />
            <ResourceLink 
              title="frames.js" 
              description="JavaScript SDK for building Farcaster Frames"
              url="https://github.com/framesjs/frames.js"
            />
            <ResourceLink 
              title="Frog" 
              description="Frame development framework built on Hono"
              url="https://github.com/wevm/frog"
            />
          </ul>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Tools & Resources</h2>
        <Card className="p-4">
          <ul className="space-y-3">
            <ResourceLink 
              title="Warpcast Frame Validator" 
              description="Test and validate your Frame implementation"
              url="https://warpcast.com/~/developers/frames"
            />
            <ResourceLink 
              title="Frame Inspector" 
              description="Debug and inspect Frame requests and responses"
              url="https://github.com/Zizzamia/farcaster-frame-inspector"
            />
            <ResourceLink 
              title="Frame Examples" 
              description="Collection of example Frame implementations"
              url="https://github.com/farcasterxyz/fc-frame-examples"
            />
          </ul>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Community Resources</h2>
        <Card className="p-4">
          <ul className="space-y-3">
            <ResourceLink 
              title="Farcaster Discord" 
              description="Join the Farcaster developer community"
              url="https://discord.gg/farcaster"
            />
            <ResourceLink 
              title="Farcaster Frame Bounties" 
              description="Earn rewards for building Frames"
              url="https://github.com/farcasterxyz/bounties"
            />
            <ResourceLink 
              title="Frame Analytics" 
              description="Track performance and engagement for your Frames"
              url="https://framelytics.xyz/"
            />
          </ul>
        </Card>
      </section>
    </div>
  );
}

// Helper component for external resource links
function ResourceLink({ title, description, url }: { 
  title: string; 
  description: string; 
  url: string;
}) {
  return (
    <li className="flex items-start">
      <ExternalLink className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0 text-muted-foreground" />
      <div>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-medium text-blue-500 hover:underline flex items-center"
        >
          {title}
        </a>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </li>
  );
} 