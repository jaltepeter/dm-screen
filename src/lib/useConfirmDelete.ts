import { useState } from 'react';

export function useConfirmDelete<T>() {
  const [target, setTarget] = useState<T | null>(null);
  return {
    target,
    requestDelete: (item: T) => setTarget(item),
    clearDelete: () => setTarget(null)
  };
}
