import StoreLink from '@/app/components/home/StoreLink';
import { appStoreUrl, CHATGPT_URL, SHOW_ANDROID_NOTE } from '@/app/lib/app-stores';
import shared from './shared.module.css';
import styles from './FinalCTA.module.css';

export function FinalCTA() {
  return (
    <section id="download" className={shared.section}>
      <div className={shared.shellPadded}>
        <div className={`${shared.eyebrow} ${styles.eyebrow}`}>Start this week</div>
        <h2 className={`${shared.h2} ${styles.h2}`}>
          Take your next dinner out of the chat.
        </h2>
        <p className={`${shared.lede} ${styles.body}`}>
          Use Chop it free in ChatGPT, or download the iPhone app to keep, plan,
          shop and cook everything in one place.
        </p>

        <div className={shared.ctaRow}>
          <StoreLink
            destination="app_store"
            href={appStoreUrl('homepage_secondary')}
            location="download_cta"
            surface="homepage_secondary"
            label="Get the iPhone app"
            className={`${shared.btn} ${shared.btnPrimary}`}
          >
            Get the iPhone app
          </StoreLink>
          <StoreLink
            destination="chatgpt"
            href={CHATGPT_URL}
            surface="homepage_secondary"
            label="Use it free in ChatGPT"
            className={`${shared.btn} ${shared.btnSecondary}`}
          >
            Use it free in ChatGPT <span aria-hidden="true">→</span>
          </StoreLink>
        </div>

        {SHOW_ANDROID_NOTE ? (
          <div className={styles.androidNote}>Android coming later</div>
        ) : null}
      </div>
    </section>
  );
}
