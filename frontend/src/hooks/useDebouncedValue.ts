import { useEffect, useState } from 'react';

/*
  Small utility hook to reduce expensive recomputation while the user is typing.
  It keeps UI responsive on large data sets.
*/
const useDebouncedValue = <T,>(value: T, delayMs: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
};

export default useDebouncedValue;
