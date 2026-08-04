import StoreLink from './StoreLink';
import { ANDROID_LIVE, appStoreUrl, CHATGPT_URL, PLAY_STORE_URL } from '@/app/lib/app-stores';

export default function Download() {
  return (
    <section id="download" className="hp-band">
      <div className="hp-wrap">
        <div className="eyebrow" style={{ marginBottom: 22 }}>
          — Start this week
        </div>
        <h2 className="download-h">Start where you already are.</h2>
        <p className="download-sub">
          Free to try. Enable the plug-in in your own ChatGPT and ask it for dinner, or download
          the app. Same library either way.
        </p>

        <div className="download-row">
          <StoreLink
            destination="app_store"
            href={appStoreUrl('homepage_secondary')}
            location="download_cta"
            surface="homepage_secondary"
            label="App Store"
            className="store-card store-card-solid"
          >
            <span className="store-card-top">Download on the</span>
            <span className="store-card-bot">App Store</span>
          </StoreLink>

          <StoreLink
            destination="chatgpt"
            href={CHATGPT_URL}
            surface="homepage_secondary"
            label="ChatGPT plug-in"
            className="store-card"
          >
            <span className="store-card-top">Free plug-in inside</span>
            <span className="store-card-bot">ChatGPT</span>
          </StoreLink>

          {ANDROID_LIVE ? (
            <a className="store-card" href={PLAY_STORE_URL} rel="noopener noreferrer">
              <span className="store-card-top">Get it on</span>
              <span className="store-card-bot">Google Play</span>
            </a>
          ) : (
            <span className="store-card store-card-soon">
              <span className="store-card-top">Coming soon</span>
              <span className="store-card-bot">Google Play</span>
            </span>
          )}
        </div>

        <p className="hp-body" style={{ maxWidth: '60ch', lineHeight: 1.6 }}>
          The average UK family bins £1,000 of food a year, about the carbon of driving from London
          to Glasgow and back. Plan the week and most of that stays out of the bin.
        </p>
      </div>
    </section>
  );
}
