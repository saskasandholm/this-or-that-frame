import { useEffect, useState, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { config } from '@/components/providers/WagmiProvider';

export default function Demo() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [isContextOpen, setIsContextOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const loadSDK = async () => {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return;

      try {
        // Check if we're in a Farcaster frame environment
        if (window.FrameSDK) {
          console.log('FrameSDK detected, initializing...');
          
          // Get context information if available
          if (window.FrameSDK.context) {
            setContext(window.FrameSDK.context);
          }
          
          // Signal that we're ready to display content
          window.FrameSDK.actions.ready();
          setIsSDKLoaded(true);
          console.log('FrameSDK ready signal sent');
        } else {
          console.log('FrameSDK not available - not in Farcaster frame context');
          setIsSDKLoaded(false);
        }
      } catch (error) {
        console.error('Error initializing FrameSDK:', error);
      }
    };

    loadSDK();

    // Set up retry with interval (2 seconds max)
    let attempts = 0;
    const maxAttempts = 20;
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (window.FrameSDK && !isSDKLoaded) {
        console.log(`FrameSDK found on attempt ${attempts}, initializing...`);
        loadSDK();
      }
      
      if (isSDKLoaded || attempts >= maxAttempts) {
        clearInterval(checkInterval);
      }
    }, 100);

    // Cleanup
    return () => {
      clearInterval(checkInterval);
    };
  }, [isSDKLoaded]);

  const toggleContext = useCallback(() => {
    setIsContextOpen(prev => !prev);
  }, []);

  const toggleWalletConnection = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: config.connectors[0] });
    }
  }, [isConnected, connect, disconnect]);

  if (!isSDKLoaded && typeof window !== 'undefined') {
    return (
      <div className="w-[300px] mx-auto py-4 px-2">
        <p className="text-center">Loading Frame SDK...</p>
      </div>
    );
  }

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <h1 className="text-2xl font-bold text-center mb-4">This or That</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-bold">Context</h2>
        <button
          onClick={toggleContext}
          className="flex items-center gap-2 mb-2"
        >
          <span
            className={`transform transition-transform ${
              isContextOpen ? 'rotate-90' : ''
            }`}
          >
            ➤
          </span>
          {isContextOpen ? 'Hide context' : 'Show context'}
        </button>

        {isContextOpen && context && (
          <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <pre className="font-mono text-xs whitespace-pre-wrap break-words max-w-[260px] overflow-x-auto">
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold">Wallet</h2>
        {address && (
          <div className="my-2 text-sm">
            Connected: {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </div>
        )}
        
        <button
          onClick={toggleWalletConnection}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
        >
          {isConnected ? 'Disconnect' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  );
} 