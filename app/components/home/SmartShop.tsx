const ROWS = [
  { name: 'Butter beans', qty: '2 TINS', done: true, pantry: false },
  { name: 'Tenderstem broccoli', qty: '200G', done: true, pantry: false },
  { name: 'Tahini', qty: '1 JAR', done: false, pantry: true },
  { name: 'Salmon fillets', qty: '2', done: false, pantry: false },
  { name: 'Lemons', qty: '3', done: false, pantry: false },
];

export default function SmartShop() {
  return (
    <section className="hp-band">
      <div className="hp-wrap split split-centred">
        <div>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            — One smart shop
          </div>
          <h2 className="hp-h2" style={{ marginBottom: 22 }}>
            One list, sorted by aisle, minus what you already own.
          </h2>
          <p className="hp-lede" style={{ maxWidth: '50ch', marginBottom: 20 }}>
            Pick the meals and Chop it adds the ingredients up for you, so you never buy coriander
            twice. Anything your pantry covers shows as a count you can drop in one tap rather than
            a line that vanished on you, and the finished list goes to Whisk, where you pick the
            supermarket.
          </p>
          <p className="hp-body" style={{ maxWidth: '50ch' }}>
            Tick meals off as you cook them. Anything you did not get round to rolls into next
            week&rsquo;s basket.
          </p>
        </div>

        <div className="shop-card">
          <div className="shop-card-head">
            <span style={{ fontSize: 15, fontWeight: 600 }}>Shopping list</span>
            <span className="meta-line">43 to buy · 11 you have</span>
          </div>
          {ROWS.map((r) => (
            <div className={`shop-row${r.done ? ' shop-row-done' : ''}`} key={r.name}>
              <span className={`shop-box${r.done ? ' shop-box-done' : ''}`} aria-hidden="true" />
              <span className="shop-name">{r.name}</span>
              {r.pantry && <span className="shop-pantry">IN PANTRY</span>}
              <span className="shop-qty">{r.qty}</span>
            </div>
          ))}
          <div className="shop-send">
            <div className="shop-send-btn">Send list</div>
            <span className="meta-line">Opens Whisk · you choose the shop there</span>
          </div>
        </div>
      </div>
    </section>
  );
}
