// Performance optimization utilities for the sports booking system

import { useCallback, useEffect, useRef, useState } from 'react';

// Debounce hook for search inputs and API calls
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll events and frequent updates
export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<Date>(new Date());

  useEffect(() => {
    if (Date.now() - lastExecuted.current.getTime() >= delay) {
      setThrottledValue(value);
      lastExecuted.current = new Date();
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = new Date();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Image lazy loading hook
export const useLazyImage = (src: string): { 
  loaded: boolean; 
  error: boolean; 
  imgRef: React.RefObject<HTMLImageElement> 
} => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(img);

    const handleLoad = () => setLoaded(true);
    const handleError = () => setError(true);

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      observer.disconnect();
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  return { loaded, error, imgRef };
};

// Memoized calculation hook
export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();

  if (!ref.current || !areEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory()
    };
  }

  return ref.current.value;
};

// Deep comparison for dependencies
const areEqual = (a: React.DependencyList, b: React.DependencyList): boolean => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => Object.is(item, b[index]));
};

// Local storage with compression for large data
export const useCompressedStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        // Simple compression using JSON compression
        const decompressed = JSON.parse(atob(item));
        return decompressed;
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      // Compress before storing
      const compressed = btoa(JSON.stringify(newValue));
      localStorage.setItem(key, compressed);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key]);

  return [value, setStoredValue];
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }

  endMeasure(name: string): number {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      const duration = measure.duration;
      
      // Store metric
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(name)!;
      if (measurements.length > 100) {
        measurements.splice(0, measurements.length - 100);
      }
      
      // Clean up performance entries
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
      
      return duration;
    }
    return 0;
  }

  getAverageTime(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const sum = measurements.reduce((a, b) => a + b, 0);
    return sum / measurements.length;
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    this.metrics.forEach((measurements, name) => {
      if (measurements.length > 0) {
        result[name] = {
          average: this.getAverageTime(name),
          count: measurements.length,
          latest: measurements[measurements.length - 1]
        };
      }
    });
    
    return result;
  }

  logPerformanceReport(): void {
    const metrics = this.getMetrics();
    console.group('Performance Report');
    
    Object.entries(metrics).forEach(([name, data]) => {
      console.log(`${name}:`, {
        'Average Time': `${data.average.toFixed(2)}ms`,
        'Latest Time': `${data.latest.toFixed(2)}ms`,
        'Measurements': data.count
      });
    });
    
    console.groupEnd();
  }
}

// Bundle size monitoring
export const BundleAnalyzer = {
  trackComponentLoad: (componentName: string) => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startMeasure(`component-${componentName}`);
    
    return () => {
      monitor.endMeasure(`component-${componentName}`);
    };
  },

  trackAsyncImport: async <T>(
    importPromise: Promise<T>,
    moduleName: string
  ): Promise<T> => {
    const monitor = PerformanceMonitor.getInstance();
    monitor.startMeasure(`import-${moduleName}`);
    
    try {
      const result = await importPromise;
      monitor.endMeasure(`import-${moduleName}`);
      return result;
    } catch (error) {
      monitor.endMeasure(`import-${moduleName}`);
      throw error;
    }
  }
};

// Memory usage monitoring
export const MemoryMonitor = {
  checkMemoryUsage: (): { used: number; total: number; percentage: number } | null => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    return null;
  },

  logMemoryUsage: (): void => {
    const usage = MemoryMonitor.checkMemoryUsage();
    if (usage) {
      console.log('Memory Usage:', {
        'Used': `${(usage.used / 1048576).toFixed(2)} MB`,
        'Total': `${(usage.total / 1048576).toFixed(2)} MB`,
        'Percentage': `${usage.percentage.toFixed(2)}%`
      });
    }
  },

  isMemoryHigh: (threshold: number = 80): boolean => {
    const usage = MemoryMonitor.checkMemoryUsage();
    return usage ? usage.percentage > threshold : false;
  }
};

// Cache management
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Automatic cache cleanup
setInterval(() => {
  CacheManager.getInstance().cleanup();
}, 60000); // Cleanup every minute

// Network status monitoring
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
};

// Error boundary performance tracking
export const trackErrorBoundaryRender = (errorInfo: any) => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.startMeasure('error-boundary-render');
  
  console.error('Error boundary triggered:', errorInfo);
  
  // In production, you would send this to your error tracking service
  setTimeout(() => {
    monitor.endMeasure('error-boundary-render');
  }, 0);
};

// Component render optimization
export const useRenderOptimization = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times. Time since last render: ${timeSinceLastRender}ms`);
    }

    // Warn about frequent re-renders
    if (timeSinceLastRender < 16) { // Less than one frame
      console.warn(`${componentName} is re-rendering very frequently. Consider optimization.`);
    }
  });

  return {
    renderCount: renderCount.current,
    componentName
  };
};

// Export performance utilities
export const PerformanceUtils = {
  monitor: PerformanceMonitor.getInstance(),
  cache: CacheManager.getInstance(),
  bundle: BundleAnalyzer,
  memory: MemoryMonitor
};

// Development performance debugging
if (process.env.NODE_ENV === 'development') {
  // Auto-log performance report every 30 seconds
  setInterval(() => {
    PerformanceUtils.monitor.logPerformanceReport();
    PerformanceUtils.memory.logMemoryUsage();
  }, 30000);

  // Log cache status
  setInterval(() => {
    console.log('Cache status:', {
      size: PerformanceUtils.cache.size(),
      'memory high': PerformanceUtils.memory.isMemoryHigh()
    });
  }, 60000);
}