import Image from 'next/image';
import { APP_STORE_URL, CHATGPT_URL } from '@/app/lib/app-stores';
import shared from './shared.module.css';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <header id="top" className={styles.hero}>
      <div>
        <div className={`${shared.eyebrow} ${styles.eyebrow}`}>
          The home of AI cooking, built for UK kitchens
        </div>
        <h1 className={styles.h1}>
          Everything you cook with AI, kept in one place.
        </h1>
        <p className={styles.body}>
          Save what ChatGPT creates alongside recipes from cookbooks, websites
          and social. Plan the week, build one shopping list and cook it all
          from the same library.
        </p>

        <div className={`${shared.ctaRow} ${styles.ctaRow}`}>
          <a href={APP_STORE_URL} className={`${shared.btn} ${shared.btnPrimary}`}>
            Get the iPhone app
          </a>
          <a href={CHATGPT_URL} className={`${shared.btn} ${shared.btnSecondary}`}>
            Use it free in ChatGPT <span aria-hidden="true">→</span>
          </a>
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
          <figcaption className={shared.caption}>In ChatGPT</figcaption>
          <div className={`${shared.frame} ${styles.frame}`}>
            <Image
              src="/screens/chatgpt-week.jpeg"
              alt="Chop it in ChatGPT returning a five-dinner week"
              fill
              priority
              sizes="(max-width: 900px) 92vw, (max-width: 1240px) 30vw, 360px"
              className={styles.shot}
            />
          </div>
          <div className={styles.shotCaption}>
            “Chop it make me a balanced family friendly week for 5 meals”
          </div>
        </figure>

        <div className={styles.connector}>
          <span className={styles.hair} />
          <span className={styles.connectorLabel}>Open in Chop it</span>
          <span className={styles.hair} />
        </div>

        <figure className={shared.figure}>
          <figcaption className={shared.caption}>In the app</figcaption>
          <div className={`${shared.frame} ${styles.frame}`}>
            <Image
              src="/screens/plan-the-week.webp"
              alt="Chop it showing four dinners saved as a week"
              fill
              priority
              sizes="(max-width: 900px) 92vw, (max-width: 1240px) 30vw, 360px"
              className={styles.shot}
            />
          </div>
          <div className={styles.shotCaption}>
            The week, saved and ready to cook.
          </div>
        </figure>
      </div>
    </header>
  );
}
