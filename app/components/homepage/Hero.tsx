import Image from 'next/image';
import StoreLink from '@/app/components/home/StoreLink';
import { appStoreUrl, CHATGPT_URL } from '@/app/lib/app-stores';
import shared from './shared.module.css';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <header id="top" className={styles.hero}>
      <div>
        <div className={`${shared.eyebrow} ${styles.eyebrow}`}>
          Before you shop it, Chop it
        </div>

        {/* The four words are the positioning, so they are the H1 rather
            than an eyebrow above a functional headline. The keywords a
            search result needs ("meal planning", "plan your food week")
            carry in the title tag and the lede below instead. */}
        <h1 className={styles.h1}>Food is art. Passion. Culture. Identity.</h1>

        <p className={styles.body}>
          It&rsquo;s one of the great expressions of who we are, and it
          shouldn&rsquo;t ever feel like a chore.
        </p>
        <p className={styles.body}>
          But in a world that moves fast, the weekly shop and meal planning have
          become another line on overflowing to-do lists. Just another piece of
          admin nobody has the energy to entertain after a long day.
        </p>
        <p className={styles.lead}>That&rsquo;s why we built Chop it.</p>

        <div className={`${shared.ctaRow} ${styles.ctaRow}`}>
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

      <div className={styles.viz}>
        <figure className={shared.figure}>
          <figcaption className={shared.caption}>Pick your week</figcaption>
          <div className={`${shared.frame} ${styles.frame}`}>
            <Image
              src="/screens/plan-the-week.webp"
              alt="Chop it showing four dinners picked as the week, with a Use this week button above them"
              fill
              priority
              sizes="(max-width: 900px) 92vw, (max-width: 1240px) 30vw, 360px"
              className={styles.shot}
            />
          </div>
          <div className={styles.shotCaption}>
            Tap the dishes you want. That is the week done.
          </div>
        </figure>

        <div className={styles.connector}>
          <span className={styles.hair} />
          <span className={styles.connectorLabel}>Then cook it</span>
          <span className={styles.hair} />
        </div>

        <figure className={shared.figure}>
          <figcaption className={shared.caption}>Tonight</figcaption>
          <div className={`${shared.frame} ${styles.frame}`}>
            <Image
              src="/screens/this-week.jpeg"
              alt="Tonight's dinner in Chop it, showing the dish photo, a 45 minute time, servings and a Cook now button"
              fill
              priority
              sizes="(max-width: 900px) 92vw, (max-width: 1240px) 30vw, 360px"
              className={styles.shot}
            />
          </div>
          <div className={styles.shotCaption}>
            No guesswork at 6pm. Dinner is already decided.
          </div>
        </figure>
      </div>
    </header>
  );
}
