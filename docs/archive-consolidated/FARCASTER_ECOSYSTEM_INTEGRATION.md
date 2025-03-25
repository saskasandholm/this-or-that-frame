# Farcaster Ecosystem Integration

*Last Updated: March 25, 2025*


## Overview

While Frames provide an excellent entry point into the Farcaster ecosystem, there are many more ways to integrate with Farcaster to create rich, connected experiences. This document explores options for deeper Farcaster integration, including direct protocol access via Hubble, cast creation, channel interactions, and more.

## Integration Paths

### 1. Frames + Auth-kit (Current Implementation)

Our current implementation focuses on:

- Frame interactions via the Frame Protocol
- Authentication with Auth-kit for user identity

This is an excellent starting point but represents only a portion of what's possible with Farcaster integration.

### 2. Hubble Integration (Direct Protocol Access)

Hubble is Farcaster's peer-to-peer network node implementation, allowing direct interaction with the Farcaster protocol.

#### Benefits

- Direct access to the Farcaster protocol
- Real-time data and events
- Lower latency than API-based access
- Greater independence from third-party service providers

#### Use Cases

- Building custom analytics
- Creating real-time notifications
- Implementing advanced search capabilities
- Developing custom moderation tools

#### Implementation Options

1. **Self-hosted Hubble node**
   - Complete control over your node
   - Higher infrastructure requirements
2. **Hubble API services**
   - Simplified access via API providers
   - Less infrastructure management
   - Potential rate limits and costs

### 3. Warpcast API (Official Client API)

Warpcast provides APIs for certain Farcaster operations, which can be a simpler alternative to direct Hubble integration.

#### Benefits

- Easier implementation than direct Hubble integration
- Official support from the Warpcast team
- Standardized API endpoints

#### Limitations

- Limited to features supported by Warpcast
- Rate limits and API changes
- Potential future pricing changes

### 4. Third-party Farcaster API Services (Neynar, etc.)

Several third-party providers offer APIs for Farcaster data:

#### Options

- **Neynar**: Comprehensive Farcaster API services
- **Farcart**: Simplified Farcaster data access
- **Frame.farcaster.xyz**: Frame-specific tools and services

#### Benefits

- Rapid implementation
- Managed infrastructure
- Developer-friendly documentation

#### Considerations

- Third-party dependencies
- Potential costs as usage scales
- Limited customization compared to direct Hubble access

## Technical Integration Paths

### 1. Hubble Integration

#### Self-hosting a Hubble Node

Requirements:

- Server with at least 4 CPU cores, 8GB RAM
- At least 50GB storage
- Stable internet connection

Setup process:

```bash
# Install Hubble
git clone https://github.com/farcasterxyz/hub-monorepo.git
cd hub-monorepo/apps/hubble

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Build and run
yarn install
yarn build
yarn start
```

#### Connecting to a Hubble Node

```typescript
// Using the Farcaster Hub Kit
import { getSSLHubRpcClient } from '@farcaster/hub-nodejs';

const hubClient = getSSLHubRpcClient('your-hubble-node.example.com:2283');

// Example: Get user by FID
const response = await hubClient.getUserByFid({ fid: 1 });
if (response.isOk()) {
  console.log(response.value.user);
}
```

### 2. Creating and Interacting with Casts

Creating casts programmatically via Hubble:

```typescript
import { getSSLHubRpcClient, makeCastAdd } from '@farcaster/hub-nodejs';
import { hexToBytes } from '@noble/hashes/utils';

// Your application's signer private key
const privateKey = hexToBytes('your-private-key');

async function createCast(text, fid) {
  const hubClient = getSSLHubRpcClient('your-hubble-node.example.com:2283');

  // Create the cast
  const castAdd = await makeCastAdd(
    {
      text,
      embedsDeprecated: [],
      mentions: [],
      mentionsPositions: [],
      parentUrl: null,
      parentFid: null,
      parentHash: null,
    },
    { fid, network: 'MAINNET' },
    privateKey
  );

  // Submit to the network
  const result = await hubClient.submitMessage({ message: castAdd });

  if (result.isOk()) {
    return { success: true, hash: castAdd.hash };
  } else {
    return { success: false, error: result.error };
  }
}

// Example usage
await createCast('Hello Farcaster from my app!', 12345);
```

### 3. Reactions and Engagement

Implementing reactions (likes, recasts):

