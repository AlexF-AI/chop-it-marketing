import Image from 'next/image';
import StoreLink from '@/app/components/home/StoreLink';
import { appStoreUrl, CHATGPT_URL } from '@/app/lib/app-stores';
import { SLOGAN } from '@/app/lib/brand';
import shared from './shared.module.css';
import styles from './Hero.module.css';

/**
 * Stand-in for the hero photograph.
 *
 * The design calls for "a dark, moody, close-cropped dish with hands in
 * frame" — food photography that has not been shot yet, and which the
 * handoff lists as the first outstanding asset.
 *
 * Until it lands this is a crop cut out of the app's week screen (the same
 * source the design prototype reached for), with the card chrome trimmed
 * away and the exposure pulled down so the scrim can hold 4.5:1 on the
 * headline. It is 1054px wide, so it is soft on a large desktop hero —
 * another reason it is a placeholder rather than a choice.
 *
 * Swapping in the real photograph means replacing this one file, and
 * adjusting `object-position` on `.heroImg` only if the crop differs.
 */
const HERO_PHOTO = '/hero/hero-placeholder.webp';

export function Hero() {
  return (
    <>
      <header id="top" className={styles.hero}>
        <Image
          src={HERO_PHOTO}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImg}
        />
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.heroText}>
          {/* The slogan runs above the H1 rather than under it: the
              headline is the positioning, and the slogan is the brand
              line that frames it. */}
          <div className={styles.eyebrow}>{SLOGAN.replace(/\.$/, '')}</div>

          {/* The four words are the positioning, so they are the H1 rather
              than an eyebrow above a functional headline. The keywords a
              search result needs ("meal planning", "plan your food week")
              carry in the title tag and the lede below instead. */}
          <h1 className={styles.h1}>
            Food is art.
            <br />
            Passion. Culture.
            <br />
            <em>Identity.</em>
          </h1>
        </div>
      </header>

      <div className={styles.intro}>
        <p className={styles.body}>
          It&rsquo;s one of the great expressions of who we are, and it
          shouldn&rsquo;t ever feel like a chore.
        </p>
        <p className={styles.body}>
          But in a world that moves fast, the weekly shop and meal planning have
          become another line on overflowing to-do lists. Just another piece of
          admin nobody has the energy to entertain after a long day.
        </p>
        <div className={styles.payoff}>
          <Image
            src="/logo.webp"
            alt=""
            width={30}
            height={30}
            aria-hidden="true"
            className={styles.payoffMark}
          />
          <p className={styles.payoffText}>That&rsquo;s why we built Chop it.</p>
        </div>
      </div>

      <div className={styles.ctaBlock}>
        <div className={`${shared.ctaStack} ${styles.ctaRow}`}>
          <StoreLink
            destination="app_store"
            href={appStoreUrl('homepage_hero')}
            location="hero"
            surface="homepage_hero"
            label="Get the iPhone app"
            className={`${shared.btn} ${shared.btnPrimary}`}
          >
            Get the iPhone app
          </StoreLink>
          <StoreLink
            destination="chatgpt"
            href={CHATGPT_URL}
            surface="homepage_hero"
            label="Use it free in ChatGPT"
            className={`${shared.btn} ${shared.btnSecondary}`}
          >
            Use it free in ChatGPT <span aria-hidden="true">→</span>
          </StoreLink>
        </div>

        <div className={styles.status}>
          <span className={styles.statusDot} />
          <span className={styles.statusLabel}>
            iPhone app + Chop it in ChatGPT live now
          </span>
        </div>
      </div>
    </>
  );
}
