import Image from 'next/image';

import { formatQty, getGuestPantry, statusFor, type PantryItem } from '@/app/lib/pantry';

export const revalidate = 3600;

// The pantry never states a fact it can't back up, so the tile pill mirrors
// that: an expiry we hold turns into USE TODAY / N DAYS, and an item with no
// expiry on file says IN STOCK rather than inventing a level.
function pillFor(item: PantryItem): { label: string; low: boolean } {
  const status = statusFor(item.expiry_date);
  if (status.kind === 'use_today') return { label: 'USE TODAY', low: true };
  if (status.kind === 'days_left')
    return { label: `${status.daysLeft} DAY${status.daysLeft === 1 ? '' : 'S'}`, low: status.daysLeft <= 2 };
  if (status.kind === 'fresh') return { label: 'FRESH', low: false };
  return { label: 'IN STOCK', low: false };
}

function noteFor(item: PantryItem): string {
  const where = item.location ? item.location.charAt(0).toUpperCase() + item.location.slice(1) : 'Pantry';
  const qty = formatQty(item.quantity, item.unit);
  return qty ? `${where} · ${qty}` : where;
}

export default async function Pantry() {
  const items = (await getGuestPantry()).slice(0, 3);

  return (
    <section className="hp-band">
      <div className="hp-wrap">
        <div className="split" style={{ marginBottom: 44 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>
              — The pantry
            </div>
            <h2 className="hp-h2" style={{ marginBottom: 22 }}>
              The pantry asks before it claims.
            </h2>
            <p className="hp-lede">
              A pantry goes stale the day you stop updating it, and a wrong claim costs you more
              than no claim. So this one fills from what you bought and what you cooked, asks
              rather than tells (<em>still got the miso paste?</em>), and goes quiet if you stop
              touching it. It can put a line on a screen. You decide what is on the shelf.
            </p>
            <p className="hp-lede" style={{ marginTop: 18 }}>
              Clearing it takes one sentence. Say <em>delete the fridge contents</em> and it finds
              51 things, lists them, and waits for a yes. Your cupboard and freezer stay as they
              were.
            </p>
          </div>
          <div className="split-media">
            <div className="shot" style={{ aspectRatio: '3 / 4', background: 'var(--surface-2)' }}>
              <Image
                src="/ai-chef-clear-fridge.webp"
                alt="AI Chef listing 51 fridge items and asking before it clears them"
                width={900}
                height={1826}
                sizes="(max-width: 900px) 420px, 440px"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              />
            </div>
            <div className="meta-line shot-caption">
              One sentence in · 51 items listed · nothing gone until you say
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="pantry-grid">
            {items.map((item) => {
              const pill = pillFor(item);
              return (
                <div key={item.id}>
                  <div className="pantry-tile-img">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} width={380} height={380} sizes="190px" />
                    ) : null}
                  </div>
                  <div className="pantry-tile-row">
                    <span className="pantry-tile-name">{item.name}</span>
                    <span className={`pantry-pill${pill.low ? ' pantry-pill-low' : ''}`}>{pill.label}</span>
                  </div>
                  <div className="pantry-tile-note">{noteFor(item)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