```typescript
import { getSSLHubRpcClient, makeReactionAdd } from '@farcaster/hub-nodejs';
import { hexToBytes } from '@noble/hashes/utils';

async function addReaction(targetFid, targetHash, reactionType, userFid) {
  const hubClient = getSSLHubRpcClient('your-hubble-node.example.com:2283');
  const privateKey = hexToBytes('your-private-key');

  // Create the reaction
  const reactionAdd = await makeReactionAdd(
    {
      targetCastId: {
        fid: targetFid,
        hash: targetHash,
      },
      type: reactionType, // 'like' or 'recast'
    },
    { fid: userFid, network: 'MAINNET' },
    privateKey
  );

  // Submit to the network
  const result = await hubClient.submitMessage({ message: reactionAdd });

  return result.isOk() ? { success: true } : { success: false, error: result.error };
}

// Example: Like a cast
await addReaction(5678, '0x1234...', 'like', 12345);
```

### 4. Following Users and Channels

```typescript
import { getSSLHubRpcClient, makeLinkAdd } from '@farcaster/hub-nodejs';
import { hexToBytes } from '@noble/hashes/utils';

async function followUser(targetFid, userFid) {
  const hubClient = getSSLHubRpcClient('your-hubble-node.example.com:2283');
  const privateKey = hexToBytes('your-private-key');

  // Create the follow link
  const linkAdd = await makeLinkAdd(
    {
      type: 'follow',
      targetFid: targetFid,
    },
    { fid: userFid, network: 'MAINNET' },
    privateKey
  );

  // Submit to the network
  const result = await hubClient.submitMessage({ message: linkAdd });

  return result.isOk() ? { success: true } : { success: false, error: result.error };
}

// Example: Follow a user
await followUser(5678, 12345);
```

## Integration with Our Application

### 1. Unified User Experience

Connect the Frame experience with the broader Farcaster ecosystem:

```typescript
// In a user profile page component
function UserProfile() {
  const { user } = useAuth();
  const { casts, isLoading } = useFarcasterCasts(user?.fid);

  if (isLoading) return <Loading />;

  return (
    <div>
      <UserHeader fid={user.fid} username={user.username} />

      <div>
        <h2>Your Recent Casts</h2>
        <CastList casts={casts} />

        <button onClick={() => openCastComposer()}>
          Create New Cast
        </button>
      </div>

      <div>
        <h2>Your This or That Votes</h2>
        <VotingHistory fid={user.fid} />
      </div>
    </div>
  );
}
```

### 2. Social Authentication Flow

Use Farcaster authentication as the foundation of the user experience:

```typescript
// src/components/FrameAuthPrompt.tsx
export function FrameAuthPrompt() {
  return (
    <div className="auth-prompt">
      <h2>Continue with Farcaster</h2>
      <p>Sign in with your Farcaster account to:</p>
      <ul>
        <li>Save your voting history</li>
        <li>Earn achievements</li>
        <li>Compare with friends</li>
        <li>Create and share topics</li>
      </ul>

      <SignInButton />

      <div className="skip-option">
        <button onClick={() => continueAnonymously()}>
          Continue without signing in
        </button>
        <p className="text-sm text-gray-500">
          You can sign in later to save your progress
        </p>
      </div>
    </div>
  );
}
```

### 3. Cast Creation Integration

Allow users to create casts about their votes:

```typescript
// src/components/ShareResultsOnFarcaster.tsx
export function ShareResultsOnFarcaster({ topic, userChoice, stats }) {
  const { user, isAuthenticated } = useAuth();
  const { createCast, isLoading, error } = useCreateCast();

  if (!isAuthenticated) {
    return (
      <div>
        <p>Sign in with Farcaster to share your vote</p>
        <SignInButton />
      </div>
    );
  }

  const handleShare = async () => {
    const text = `I chose "${userChoice === 'A' ? topic.optionA : topic.optionB}" on the "${topic.question}" This or That.\n\nWhere do you stand? Vote now!`;

    try {
      await createCast(text, user.fid);
      showSuccessToast('Successfully shared on Farcaster!');
    } catch (err) {
      showErrorToast('Failed to share on Farcaster');
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      className="share-button"
    >
      {isLoading ? 'Sharing...' : 'Share on Farcaster'}
    </button>
  );
}
```

### 4. Friend Leaderboards via Farcaster Graph

Implement friend leaderboards using Farcaster's social graph:

```typescript
// src/hooks/useFarcasterFriends.ts
export function useFarcasterFriends(fid) {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fid) return;

    const fetchFriends = async () => {
      try {
        setIsLoading(true);

        // Get users that the current user follows
        const response = await fetch(`/api/farcaster/following?fid=${fid}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch friends');
        }

        setFriends(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [fid]);

  return { friends, isLoading, error };
}
```

## Advanced Integration: Hubble Node Setup

For applications requiring deep Farcaster integration, setting up a dedicated Hubble node provides the most flexibility and control.

### Self-hosted Hubble Setup

#### 1. Server Requirements

- Linux server (Ubuntu 20.04+ recommended)
- Minimum specs:
  - 4 CPU cores
  - 8GB RAM
  - 50GB+ SSD storage
  - Good network connection

#### 2. Installation

```bash
# Clone the repository
git clone https://github.com/farcasterxyz/hub-monorepo.git
cd hub-monorepo/apps/hubble

