import Composer from './Composer';
import StoreLink from './StoreLink';
import { APP_STORE_URL, CHATGPT_URL } from '@/app/lib/app-stores';

export default function Hero() {
  return (
    <header id="top" className="hero split">
      <div>
        <div className="hero-flag">
          <span className="hero-dot" aria-hidden="true" />
          <span className="eyebrow">The home of AI cooking</span>
        </div>
        <h1 className="hero-h1">
          The new home for the recipes
          <br />
          you keep losing.
        </h1>
        <p className="hero-sub">
          Save a link, photograph a cookbook page, or ask for something new. It lands in one
          library, with an AI chef that plans the week, writes the shop and cooks alongside you.
          Free as a plug-in in your own ChatGPT, waiting in the app.
        </p>

        <div className="hero-ctas">
          <StoreLink
            destination="app_store"
            href={APP_STORE_URL}
            location="hero"
            surface="homepage_hero"
            label="Get the iPhone app"
            className="cta-solid"
          >
            Get the iPhone app
          </StoreLink>
          <StoreLink
            destination="chatgpt"
            href={CHATGPT_URL}
            location="hero"
            surface="homepage_hero"
            label="Use it free in ChatGPT"
            className="cta-outline"
          >
            Use it free in ChatGPT
          </StoreLink>
        </div>

        <div className="hero-badges">
          <span className="badge-accent">No second subscription</span>
          <span className="meta-line">Looking things up is free · AI Chef · 1 credit per ask</span>
        </div>
      </div>

      <Composer />
    </header>
  );
}
