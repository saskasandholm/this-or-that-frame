/**
 * Utility for performance optimizations and monitoring
 */

/**
 * Measures time taken for a function to execute
 * @param fn - Function to measure
 * @param label - Label for the console output
 * @returns Result of the function
 */
export function measurePerformance<T>(fn: () => T, label: string): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`⚡ Performance [${label}]: ${Math.round(end - start)}ms`);

  return result;
}

/**
 * Measures time taken for an async function to execute
 * @param fn - Async function to measure
 * @param label - Label for the console output
 * @returns Promise with the result of the function
 */
export async function measureAsyncPerformance<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();

  console.log(`⚡ Performance [${label}]: ${Math.round(end - start)}ms`);

  return result;
}

/**
 * Debounces a function to prevent excessive calls
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttles a function to limit call frequency
 * @param fn - Function to throttle
 * @param limit - Limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function (...args: Parameters<T>): void {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;

        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

/**
 * Utility for efficient rendering on mobile devices
 */
export const renderOptimizer = {
  /**
   * Pauses animations during scroll to improve performance
   * @param callback - Optional callback when scrolling stops
   */
  optimizeScroll(callback?: () => void): () => void {
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let isScrolling = false;

    const onScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        document.body.classList.add('is-scrolling');
      }

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.body.classList.remove('is-scrolling');

        if (callback) {
          callback();
        }
      }, 150);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      document.body.classList.remove('is-scrolling');
    };
  },

  /**
   * Reduces animation complexity on low-end devices
   * @returns Whether optimizations were applied
   */
  reduceAnimations(): boolean {
    // Check if the device is likely low-end
    const isLowEndDevice =
      navigator.hardwareConcurrency <= 4 ||
      // Check for Chrome's non-standard memory API
      (typeof performance !== 'undefined' &&
        'memory' in performance &&
        (performance as any).memory?.jsHeapSizeLimit < 2147483648); // 2GB

    if (isLowEndDevice) {
      document.body.classList.add('reduced-motion');
      return true;
    }

    return false;
  },

  /**
   * Defers non-critical operations
   * @param fn - Function to defer
   * @param priority - Priority level (lower executes later)
   */
  deferOperation(fn: () => void, priority: 'low' | 'medium' | 'high' = 'low'): void {
    if (typeof requestIdleCallback !== 'undefined') {
      // Use requestIdleCallback if available
      requestIdleCallback(() => fn(), {
        timeout: priority === 'high' ? 100 : priority === 'medium' ? 500 : 1000,
      });
    } else {
      // Fall back to setTimeout with priority-based delays
      setTimeout(fn, priority === 'high' ? 1 : priority === 'medium' ? 50 : 100);
    }
  },

  /**
   * Pre-renders critical elements to improve perceived performance
   * @param selectors - CSS selectors of elements to pre-render
   */
  preRenderElements(selectors: string[]): void {
    requestAnimationFrame(() => {
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Force layout calculation
          el.getBoundingClientRect();
        });
      });
    });
  },
};

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  // Report largest contentful paint
  const reportLCP = () => {
    new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;

      console.log(`⚡ LCP: ${Math.round(lastEntry.startTime)}ms`);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  };

  // Report first input delay
  const reportFID = () => {
    new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        const fidEntry = entry as PerformanceEventTiming;
        console.log(`⚡ FID: ${Math.round(fidEntry.processingStart - fidEntry.startTime)}ms`);
      });
    }).observe({ type: 'first-input', buffered: true });
  };

  // Report cumulative layout shift
  const reportCLS = () => {
    let clsValue = 0;
    const clsEntries: PerformanceEntry[] = [];

    new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();

      entries.forEach(entry => {
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
          clsEntries.push(clsEntry);
        }
      });

      console.log(`⚡ CLS: ${clsValue.toFixed(4)}`);
    }).observe({ type: 'layout-shift', buffered: true });
  };

  // Initialize if in browser environment
  if (typeof window !== 'undefined') {
    // Wait until page is loaded
    if (document.readyState === 'complete') {
      reportLCP();
      reportFID();
      reportCLS();
    } else {
      window.addEventListener('load', () => {
        reportLCP();
        reportFID();
        reportCLS();
      });
    }
  }
}

/**
 * Utility for lazy loading images and components
 */
export const lazyLoader = {
  /**
   * Sets up intersection observer for lazy loading
   * @param selector - CSS selector for elements to observe
   * @param loadCallback - Callback when element enters viewport
   * @param options - IntersectionObserver options
   */
  observe(
    selector: string,
    loadCallback: (element: Element) => void,
    options: IntersectionObserverInit = { rootMargin: '200px 0px' }
  ): () => void {
    const elements = document.querySelectorAll(selector);

    if (elements.length === 0) return () => {};

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadCallback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    elements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  },

  /**
   * Preloads images in the background
   * @param urls - Array of image URLs to preload
   * @param priority - Whether to use high priority fetch
   */
  preloadImages(urls: string[], priority: boolean = false): void {
    urls.forEach(url => {
      if (priority) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
      } else {
        const img = new Image();
        renderOptimizer.deferOperation(() => {
          img.src = url;
        }, 'low');
      }
    });
  },
};

// Export default object with all optimizations
export default {
  measure: measurePerformance,
  measureAsync: measureAsyncPerformance,
  debounce,
  throttle,
  renderOptimizer,
  initPerformanceMonitoring,
  lazyLoader,
};
