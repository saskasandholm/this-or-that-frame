/**
 * Service for providing haptic feedback on mobile devices
 */
class HapticService {
  private static instance: HapticService;
  private enabled: boolean = true;

  private constructor() {
    // Initialize service
  }

  static getInstance(): HapticService {
    if (!HapticService.instance) {
      HapticService.instance = new HapticService();
    }
    return HapticService.instance;
  }

  /**
   * Trigger a light haptic feedback
   */
  light(): void {
    if (!this.enabled || typeof navigator === 'undefined') return;

    try {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch (error) {
      console.error('Error during light haptic feedback:', error);
    }
  }

  /**
   * Trigger a medium haptic feedback
   */
  medium(): void {
    if (!this.enabled || typeof navigator === 'undefined') return;

    try {
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    } catch (error) {
      console.error('Error during haptic feedback:', error);
    }
  }

  /**
   * Trigger a heavy haptic feedback
   */
  heavy(): void {
    if (!this.enabled || typeof navigator === 'undefined') return;

    try {
      if (navigator.vibrate) {
        navigator.vibrate([40, 30, 40]);
      }
    } catch (error) {
      console.error('Error during haptic feedback:', error);
    }
  }

  /**
   * Trigger a subtle haptic feedback
   */
  subtle(): void {
    if (!this.enabled || typeof navigator === 'undefined') return;

    try {
      if (navigator.vibrate) {
        navigator.vibrate(5);
      }
    } catch (error) {
      console.error('Error during subtle haptic feedback:', error);
    }
  }

  /**
   * Trigger a strong haptic feedback
   */
  strong(): void {
    if (!this.enabled || typeof navigator === 'undefined') return;

    try {
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch (error) {
      console.error('Error during strong haptic feedback:', error);
    }
  }

  /**
   * Trigger a success haptic feedback
   */
  success(): void {
    if (!this.enabled || typeof navigator === 'undefined') return;

    try {
      if (navigator.vibrate) {
        navigator.vibrate([10, 20, 10]);
      }
    } catch (error) {
      console.error('Error during success haptic feedback:', error);
    }
  }

  /**
   * Trigger an error haptic feedback
   */
  error(): void {
    if (!this.enabled || typeof navigator === 'undefined') return;

    try {
      if (navigator.vibrate) {
        navigator.vibrate([30, 10, 30]);
      }
    } catch (error) {
      console.error('Error during error haptic feedback:', error);
    }
  }

  /**
   * Trigger a celebration haptic feedback
   */
  celebration(): void {
    if (!this.enabled || typeof navigator === 'undefined') return;

    try {
      if (navigator.vibrate) {
        navigator.vibrate([10, 10, 10, 10, 10]);
      }
    } catch (error) {
      console.error('Error during celebration haptic feedback:', error);
    }
  }

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(value: boolean): void {
    this.enabled = value;
  }

  /**
   * Check if haptic feedback is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if haptic feedback is supported
   */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }
}

export default HapticService.getInstance();
