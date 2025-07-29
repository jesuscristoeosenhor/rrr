import { useState, useCallback } from 'react';

/**
 * Enhanced localStorage hook with error handling and type safety
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      
      if (item === null || item === undefined || item === 'undefined') {
        return initialValue;
      }
      
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading from localStorage for key "${key}":`, error);
      
      // Clean corrupted data
      try {
        window.localStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Error removing corrupted localStorage item:`, removeError);
      }
      
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving to localStorage for key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

/**
 * Hook for secure data storage with encryption (placeholder for future implementation)
 */
export function useSecureStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // For now, use localStorage but this should be replaced with encrypted storage
  return useLocalStorage(key, initialValue);
}

/**
 * Hook for session storage
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.sessionStorage.getItem(key);
      
      if (item === null || item === undefined || item === 'undefined') {
        return initialValue;
      }
      
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading from sessionStorage for key "${key}":`, error);
      
      try {
        window.sessionStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Error removing corrupted sessionStorage item:`, removeError);
      }
      
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving to sessionStorage for key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}