// Capture block — elevates "Snap a recipe, any recipe" (previously a card
// in WhatItDoes) into a full section. Capability-scoped: photo capture is
// an app feature; link/caption import works in ChatGPT and the app.

import Reveal from './motion/Reveal';
import StaggerGroup from './motion/StaggerGroup';
import StaggerItem from './motion/StaggerItem';

type Source = { title: string; body: string };

const SOURCES: Source[] = [
  {
    title: 'Books.',
    body:
      'Snap the cookbook page — or the handwritten scrawl — with the app. Chop It writes it up properly.',
  },
  {
    title: 'Websites.',
    body:
      'Paste the link, in ChatGPT or the app. No life story, no ads — just the recipe, kept.',
  },
  {
    title: 'Socials.',
    body:
      'A TikTok or Instagram link — or just the pasted caption — becomes a recipe you can actually cook from.',
  },
];

export default function CaptureBlock() {
  return (
    <section className="section capture" id="capture">
      <Reveal>
        <div className="section-head">
          <div className="kicker mono">— EVERY RECIPE, FROM ANYWHERE</div>
          <h2 className="h-editorial">
            Books, websites, socials. <span className="muted">One standard recipe.</span>
          </h2>
          <p className="lead">
            However a recipe reaches you, it ends up the same shape in your library: UK
            ingredients, metric quantities, a method with proper cues. Saved once, usable
            everywhere — in ChatGPT and in the app.
          </p>
        </div>
      </Reveal>
      <StaggerGroup className="principles-grid" stagger={0.1}>
        {SOURCES.map((s) => (
          <StaggerItem key={s.title} className="principle-card">
            <h3 className="principle-title">{s.title}</h3>
            <p className="principle-body">{s.body}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
