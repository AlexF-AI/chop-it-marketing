'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './ReadingProgress.module.css';

/**
 * The 3px bar that sits under the sticky nav on an article and fills as the
 * reader moves down the page.
 *
 * Throttled to one update per animation frame: a raw scroll listener that
 * calls setState fires far more often than the screen repaints, and on a
 * long article that is the difference between a smooth bar and a janky one.
 */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const read = () => {
      frame.current = null;
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      // A page shorter than the viewport has nothing to report.
      if (scrollable <= 0) {
        setPct(0);
        return;
      }
      setPct(Math.min(100, Math.max(0, (el.scrollTop / scrollable) * 100)));
    };

    const onScroll = () => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(read);
    };

    // Initialise on mount: a reader arriving at an anchor is already part
    // way down, and the bar should say so before they scroll.
    read();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div className={styles.track} aria-hidden="true">
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
