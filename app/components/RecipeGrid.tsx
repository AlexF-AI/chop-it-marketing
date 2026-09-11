// Server component. Shared grid used by the hub + every taxonomy page
// (cuisine / season / tag).
//
// The card is a 4:5 photograph with the title and one meta line under it.
// The cost dot the old card carried is gone: the design gives the meta line
// to time and protein, which is what a reader picking dinner is comparing.

import Image from 'next/image';
import Link from 'next/link';

import type { RecipeListItem } from '@/app/lib/recipes';
import styles from './RecipeGrid.module.css';

function formatTotalTime(minutes: number | null | undefined): string | null {
  if (minutes == null || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function formatMeta(recipe: RecipeListItem): string {
  const bits: string[] = [];
  const time = formatTotalTime(recipe.total_minutes);
  if (time) bits.push(time);
  if (typeof recipe.protein_g === 'number' && recipe.protein_g > 0) {
    bits.push(`${Math.round(recipe.protein_g)}g protein`);
  }
  return bits.join(' · ');
}

export default function RecipeGrid({ items }: { items: RecipeListItem[] }) {
  if (items.length === 0) {
    return <p className={styles.empty}>No recipes here yet. Check back soon.</p>;
  }

  return (
    <ul className={styles.grid}>
      {items.map((r, index) => {
        const meta = formatMeta(r);
        return (
          <li key={r.id}>
            <Link className={styles.card} href={`/recipes/${r.slug}`}>
              <div className={styles.image}>
                {r.image_url && (
                  <Image
                    src={r.image_url}
                    alt=""
                    fill
                    // The first row is above the fold on every width, so it
                    // loads eagerly; the rest wait.
                    loading={index < 4 ? 'eager' : 'lazy'}
                    sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                  />
                )}
              </div>
              <div className={styles.title}>{r.title}</div>
              {meta ? <div className={styles.meta}>{meta}</div> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
