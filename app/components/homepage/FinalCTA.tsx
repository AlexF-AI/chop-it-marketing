import StoreLink from '@/app/components/home/StoreLink';
import { SLOGAN } from '@/app/lib/brand';
import { appStoreUrl, CHATGPT_URL, SHOW_ANDROID_NOTE } from '@/app/lib/app-stores';
import { WEB_APP_ORIGIN } from '@/app/lib/entity';
import shared from './shared.module.css';
import styles from './FinalCTA.module.css';

export function FinalCTA() {
  return (
    <section
      id="download"
      className={`${shared.sectionBand} ${shared.bandRasp}`}
    >
      <div className={shared.shell}>
        <div className={`${shared.eyebrow} ${shared.eyebrowOnRasp}`}>That&rsquo;s it</div>
        <h2 className={`${shared.h2} ${shared.h2OnRasp}`}>
          Just your food week, planned in minutes.
        </h2>
        <p className={`${shared.lede} ${shared.ledeOnRasp} ${styles.body}`}>
          No lists, no guesswork, no last-minute panic over &ldquo;what&rsquo;s
          for dinner&rdquo;. Open Chop it in your browser, use it free in
          ChatGPT, or download the iPhone app to browse, plan, shop and cook in
          one place.
        </p>

        <div className={`${shared.ctaStack} ${styles.ctaStack}`}>
          <StoreLink
            destination="app_store"
            href={appStoreUrl('homepage_secondary')}
            location="download_cta"
            surface="homepage_secondary"
            label="Get the iPhone app"
            className={`${shared.btn} ${shared.btnOnRasp}`}
          >
            Get the iPhone app
          </StoreLink>
          <StoreLink
            destination="chatgpt"
            href={CHATGPT_URL}
            surface="homepage_secondary"
            label="Use it free in ChatGPT"
            className={`${shared.btn} ${shared.btnOutlineOnRasp}`}
          >
            Use it free in ChatGPT <span aria-hidden="true">→</span>
          </StoreLink>
          {/* The web app: a third way in, for a reader who wants neither an
              install nor ChatGPT. Not a StoreLink — the global listener owns
              this one, because only it knows the traffic source at click
              time and can rewrite the href through buildAppUrl(). The
              data-cta-surface marker is what tells it this is a CTA rather
              than a share-page deep link, and it carries no
              data-cta-tracked, since the listener fires the event here. */}
          <a
            className={`${shared.btn} ${shared.btnOutlineOnRasp}`}
            href={WEB_APP_ORIGIN}
            rel="noopener noreferrer"
            data-cta-surface="homepage_pwa"
          >
            Use it in your browser <span aria-hidden="true">→</span>
          </a>
        </div>

        {SHOW_ANDROID_NOTE ? (
          <div className={styles.androidNote}>Android coming later</div>
        ) : null}

        {/* The sign-off closes the page the way the opening starts it. Its
            own element rather than a line of the paragraph above, because
            it is the brand line and reads as one. */}
        <p className={styles.slogan}>{SLOGAN}</p>
      </div>
    </section>
  );
}
