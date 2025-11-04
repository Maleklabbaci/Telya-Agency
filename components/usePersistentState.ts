import React, { useState, useEffect } from 'react';

function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        // Handle date strings during parsing
        return JSON.parse(storedValue, (key, value) => {
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
            return new Date(value);
          }
          return value;
        });
      }
    } catch (error) {
      console.error('Erreur de lecture depuis localStorage', error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      // FIX: Used double quotes to avoid syntax error with the apostrophe.
      console.error("Erreur d'écriture dans localStorage", error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;