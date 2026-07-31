const COLLECTION = [
  { title: 'Harissa butter beans, whipped feta', meta: '20 MIN · 34G PROTEIN' },
  { title: 'Miso aubergine, sesame rice', meta: '30 MIN · 5 PLANTS' },
  { title: 'Chorizo and chickpea traybake', meta: '28 MIN · SERVES 4' },
  { title: 'Green curry with charred greens', meta: '25 MIN · 7 PLANTS' },
  { title: 'Lemon chicken orzo, one pan', meta: '26 MIN · SERVES 4' },
];

export default function AiChef() {
  return (
    <section id="ai-chef" className="hp-band">
      <div className="hp-wrap">
        <div style={{ maxWidth: '62ch', marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            — AI Chef
          </div>
          <h2 className="hp-h2" style={{ marginBottom: 22 }}>
            One ask. Up to twenty-five recipes.
          </h2>
          <p className="hp-lede">
            Ask for a collection: twenty-five weeknight dinners under thirty minutes, a fortnight
            of packed lunches, or everything a bag of lentils will stretch to. AI Chef writes them
            all with real quantities, a real method and macros counted. Each one carries an AI CHEF
            badge, so you can see what the machine wrote.
          </p>
        </div>

        <div className="dish-grid">
          {COLLECTION.map((d) => (
            <div key={d.title}>
              <div className="dish-tile-img">
                <span className="badge-ai dish-tile-badge">AI CHEF</span>
              </div>
              <div className="dish-tile-title">{d.title}</div>
              <div className="dish-tile-meta">{d.meta}</div>
            </div>
          ))}
        </div>
        <div className="meta-line" style={{ marginBottom: 56 }}>
          25 recipes · written from one ask · saved to your library
        </div>

        <div className="price-cards">
          <div className="price-card">
            <div className="meta-line">Free · no model runs</div>
            <div className="price-card-h">Asking about your own food costs nothing</div>
            <p className="hp-body">
              What is in the basket, what the pantry covers, the macros, the filters, any recipe of
              yours by any query. Those answers read data you already hold, so they cost nothing in
              the app or the plug-in.
            </p>
          </div>
          <div className="price-card">
            <div className="meta-line" style={{ color: 'var(--accent-text)' }}>
              1 credit · in the app
            </div>
            <div className="price-card-h">Writing something new says its price first</div>
            <p className="hp-body">
              A new recipe, a cookbook scan, a whole collection. The button shows the cost and your
              balance before you press it, so nothing gets charged behind your back. Run it through
              the plug-in and your ChatGPT subscription covers it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
