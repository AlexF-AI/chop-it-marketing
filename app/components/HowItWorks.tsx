import type { ReactNode } from 'react';

import DishPlaceholder from './DishPlaceholder';
import Reveal from './motion/Reveal';
import StaggerGroup from './motion/StaggerGroup';
import StaggerItem from './motion/StaggerItem';

type ShopItem = { n: string; q: string; got?: boolean; pantry?: boolean };

const SHOP: ShopItem[] = [
  { n: 'Butter beans', q: '2 tins', got: true },
  { n: 'Tenderstem broccoli', q: '200g', got: true },
  { n: 'Tahini', q: '1 jar', pantry: true },
  { n: 'Salmon fillets', q: '2', got: false },
  { n: 'Lemons', q: '3', got: false },
];

type CookRow = { day: string; name: string; ticked: boolean; tone: 'amber' | 'herb' | 'warm' };

const COOK: CookRow[] = [
  { day: 'Mon', name: 'Crispy gnocchi, brown butter sage', ticked: true, tone: 'amber' },
  { day: 'Tue', name: 'Charred broccoli, tahini, butter beans', ticked: true, tone: 'herb' },
  { day: 'Wed', name: 'Miso-glazed salmon, soba', ticked: false, tone: 'warm' },
];

type HowItWorksProps = { browseThumbs?: ReactNode };

export default function HowItWorks({ browseThumbs }: HowItWorksProps = {}) {
  const fallbackThumbs = (
    <div className="how-visual-browse">
      <div className="how-thumb">
        <DishPlaceholder label="Harissa butter beans" tone="amber" aspect="1 / 1" />
      </div>
      <div className="how-thumb">
        <DishPlaceholder label="Miso aubergine" tone="herb" aspect="1 / 1" />
      </div>
      <div className="how-thumb">
        <DishPlaceholder label="Cod & lentils" tone="smoke" aspect="1 / 1" />
      </div>
    </div>
  );

  return (
    <section className="section how" id="how">
      <Reveal>
        <div className="section-head">
          <div className="kicker mono">— HOW IT WORKS</div>
          <h2 className="h-editorial">
            Three steps. <span className="muted">Weekly shop, sorted in minutes.</span>
          </h2>
        </div>
      </Reveal>
      {/* Slower stagger (0.12) — three steps read sequentially, so a
          longer cadence gives each step a moment before the next
          arrives. */}
      <StaggerGroup className="how-steps" stagger={0.12}>
        {/* Step 01 — Capture from anywhere (leads, per the ChatGPT-first
            positioning: the library is the product's front door). */}
        <StaggerItem className="how-step">
          <div className="how-num mono">01</div>
          <div className="how-title">Capture from anywhere</div>
          <div className="how-body">
            Snap a cookbook page in the app. Paste a website, TikTok or Instagram link — in
            ChatGPT or the app. Every import becomes one standard Chop It recipe.
          </div>
          <div className="how-visual">{browseThumbs ?? fallbackThumbs}</div>
        </StaggerItem>

        {/* Step 02 — Plan, then one smart shop */}
        <StaggerItem className="how-step">
          <div className="how-num mono">02</div>
          <div className="how-title">Plan, then one smart shop</div>
          <div className="how-body">
            Drop recipes into the week — in the app or straight from a ChatGPT conversation. One
            consolidated list, sorted by aisle (the app even checks your pantry), with Whisk
            handoff to your supermarket of choice.
          </div>
          <div className="how-visual how-visual-shop">
            {SHOP.map((it, i) => (
              <div
                key={i}
                className={`how-shop-row ${it.got ? 'got' : ''} ${it.pantry ? 'pantry' : ''}`}
              >
                <span className={`check ${it.got ? 'on' : ''}`} />
                <span className="how-shop-n">{it.n}</span>
                <span className="how-shop-q mono">{it.q}</span>
                {it.pantry && <span className="how-shop-flag mono">IN PANTRY</span>}
              </div>
            ))}
          </div>
        </StaggerItem>

        {/* Step 03 — Cook, score, repeat */}
        <StaggerItem className="how-step">
          <div className="how-num mono">03</div>
          <div className="how-title">Cook, score, repeat</div>
          <div className="how-body">
            Tick meals off as you cook them. Your Weekly Diversity Score updates as you go.
            Saturday’s brunch counts as much as Tuesday’s stir-fry.
          </div>
          <div className="how-visual how-visual-cook">
            {COOK.map((c, i) => (
              <div key={i} className={`how-cook-row ${c.ticked ? 'ticked' : ''}`}>
                <span className={`check ${c.ticked ? 'on' : ''}`} />
                <span className="how-cook-day mono">{c.day}</span>
                <span className="how-cook-name">{c.name}</span>
              </div>
            ))}
          </div>
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
