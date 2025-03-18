/**
 * @file ftue.integration.test.tsx
 * @description Integration tests for the First Time User Experience flow
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FirstTimeUserExperience from '../../../src/components/FirstTimeUserExperience';
import AudioService from '../../../src/services/AudioService';
import HapticService from '../../../src/services/HapticService';

// Mock dependencies
jest.mock('../../../src/lib/ContextProvider', () => ({
  useFrameContext: () => ({
    isReady: true,
    sdk: {},
    frameData: {},
    frameActionPayload: null,
  }),
}));

jest.mock('../../../src/services/AudioService', () => ({
  play: jest.fn(),
  setEnabled: jest.fn(),
  isEnabled: jest.fn().mockReturnValue(true),
}));

jest.mock('../../../src/services/HapticService', () => ({
  subtle: jest.fn(),
  medium: jest.fn(),
  success: jest.fn(),
  setEnabled: jest.fn(),
  isEnabled: jest.fn().mockReturnValue(true),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
  };
});

describe('FirstTimeUserExperience Integration', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display welcome step initially', () => {
    render(<FirstTimeUserExperience onComplete={() => {}} />);

    // Check welcome step content
    expect(screen.getByText('Welcome to This or That!')).toBeInTheDocument();
    expect(screen.getByText(/The daily choice game/)).toBeInTheDocument();
  });

  it('should play sound and trigger haptic feedback on mount', () => {
    render(<FirstTimeUserExperience onComplete={() => {}} />);

    expect(AudioService.play).toHaveBeenCalledWith('pop');
    expect(HapticService.medium).toHaveBeenCalled();
  });

  it('should navigate through all steps when clicking next', () => {
    render(<FirstTimeUserExperience onComplete={() => {}} />);

    // Initially on welcome step
    expect(screen.getByText('Welcome to This or That!')).toBeInTheDocument();

    // Click next to go to voting step
    fireEvent.click(screen.getByText('Next'));
    expect(AudioService.play).toHaveBeenCalledWith('pop');
    expect(HapticService.subtle).toHaveBeenCalled();
    expect(screen.getByText('Quick & Easy Voting')).toBeInTheDocument();

    // Click next to go to streaks step
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText(/Build Your Streak/)).toBeInTheDocument();

    // Click next to go to achievements step
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText(/Unlock Achievements/)).toBeInTheDocument();
  });

  it('should call onComplete when finishing all steps', () => {
    const onCompleteMock = jest.fn();
    render(<FirstTimeUserExperience onComplete={onCompleteMock} />);

    // Go through all steps
    fireEvent.click(screen.getByText('Next')); // Welcome -> Voting
    fireEvent.click(screen.getByText('Next')); // Voting -> Streaks
    fireEvent.click(screen.getByText('Next')); // Streaks -> Achievements

    // Click final "Let's Start!" button
    fireEvent.click(screen.getByText("Let's Start!"));

    // Success haptic should be triggered
    expect(HapticService.success).toHaveBeenCalled();

    // Use act to handle the setTimeout
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // onComplete should be called
    expect(onCompleteMock).toHaveBeenCalled();
  });

  it('should support customized steps', () => {
    render(
      <FirstTimeUserExperience onComplete={() => {}} showSteps={['welcome', 'achievements']} />
    );

    // Initially on welcome step
    expect(screen.getByText('Welcome to This or That!')).toBeInTheDocument();

    // Click next to go directly to achievements (skipping voting and streaks)
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText(/Unlock Achievements/)).toBeInTheDocument();

    // This should now show "Let's Start!" as it's the last step
    expect(screen.getByText("Let's Start!")).toBeInTheDocument();
  });
});
