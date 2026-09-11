// Horizontal recipe rail.
//
// A row of 4:5 cards that scrolls edge to edge while its first card still
// lines up with the text column above it. Used for the homepage's featured
// four and for "more recipes" at the foot of a recipe — both are a short,
// browsable set rather than a full listing, which is what a rail suits and
// a grid doesn't.
//
// Past the width where every card fits without scrolling it becomes a grid:
// a scroller with nothing off-screen reads as broken, and the arrow affords
// a scroll that wouldn't happen.

import Image from 'next/image';
import Link from 'next/link';

import styles from './RecipeRail.module.css';

export type RailItem = {
  href: string;
  title: string;
  /** Pre-formatted, e.g. "45 min · 40g protein". */
  meta: string;
  imageUrl: string | null;
  /** Small square label over the image, e.g. "Chef IQ". */
  badge?: string;
};

export default function RecipeRail({
  items,
  label,
  eager = 0,
}: {
  items: RailItem[];
  /** Names the scroller for a screen reader; the visible heading is separate. */
  label: string;
  /** How many leading images to load eagerly. */
  eager?: number;
}) {
  if (items.length === 0) return null;

  return (
    // tabIndex makes the scroller reachable by keyboard. An overflow
    // container is not focusable by default, which leaves a keyboard user
    // unable to scroll it and the cards past the fold unreachable.
    <ul className={styles.rail} aria-label={label} tabIndex={0}>
      {items.map((item, index) => (
        <li key={item.href}>
          <Link href={item.href} className={styles.card}>
            <div className={styles.image}>
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  loading={index < eager ? 'eager' : 'lazy'}
                  sizes="(max-width: 768px) 230px, 280px"
                />
              ) : null}
              {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
            </div>
            <div className={styles.title}>{item.title}</div>
            {item.meta ? <div className={styles.meta}>{item.meta}</div> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
