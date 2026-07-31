import Image from 'next/image';

const STEPS = [
  {
    n: '01',
    h: 'The plug-in, free',
    p: (
      <>
        Open Plugins in ChatGPT, search <strong style={{ fontWeight: 600 }}>Chop it</strong>, enable
        it once. Then ask for a week of dinners in the conversation you were already in. Same
        features, your subscription, and it knows your library.
      </>
    ),
  },
  {
    n: '02',
    h: 'One library in the middle',
    p: (
      <>
        Whatever you save, wherever you saved it, ends up the same shape: UK ingredients, metric
        quantities, a method with proper cues, macros counted. Save it once and use it in both
        places.
      </>
    ),
  },
  {
    n: '03',
    h: 'In the app, where you cook',
    p: (
      <>
        Cook mode with timers, the week you shopped for, one consolidated list, the pantry, and a
        camera that reads cookbook pages. The parts a conversation cannot do.
      </>
    ),
  },
];

export default function PlugIn() {
  return (
    <section id="chatgpt" className="hp-band">
      <div className="hp-wrap split split-wide">
        <div>
          <div className="eyebrow" style={{ marginBottom: 20 }}>
            — Two front doors, one library
          </div>
          <h2 className="hp-h2" style={{ marginBottom: 22 }}>
            Add the plug-in.
            <br />
            Cook it in the app.
          </h2>
          <p className="hp-lede" style={{ maxWidth: '52ch', marginBottom: 40 }}>
            Chop it runs as a plug-in inside ChatGPT and as an app on your phone. The plug-in
            installs in one tap and costs nothing extra: searching, planning, writing new recipes
            and importing from anywhere all run on your own ChatGPT subscription, and land in the
            same library you cook from in the app.
          </p>

          <div className="num-list">
            {STEPS.map((s) => (
              <div className="num-row" key={s.n}>
                <div className="num-row-n">{s.n}</div>
                <div>
                  <div className="num-row-h">{s.h}</div>
                  <p className="hp-body">{s.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="split-media" style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div>
            <div className="shot">
              <Image
                src="/chatgpt-plugin-search.webp"
                alt="Searching Plugins in ChatGPT for Chop it"
                width={1178}
                height={1229}
                sizes="(max-width: 900px) 420px, 440px"
              />
            </div>
            <div className="meta-line shot-caption">Plugins → search “Chop it” → enable</div>
          </div>
          <div>
            <div className="shot shot-tall">
              <Image
                src="/ai-chef-in-app.webp"
                alt="AI Chef in the app answering a question about beef mince and onions with matching recipes"
                width={900}
                height={1818}
                sizes="(max-width: 900px) 420px, 440px"
              />
            </div>
            <div className="meta-line shot-caption">Ask in either place · answered from your library</div>
          </div>
        </div>
      </div>
    </section>
  );
}
