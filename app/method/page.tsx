import type { Metadata } from 'next';

import Breadcrumbs, { type Crumb } from '@/app/components/Breadcrumbs';
import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import StoreLink from '@/app/components/home/StoreLink';
import { APP_STORE_URL, CHATGPT_URL } from '@/app/lib/app-stores';
import { buildBreadcrumbJsonLd, serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';

const TITLE = 'How we build a Chop it recipe';
const DESCRIPTION =
  'The nine-stage standard behind every Chop it recipe: protein paired with its plants, a named umami base, two plants at full weight, acid matched to the cuisine, and a fresh finish.';

export const metadata: Metadata = {
  title: `${TITLE} · Chop it`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_ORIGIN}/method` },
  openGraph: {
    title: `${TITLE} · Chop it`,
    description: DESCRIPTION,
    url: `${SITE_ORIGIN}/method`,
    type: 'article',
  },
};

const STAGES = [
  { n: '1', name: 'Centre of the plate', rule: 'Protein and its plant pairing, chosen together' },
  { n: '2', name: 'Cuisine lock', rule: 'The flavour world, named before any seasoning' },
  { n: '3', name: 'Umami base', rule: 'A named savoury source: miso, anchovy, dried mushroom' },
  { n: '4', name: 'Aromatics and spice', rule: 'Bloomed 30 to 60 seconds, garlic in late' },
  { n: '5', name: 'Plants', rule: 'Two at full weight, never the same vegetable twice a week' },
  { n: '6', name: 'Carb or grain', rule: 'Where the dish wants one, not by default' },
  { n: '7', name: 'Acid', rule: 'Matched to the cuisine, used in the method' },
  { n: '8', name: 'Texture contrast', rule: 'The element that breaks everything above' },
  { n: '9', name: 'Fresh finish', rule: 'Herbs or raw allium last, assembly written in' },
];

export default function MethodPage() {
  const crumbs: Crumb[] = [{ name: 'Home', href: '/' }, { name: 'Method' }];

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBreadcrumbJsonLd(crumbs)) }}
      />
      <Nav />
      <main className="method">
        <Breadcrumbs crumbs={crumbs} />
        <div className="method-intro">
          <div className="eyebrow" style={{ marginBottom: 22 }}>
            — The standard
          </div>
          <h1 className="method-h1">{TITLE}</h1>
          <p className="method-lede">
            Chefs balance a plate to a pattern: something savoury underneath, something sharp to
            lift it. We write every Chop it recipe to a nine-stage standard so that balance lands
            on the page before you cook it. Two plants carry each savoury dish at full weight,
            which is how the average reaches 5.6 plants and 34g of protein a serving. We have not
            cooked all 1,035 ourselves and will not pretend we have. Chop it counts plants, fibre
            and protein across your week rather than one dinner, so judge it on the seven days.
          </p>
        </div>

        <div className="stage-table">
          <div className="stage-row stage-row-head">
            <span className="meta-line">Stage</span>
            <span className="meta-line">What it is</span>
            <span className="meta-line stage-head-rule">The rule</span>
          </div>
          {STAGES.map((s) => (
            <div className="stage-row" key={s.n}>
              <span className="stage-n">{s.n}</span>
              <span className="stage-name">{s.name}</span>
              <span className="stage-rule">{s.rule}</span>
            </div>
          ))}
        </div>

        <aside className="method-aside" aria-label="Try Chop it">
          <h2 className="method-aside-h">Put this into practice this week</h2>
          <p className="method-aside-p">
            Chop it works as a plug-in inside ChatGPT: plan the week in a conversation and get one
            consolidated shopping list. Everything you save is waiting in the iPhone app.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <StoreLink
              destination="chatgpt"
              href={CHATGPT_URL}
              location="download_cta"
              surface="homepage_secondary"
              label="Add the ChatGPT plug-in"
              className="cta-solid"
            >
              Add the ChatGPT plug-in
            </StoreLink>
            <StoreLink
              destination="app_store"
              href={APP_STORE_URL}
              location="download_cta"
              surface="homepage_secondary"
              label="Get the iPhone app"
              className="cta-outline"
            >
              Get the iPhone app
            </StoreLink>
          </div>
        </aside>
      </main>
      <Footer />
    </>
  );
}
