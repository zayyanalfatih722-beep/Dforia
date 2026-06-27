import { useState, useEffect, useCallback } from "react";

const CUSTOM_EVENT = "dforia-storage-change";

function dispatch(key: string, value: unknown) {
  window.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: { key, value } }));
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const readFromStorage = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(readFromStorage);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const current = readFromStorage();
        const valueToStore = value instanceof Function ? value(current) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        setStoredValue(valueToStore);
        dispatch(key, valueToStore);
      } catch (error) {
        if (
          error instanceof DOMException &&
          (error.name === "QuotaExceededError" ||
            error.name === "NS_ERROR_DOM_QUOTA_REACHED")
        ) {
          import("sonner").then(({ toast }) =>
            toast.error(
              "Penyimpanan penuh! Hapus beberapa foto menu agar data bisa disimpan."
            )
          );
        } else {
          console.error("useLocalStorage error:", error);
        }
      }
    },
    [key, readFromStorage]
  );

  useEffect(() => {
    setStoredValue(readFromStorage());
  }, [key, readFromStorage]);

  useEffect(() => {
    const handleCustom = (e: Event) => {
      const ev = e as CustomEvent<{ key: string; value: unknown }>;
      if (ev.detail.key === key) {
        setStoredValue(ev.detail.value as T);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(e.newValue ? (JSON.parse(e.newValue) as T) : initialValue);
      }
    };

    window.addEventListener(CUSTOM_EVENT, handleCustom);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(CUSTOM_EVENT, handleCustom);
      window.removeEventListener("storage", handleStorage);
    };
  }, [key, initialValue]);

  return [storedValue, setValue] as const;
}
