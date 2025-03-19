/**
 * Type declarations for @farcaster/frame-sdk
 * @see https://docs.farcaster.xyz/reference/frames/sdk
 * @version 0.0.31
 */

declare module '@farcaster/frame-sdk' {
  // Frame Action Payload
  export interface FrameActionPayload {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    castId: {
      fid: number;
      hash: string;
    };
    inputText?: string;
    state?: Record<string, string>;
  }

  // Frame Context
  export interface FrameContext {
    user?: {
      fid?: number;
      username?: string;
      displayName?: string;
      pfpUrl?: string;
    };
    fid?: number;
    url?: string;
    verified?: boolean;
    network?: number;
    messageHash?: string;
    timestamp?: number;
    castId?: {
      fid: number;
      hash: string;
    };
    buttonIndex?: number;
    inputText?: string;
    state?: Record<string, string>;
  }

  // Frame Notification Details
  export interface FrameNotificationDetails {
    url: string;
    token: string;
  }

  // AddFrame result types
  export type AddFrameResult =
    | {
        type: 'success';
        notificationDetails?: FrameNotificationDetails;
      }
    | {
        type: 'error';
        errorReason: 'invalid-domain-manifest' | 'rejected-by-user';
      };

  // SDK actions
  export interface Actions {
    ready(): Promise<void>;
    openUrl(url: string): Promise<void>;
    close(): Promise<void>;
    setPrimaryButton(options: any): Promise<void>;
    addFrame(): Promise<AddFrameResult>;
    signIn(): Promise<any>;
    viewProfile(): Promise<any>;
    viewToken(): Promise<any>;
    swap(): Promise<any>;
  }

  // Event callbacks
  export interface EventMap {
    primaryButtonClicked: () => void;
    frameAdded: ({
      notificationDetails,
    }: {
      notificationDetails?: FrameNotificationDetails;
    }) => void;
    frameAddRejected: ({ reason }: { reason: string }) => void;
    frameRemoved: () => void;
    notificationsEnabled: ({
      notificationDetails,
    }: {
      notificationDetails: FrameNotificationDetails;
    }) => void;
    notificationsDisabled: () => void;
  }

  // Wallet provider
  export interface Wallet {
    ethProvider: any;
  }

  // The main SDK interface
  export interface FrameSDK {
    context: Promise<FrameContext>;
    actions: Actions;
    wallet: Wallet;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    removeAllListeners(): void;
  }

  // Default export
  const sdk: FrameSDK;
  export default sdk;
}
