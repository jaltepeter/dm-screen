import { useEffect, useState } from 'react';

export function useScaleToFit(ref: React.RefObject<HTMLElement | null>, dep: unknown): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, (window.innerHeight * 0.9) / el.offsetHeight));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [dep]); // eslint-disable-line react-hooks/exhaustive-deps

  return scale;
}
