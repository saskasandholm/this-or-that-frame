'use client';

import { Card } from '@/components/ui/card';

export default function ImplementationNotesPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Client-Side Only Rendering</h2>
        <Card className="p-4">
          <p>
            Farcaster Frames must be implemented as client-side components with SSR disabled due to the 
            wallet integration requirements. Use Next.js dynamic imports with the <code>ssr: false</code> option:
          </p>
          <pre className="bg-muted p-2 rounded-md my-2 overflow-x-auto">
{`// Dynamically import with SSR disabled
const FrameComponent = dynamic(
  () => import('@/components/your-frame-component'),
  { ssr: false }
);`}
          </pre>
          <p>
            Additionally, mark your page component with <code>'use client';</code> directive and 
            set the dynamic config to <code>'force-dynamic'</code> to ensure proper rendering:
          </p>
          <pre className="bg-muted p-2 rounded-md my-2 overflow-x-auto">
{`'use client';

// Next.js dynamic rendering config
export const dynamic = 'force-dynamic';`}
          </pre>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Wallet Connection Flow</h2>
        <Card className="p-4">
          <p>
            When implementing wallet connectivity in Frames, consider the following pattern:
          </p>
          <ol className="list-decimal pl-5 space-y-2 my-2">
            <li>Wrap your Frame component with a wallet provider (e.g., WagmiProvider)</li>
            <li>Create a connection button that handles both connect and disconnect actions</li>
            <li>Display connection status and relevant wallet information when connected</li>
            <li>Implement fallbacks for non-Frame environments</li>
          </ol>
          <p>
            Always include appropriate error handling and loading states to enhance user experience.
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Transaction & Message Signing</h2>
        <Card className="p-4">
          <p>
            For wallet interactions like transactions and message signing:
          </p>
          <ul className="list-disc pl-5 space-y-2 my-2">
            <li>Use the wagmi hooks for consistent wallet interactions</li>
            <li>Implement proper error handling for rejected transactions</li>
            <li>Display transaction status clearly to users</li>
            <li>Consider gas estimation and network congestion handling</li>
            <li>Allow users to verify message content before signing</li>
          </ul>
          <p>
            Always provide clear feedback during the transaction lifecycle (pending, success, error).
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Testing Your Frame</h2>
        <Card className="p-4">
          <p>
            Before deployment, test your Frame implementation thoroughly:
          </p>
          <ul className="list-disc pl-5 space-y-2 my-2">
            <li>Test in multiple wallets (MetaMask, WalletConnect, etc.)</li>
            <li>Test across different networks (Mainnet, Testnet)</li>
            <li>Verify the fallback UI in non-Frame environments</li>
            <li>Check mobile responsiveness</li>
            <li>Test error scenarios (rejected transactions, etc.)</li>
          </ul>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Security Considerations</h2>
        <Card className="p-4">
          <p>
            Ensure your Frame implementation follows these security best practices:
          </p>
          <ul className="list-disc pl-5 space-y-2 my-2">
            <li>Never expose private keys or sensitive information</li>
            <li>Clearly communicate transaction details before signing</li>
            <li>Implement proper input validation</li>
            <li>Set appropriate gas limits for transactions</li>
            <li>Use secure connections (HTTPS) for all API calls</li>
            <li>Consider implementing rate limiting for API requests</li>
          </ul>
        </Card>
      </section>
    </div>
  );
} 