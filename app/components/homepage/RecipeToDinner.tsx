'use client';

import { useState } from 'react';
import Image from 'next/image';
import shared from './shared.module.css';
import styles from './RecipeToDinner.module.css';

const FEATURES = [
  {
    label: 'Shop once',
    text: 'Every ingredient becomes one list, combined by aisle and checked against what you already have. Send it to Whisk when you are ready to buy.',
    src: '/screens/shop-once.webp',
    caption: 'One list, combined by aisle',
  },
  {
    label: 'Cook from the same place',
    text: 'Open each meal in Cook Mode for clear ingredients, steps and timers. Tick meals off as the week moves.',
    src: '/screens/cook-mode.webp',
    caption: 'Cook Mode, step 3 of 9',
  },
];

export function RecipeToDinner() {
  const [active, setActive] = useState(0);

  return (
    <section id="how" className={shared.section}>
      <div className={shared.shellPadded}>
        <div className={`${shared.eyebrow} ${styles.eyebrow}`}>From plan to dinner</div>
        <h2 className={`${shared.h2} ${styles.h2}`}>
          One shop. One place to cook.
        </h2>

        <div className={`${shared.split} ${shared.splitStart}`}>
          <div className={styles.features}>
            {FEATURES.map((feature, index) => {
              const isActive = index === active;
              return (
                <button
                  key={feature.label}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={isActive}
                  className={`${styles.feature} ${
                    isActive ? styles.featureActive : ''
                  }`}
                >
                  <span className={styles.featureRule} />
                  <span className={styles.featureCopy}>
                    <span className={styles.featureLabel}>{feature.label}</span>
                    <span className={styles.featureText}>{feature.text}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className={`${shared.rail} ${styles.screens}`}>
            {FEATURES.map((feature, index) => (
              <figure
                key={feature.label}
                className={
                  index === active ? styles.screenActive : styles.screen
                }
              >
                <div className={`${shared.frame} ${styles.frame}`}>
                  <Image
                    src={feature.src}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="(max-width: 1000px) 88vw, 44vw"
                    className={styles.shot}
                  />
                </div>
                <figcaption className={shared.caption}>{feature.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
