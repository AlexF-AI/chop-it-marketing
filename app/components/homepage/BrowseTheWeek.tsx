import Link from 'next/link';
import { LIBRARY_SIZE } from '@/app/lib/brand';
import shared from './shared.module.css';
import styles from './BrowseTheWeek.module.css';

/**
 * The three moves that turn browsing into a done week. Numbered because
 * they happen in order — this is the product in one section, and the
 * sections below only expand on it.
 */
const STEPS = [
  {
    n: '01',
    label: 'Browse',
    text: 'Every dish has a photo, a prep time and step-by-step instructions. You can see what you are getting before you commit to it.',
  },
  {
    n: '02',
    label: 'Pick your week',
    text: 'Tap your favourites. They become the week, and you can swap any of them out right up until you shop.',
  },
  {
    n: '03',
    label: 'Add to your basket',
    text: 'Every ingredient across the week combines into one list, checked against what you already have, and goes straight to your basket.',
  },
];

export function BrowseTheWeek() {
  return (
    <section
      id="browse"
      className={`${shared.sectionBand} ${shared.bandRasp}`}
    >
      <div className={shared.shell}>
        <div className={`${shared.eyebrow} ${shared.eyebrowOnRasp}`}>
          Browse, pick, shop
        </div>

        {/* LIBRARY_SIZE is lower case for mid-sentence use, so the
            headline is phrased to put it after a word rather than at the
            start of the sentence. */}
        <h2 className={`${shared.h2} ${shared.h2OnRasp}`}>
          Pick from {LIBRARY_SIZE} dishes.
        </h2>
        <p className={`${shared.lede} ${shared.ledeOnRasp} ${styles.lede}`}>
          Browse instantly with photos, prep times and step-by-step
          instructions, pick your favourites for the week, and add them
          straight to your basket. No blank page, no scrolling through
          recipes that turn out to be four paragraphs of preamble.
        </p>

        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.n} className={styles.step}>
              <span className={styles.stepN}>{step.n}</span>
              <div>
                <span className={styles.stepLabel}>{step.label}</span>
                <span className={styles.stepText}>{step.text}</span>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href="/recipes"
          className={`${shared.link} ${shared.linkOnRasp} ${styles.browseLink}`}
        >
          Browse the recipes <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
