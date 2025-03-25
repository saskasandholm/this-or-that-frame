'use client';

import { Card } from '@/components/ui/card';

export default function FrameSpecificationPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Frame Protocol Overview</h2>
        <Card className="p-4">
          <p className="mb-2">
            Farcaster Frames are interactive UI elements embedded within Farcaster posts, allowing for:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Interactive buttons and user inputs</li>
            <li>Wallet connectivity and transaction signing</li>
            <li>Dynamic content based on user interactions</li>
            <li>Integration with web3 functionality</li>
          </ul>
          <p className="mt-2">
            Frames use HTTP POST requests and meta tags for state management and transitions between different Frame states.
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Frame Meta Tags</h2>
        <Card className="p-4">
          <p>Required meta tags for Frame implementation:</p>
          <table className="w-full border-collapse border border-muted mt-2">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-muted p-2 text-left">Tag</th>
                <th className="border border-muted p-2 text-left">Description</th>
                <th className="border border-muted p-2 text-left">Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-muted p-2"><code>fc:frame</code></td>
                <td className="border border-muted p-2">Indicates this is a Frame</td>
                <td className="border border-muted p-2"><code>fc:frame = "vNext"</code></td>
              </tr>
              <tr>
                <td className="border border-muted p-2"><code>fc:frame:image</code></td>
                <td className="border border-muted p-2">Image to display in the Frame</td>
                <td className="border border-muted p-2"><code>fc:frame:image = "https://..."</code></td>
              </tr>
              <tr>
                <td className="border border-muted p-2"><code>fc:frame:button:1</code></td>
                <td className="border border-muted p-2">First button label</td>
                <td className="border border-muted p-2"><code>fc:frame:button:1 = "Click Me"</code></td>
              </tr>
              <tr>
                <td className="border border-muted p-2"><code>fc:frame:post_url</code></td>
                <td className="border border-muted p-2">Endpoint for button actions</td>
                <td className="border border-muted p-2"><code>fc:frame:post_url = "https://..."</code></td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4">Optional meta tags:</p>
          <table className="w-full border-collapse border border-muted">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-muted p-2 text-left">Tag</th>
                <th className="border border-muted p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-muted p-2"><code>fc:frame:input:text</code></td>
                <td className="border border-muted p-2">Enable text input field</td>
              </tr>
              <tr>
                <td className="border border-muted p-2"><code>fc:frame:button:1:action</code></td>
                <td className="border border-muted p-2">Action type for button (e.g., "post", "mint", "link")</td>
              </tr>
              <tr>
                <td className="border border-muted p-2"><code>fc:frame:image:aspect_ratio</code></td>
                <td className="border border-muted p-2">Aspect ratio for the image (e.g., "1.91:1")</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Frame Payload Structure</h2>
        <Card className="p-4">
          <p>When a user interacts with a Frame, a POST request is sent with this payload:</p>
          <pre className="bg-muted p-2 rounded-md my-2 overflow-x-auto">
{`{
  "untrustedData": {
    "fid": 1, // Farcaster user ID
    "url": "https://...", // Frame URL
    "messageBytes": "0x...", // Message bytes
    "timestamp": 1706243218, // Unix timestamp
    "network": 1, // Farcaster network ID
    "buttonIndex": 1, // Button that was clicked
    "inputText": "..." // User input if text field was enabled
  },
  "trustedData": {
    "messageBytes": "0x..." // Validated message bytes
  }
}`}
          </pre>
          <p className="mt-2">
            Your backend should validate the messageBytes to ensure the request is authentic
            before processing any actions or state transitions.
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Wallet Integration</h2>
        <Card className="p-4">
          <p>
            Frames support wallet integration through specialized button actions:
          </p>
          <pre className="bg-muted p-2 rounded-md my-2 overflow-x-auto">
{`<meta property="fc:frame:button:1" content="Connect Wallet" />
<meta property="fc:frame:button:1:action" content="tx_request" />
<meta property="fc:frame:button:1:target" content="ethereum:0x..." />`}
          </pre>
          <p className="mt-2">
            Supported wallet actions include:
          </p>
          <ul className="list-disc pl-5 space-y-1 my-2">
            <li><code>tx_request</code>: Request a transaction signature</li>
            <li><code>message_signing</code>: Request a message signature</li>
            <li><code>connect</code>: Request wallet connection</li>
          </ul>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Debugging Tools</h2>
        <Card className="p-4">
          <p>
            Use these tools for debugging your Frame implementation:
          </p>
          <ul className="list-disc pl-5 space-y-1 my-2">
            <li>
              <a 
                href="https://warpcast.com/~/developers/frames" 
                target="_blank"
                rel="noopener noreferrer" 
                className="text-blue-500 hover:underline"
              >
                Warpcast Frame Validator
              </a>
              : Test your Frame and validate its structure
            </li>
            <li>
              <a 
                href="https://github.com/farcasterxyz/hub-monorepo" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Farcaster Hub Monorepo
              </a>
              : Frame protocol implementation details
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
} 