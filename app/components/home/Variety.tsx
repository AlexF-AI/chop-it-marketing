import Link from 'next/link';

const MEASURES = [
  { label: 'Protein', value: '118g · 92% of guide', pct: '92%', fill: 'var(--protein)' },
  { label: 'Fibre', value: '21g · 70% of guide', pct: '70%', fill: 'var(--fibre)' },
  { label: 'Plants', value: '26 of 30 types', pct: '87%', fill: 'var(--plants)' },
];

// Three concentric conic-gradient rings, outer to inner: plants, fibre,
// protein. Each ring is a filled circle with a --ground disc stacked on top,
// which is cheaper than three SVG arcs and keeps the theme swap free.
function Wheel() {
  return (
    <div
      className="wheel-ring"
      style={{ width: 170, height: 170, background: 'conic-gradient(var(--plants) 0 .74turn, var(--line) .74turn 1turn)' }}
      role="img"
      aria-label="Diversity Wheel: 26 of 30 plants, 70% of the fibre guide, 92% of the protein guide"
    >
      <div className="wheel-ring" style={{ width: 140, height: 140, background: 'var(--ground)' }}>
        <div
          className="wheel-ring"
          style={{ width: 132, height: 132, background: 'conic-gradient(var(--fibre) 0 .58turn, var(--line) .58turn 1turn)' }}
        >
          <div className="wheel-ring" style={{ width: 102, height: 102, background: 'var(--ground)' }}>
            <div
              className="wheel-ring"
              style={{ width: 94, height: 94, background: 'conic-gradient(var(--protein) 0 .88turn, var(--line) .88turn 1turn)' }}
            >
              <div
                className="wheel-ring"
                style={{ width: 64, height: 64, background: 'var(--ground)', flexDirection: 'column', gap: 1 }}
              >
                <span className="wheel-count">26</span>
                <span className="wheel-count-label">PLANTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Variety() {
  return (
    <section className="hp-band">
      <div className="hp-wrap split split-centred">
        <div>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            — Variety, not restriction
          </div>
          <h2 className="hp-h2" style={{ marginBottom: 22 }}>
            Thirty plants a week beats cutting out a food group.
          </h2>
          <p className="hp-lede" style={{ maxWidth: '50ch', marginBottom: 18 }}>
            The Diversity Wheel shows three rings, protein, fibre and plants, across your last
            seven cooks. No score out of a hundred and no red warnings. It shows where the week is
            thin and the swap that would fix it: lentils into the bolognese, squash into the mac
            sauce.
          </p>
          <p className="hp-body" style={{ maxWidth: '50ch' }}>
            Comfort food stays. Keep Friday lasagne and balance the week around it.
          </p>
          <Link className="hp-link" href="/method" style={{ marginTop: 22 }}>
            The nine-stage standard behind every recipe →
          </Link>
        </div>

        <div className="wheel-col">
          <Wheel />
          <div className="measures">
            {MEASURES.map((m) => (
              <div key={m.label}>
                <div className="measure-head">
                  <span className="meta-line">{m.label}</span>
                  <span className="measure-value">{m.value}</span>
                </div>
                <div className="measure-track">
                  <div className="measure-fill" style={{ width: m.pct, background: m.fill }} />
                </div>
              </div>
            ))}
          </div>
          <div className="wheel-note">A guide to nutritional variety, not medical advice.</div>
        </div>
      </div>
    </section>
  );
}
