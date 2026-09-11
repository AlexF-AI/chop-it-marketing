'use client';

import { useState } from 'react';
import Image from 'next/image';

import shared from './shared.module.css';
import styles from './VideoBlock.module.css';

/**
 * The product walkthrough.
 *
 * The design specifies a 16:9 block with a poster frame and a play button,
 * sized for a YouTube embed. No video has been supplied yet, so this is
 * built as a facade: set YOUTUBE_ID and the block becomes a click-to-load
 * player; leave it null and it renders the poster alone.
 *
 * The null branch deliberately renders no play button. A play affordance
 * that does nothing when pressed is worse than no affordance, and the
 * caption's duration link is dropped with it for the same reason.
 *
 * Click-to-load rather than an iframe on mount: YouTube's embed pulls
 * several hundred KB of player JS, and the homepage should not pay that
 * for a visitor who scrolls past.
 */
const YOUTUBE_ID: string | null = null;

/** Runtime of the walkthrough, shown beside the caption. */
const DURATION_LABEL = '90 seconds';

export function VideoBlock() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className={shared.section}>
      <div className={shared.shell}>
        <div className={shared.eyebrow}>Watch it work</div>

        <div className={styles.frame}>
          {playing && YOUTUBE_ID ? (
            <iframe
              className={styles.iframe}
              // autoplay is safe here: the iframe only mounts as the direct
              // result of the visitor pressing play.
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
              title="Chop it — how it works"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <Image
                src="/screens/plan-the-week.webp"
                alt={
                  YOUTUBE_ID
                    ? ''
                    : 'Chop it showing four dinners picked as the week'
                }
                fill
                sizes="(max-width: 900px) 100vw, 860px"
                className={styles.poster}
              />
              {YOUTUBE_ID ? (
                <button
                  type="button"
                  className={styles.play}
                  onClick={() => setPlaying(true)}
                  aria-label={`Play the walkthrough (${DURATION_LABEL})`}
                >
                  <span className={styles.playIcon} aria-hidden="true" />
                </button>
              ) : null}
            </>
          )}
        </div>

        <p className={styles.caption}>
          Tap the dishes you want. That is the week done.{' '}
          {YOUTUBE_ID ? (
            <span className={styles.duration}>
              {DURATION_LABEL} <span aria-hidden="true">→</span>
            </span>
          ) : null}
        </p>
      </div>
    </section>
  );
}
