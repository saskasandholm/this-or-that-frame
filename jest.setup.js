// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Set up timing mocks
jest.useFakeTimers();

// For debugging
if (typeof window !== 'undefined') {
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

// Mock localStorage
if (typeof window !== 'undefined') {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: jest.fn(key => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
}

// Mock for navigator.vibrate (for HapticService)
if (typeof window !== 'undefined') {
  Object.defineProperty(window.navigator, 'vibrate', {
    value: jest.fn(),
    writable: true,
  });
}

// Mock for AudioContext (for AudioService)
if (typeof window !== 'undefined') {
  window.AudioContext = jest.fn().mockImplementation(() => ({
    createGain: jest.fn().mockReturnValue({
      connect: jest.fn(),
      gain: {
        value: 1,
      },
    }),
    createOscillator: jest.fn().mockReturnValue({
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: {
        value: 0,
      },
    }),
    destination: {},
  }));
}

// Prevent console errors from cluttering test output
jest.spyOn(console, 'error').mockImplementation(() => {});

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
