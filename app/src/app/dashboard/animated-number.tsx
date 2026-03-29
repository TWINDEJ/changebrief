'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({ value, duration = 600, className = '' }: Props) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || value === 0) {
      setDisplay(value);
      return;
    }

    // Intersection Observer — animera bara när synlig
    const el = ref.current;
    if (!el) { setDisplay(value); return; }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();
          animate();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);

    function animate() {
      const start = performance.now();
      const from = 0;
      const to = value;

      function tick(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(from + (to - from) * eased));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref} className={className}>{display}</span>;
}
