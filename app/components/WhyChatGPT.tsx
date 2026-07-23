// "Why inside ChatGPT" — sits directly after the hero. Three reasons the
// ChatGPT surface matters, scoped to what the Chop It app in ChatGPT can
// actually do (search, weekly menu, consolidated list, save-to-library);
// pantry and photo capture stay app-side claims elsewhere on the page.

import Reveal from './motion/Reveal';
import StaggerGroup from './motion/StaggerGroup';
import StaggerItem from './motion/StaggerItem';

type Reason = { title: string; body: string };

const REASONS: Reason[] = [
  {
    title: 'No new app habit.',
    body:
      'Chop It works where you already plan things. Open ChatGPT, ask about dinner, and your recipes are right there — nothing new to learn.',
  },
  {
    title: 'Planning is a conversation.',
    body:
      '“Plan five dinners under 30 minutes, no fish.” Chop It searches the catalogue, builds the weekly menu, and writes one consolidated shopping list.',
  },
  {
    title: 'Your library follows you.',
    body:
      'Everything you save or import in ChatGPT lands in your Chop It library — waiting in the app when you’re at the shop or the hob.',
  },
];

export default function WhyChatGPT() {
  return (
    <section className="section why-chatgpt" id="chatgpt">
      <Reveal>
        <div className="section-head">
          <div className="kicker mono">— WHY INSIDE ChatGPT</div>
          <h2 className="h-editorial">
            No new app habit. <span className="muted">Just a better conversation about dinner.</span>
          </h2>
        </div>
      </Reveal>
      <StaggerGroup className="principles-grid" stagger={0.1}>
        {REASONS.map((r) => (
          <StaggerItem key={r.title} className="principle-card">
            <h3 className="principle-title">{r.title}</h3>
            <p className="principle-body">{r.body}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
