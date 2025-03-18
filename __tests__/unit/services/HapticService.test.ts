/**
 * @file HapticService.test.ts
 * @description Unit tests for the HapticService utility
 */

import HapticService from '../../../src/services/HapticService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock navigator.vibrate
const vibrateMock = jest.fn();

describe('HapticService', () => {
  // Setup mocks
  beforeEach(() => {
    // Reset mocks
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(window, 'navigator', {
      value: {
        vibrate: vibrateMock,
      },
      writable: true,
    });

    // Clear mocks
    localStorageMock.clear();
    vibrateMock.mockClear();
  });

  describe('isSupported', () => {
    it('should return true when vibration API is supported', () => {
      // Mock navigator with vibrate property
      expect(HapticService.isSupported()).toBe(true);
    });

    it('should return false when vibration API is not supported', () => {
      // Remove vibrate property
      Object.defineProperty(window, 'navigator', {
        value: {},
        writable: true,
      });

      expect(HapticService.isSupported()).toBe(false);
    });
  });

  describe('setEnabled and isEnabled', () => {
    it('should save user preference to localStorage', () => {
      HapticService.setEnabled(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hapticEnabled', 'true');

      HapticService.setEnabled(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hapticEnabled', 'false');
    });

    it('should return correct enabled status from localStorage', () => {
      // Set to false
      localStorageMock.getItem.mockReturnValueOnce('false');
      expect(HapticService.isEnabled()).toBe(false);

      // Set to true
      localStorageMock.getItem.mockReturnValueOnce('true');
      expect(HapticService.isEnabled()).toBe(true);
    });
  });

  describe('haptic feedback methods', () => {
    it('should trigger light vibration', () => {
      HapticService.light();
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it('should trigger subtle vibration', () => {
      HapticService.subtle();
      expect(vibrateMock).toHaveBeenCalledWith(5);
    });

    it('should trigger medium vibration', () => {
      HapticService.medium();
      expect(vibrateMock).toHaveBeenCalledWith(20);
    });

    it('should trigger strong vibration', () => {
      HapticService.strong();
      expect(vibrateMock).toHaveBeenCalledWith(30);
    });

    it('should trigger success pattern', () => {
      HapticService.success();
      expect(vibrateMock).toHaveBeenCalledWith([10, 20, 10]);
    });

    it('should trigger error pattern', () => {
      HapticService.error();
      expect(vibrateMock).toHaveBeenCalledWith([30, 10, 30]);
    });

    it('should trigger celebration pattern', () => {
      HapticService.celebration();
      expect(vibrateMock).toHaveBeenCalledWith([10, 10, 10, 10, 10]);
    });

    it('should not trigger vibration when haptic is disabled', () => {
      HapticService.setEnabled(false);
      HapticService.celebration();
      expect(vibrateMock).not.toHaveBeenCalled();
    });

    it('should not trigger vibration when device does not support it', () => {
      Object.defineProperty(window, 'navigator', {
        value: {},
        writable: true,
      });
      HapticService.celebration();
      expect(vibrateMock).not.toHaveBeenCalled();
    });
  });
});