# Install dependencies
yarn install

# Configure environment
cp .env.example .env

# Edit .env with your settings
# Set HUBBLE_NETWORK=MAINNET
# Configure RPC endpoints, etc.

# Build and run
yarn build
yarn start
```

#### 3. Monitoring and Maintenance

- Use PM2 for process management
- Set up monitoring with Prometheus or similar tools
- Implement regular backups of your Hubble data
- Monitor disk usage and system resources

#### 4. Connection from Application

```typescript
// src/lib/hubbleClient.ts
import { getSSLHubRpcClient } from '@farcaster/hub-nodejs';

// Create a singleton client
let hubClient;

export function getHubClient() {
  if (!hubClient) {
    const hubHost = process.env.HUBBLE_HOST;
    const hubPort = process.env.HUBBLE_PORT || '2283';

    hubClient = getSSLHubRpcClient(`${hubHost}:${hubPort}`);
  }

  return hubClient;
}
```

### Implementing a Sync Service

For applications that need real-time data from Farcaster, implementing a sync service is recommended:

```typescript
// src/services/farcasterSync.ts
import { getHubClient } from '@/lib/hubbleClient';
import { subscribe } from '@farcaster/hub-nodejs';

export async function startFarcasterSync() {
  const hubClient = getHubClient();

  // Subscribe to all new messages
  const eventStream = await hubClient.subscribe({
    eventTypes: ['MERGE_MESSAGE'],
  });

  // Process events
  for await (const event of eventStream) {
    if (event.type === 'MERGE_MESSAGE') {
      const { message } = event.mergeMessageBody;

      // Process different message types
      switch (message.data?.type) {
        case 'CAST_ADD':
          await processCast(message);
          break;

        case 'REACTION_ADD':
          await processReaction(message);
          break;

        case 'LINK_ADD':
          await processLink(message);
          break;
      }
    }
  }
}

async function processCast(message) {
  // Store cast in database
  // Notify relevant users
  // Update statistics
}

async function processReaction(message) {
  // Update reaction counts
  // Notify casters of new reactions
}

async function processLink(message) {
  // Update follow relationships
  // Refresh friend data
}

// Start sync service
if (process.env.NODE_ENV === 'production') {
  startFarcasterSync().catch(err => {
    console.error('Farcaster sync error:', err);
    process.exit(1);
  });
}
```

## Considerations and Best Practices

### 1. Rate Limiting and Quotas

- Implement proper rate limiting for all Farcaster API calls
- Consider backoff strategies for failed requests
- Monitor API usage and set up alerts for approaching limits

### 2. Data Synchronization

- Decide between real-time sync vs. periodic polling
- Consider eventual consistency in distributed systems
- Implement conflict resolution strategies

### 3. Error Handling

- Implement robust error handling for all Farcaster interactions
- Set up monitoring and alerting for integration failures
- Provide user-friendly error messages

### 4. Privacy and Security

- Only request necessary permissions
- Securely store user credentials and tokens
- Be transparent about data usage and sharing

### 5. Performance Optimization

- Cache frequently accessed Farcaster data
- Use connection pooling for Hubble RPC calls
- Implement batch operations where applicable

## Resources

- [Farcaster Protocol Documentation](https://docs.farcaster.xyz/protocol/overview)
- [Hubble Documentation](https://docs.farcaster.xyz/hubble/overview)
- [Farcaster Hub Kit](https://docs.farcaster.xyz/reference/hubble/hub-nodejs)
- [Auth-kit Documentation](https://docs.farcaster.xyz/auth-kit/introduction)
- [Warpcast API](https://warpcast.notion.site/Warpcast-v2-API-Documentation-c19a9494383a4ce0bd28db6d44d99ae8)
- [Neynar API Documentation](https://docs.neynar.com/)

## Conclusion

By integrating deeply with the Farcaster ecosystem, we can create a more comprehensive and engaging user experience that goes beyond the limitations of Frames alone. This approach allows us to leverage the social graph, content, and interactions of Farcaster while providing our unique value proposition through the "This or That" application.

The implementation strategy should be phased, starting with our current Frame + Auth-kit approach, then gradually expanding to include deeper Farcaster protocol integration as user adoption grows and requirements evolve.

## Next Steps

1. Complete the Auth-kit integration to establish user identity
2. Explore Hubble or third-party API options for social graph access
3. Implement friend data integration for leaderboards
4. Add cast creation capabilities for sharing results
5. Consider setting up a dedicated Hubble node for advanced features
