const SOURCES = [
  {
    kicker: 'Books',
    h: 'Snap the page',
    p: "One to twenty pages at a time: cookbook spreads, a magazine tear-out, your nan's handwriting. Chop it types it up for you.",
  },
  {
    kicker: 'Websites',
    h: 'Paste the link',
    p: 'In the app or the plug-in. If a page will not give up its recipe, Chop it says so, offers to take the text instead, and does not charge you for the miss.',
  },
  {
    kicker: 'Socials',
    h: 'TikTok, Instagram, a caption',
    p: 'Send a link, a screenshot or the pasted caption and you get quantities that add up and a method you can cook from.',
  },
  {
    kicker: 'A meal you ate',
    h: 'Recreate it',
    p: 'Photograph the plate and get a recipe that lands close. The one import that starts with dinner instead of a document.',
  },
];

export default function Capture() {
  return (
    <section className="hp-band">
      <div className="hp-wrap">
        <div style={{ maxWidth: '60ch', marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            — Every recipe, from anywhere
          </div>
          <h2 className="hp-h2" style={{ marginBottom: 22 }}>
            Books, websites, socials. One standard recipe.
          </h2>
          <p className="hp-lede">
            However a recipe reaches you, it lands in your library in the same shape. No life story
            before the ingredients, no screenshot you will never find again.
          </p>
        </div>

        <div className="capture-grid">
          {SOURCES.map((s) => (
            <div className="capture-cell" key={s.kicker}>
              <div className="meta-line">{s.kicker}</div>
              <div className="capture-cell-h">{s.h}</div>
              <p className="hp-body">{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
