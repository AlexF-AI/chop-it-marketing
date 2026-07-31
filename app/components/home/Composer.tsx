'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// A playable stand-in for the app's AI Chef composer. Nothing here calls a
// model: every reply is canned, and the point of the demo is the pricing
// behaviour — lookups over your own library answer for free, anything that
// has to be written quotes its cost and waits for a tap.

type Card = { title: string; meta: string };

type Reply = {
  text: string;
  sub?: string;
  cards?: Card[];
  saved?: Card[];
  confirmYes?: string;
  priced?: string;
  balance?: string;
  lane: string;
};

type Message =
  | { id: number; kind: 'user'; text: string }
  | ({ id: number; kind: 'ai'; phase: 'thinking' | 'typing' | 'done' } & Reply);

const CHIPS = ['Cook tonight', 'Use my pantry', 'Clear my fridge', 'High protein', 'Quick meals', 'BBQ ideas'];

const FREE_REPLIES: Record<string, Reply> = {
  'Cook tonight': {
    text: 'Four of yours are under 30 minutes.',
    sub: "Sorted by what you haven't cooked in a while.",
    cards: [
      { title: 'Crispy gnocchi, brown butter sage', meta: '18 MIN · 7 INGREDIENTS' },
      { title: 'Charred broccoli, tahini, butter beans', meta: '25 MIN · 9 INGREDIENTS' },
    ],
    lane: 'Free · no model runs · 4 of 142',
  },
  'Use my pantry': {
    text: 'You should have most of these two.',
    sub: 'Missing spring onions for the first one. Still got the miso paste?',
    cards: [
      { title: 'Miso-glazed salmon, soba', meta: '22 MIN · USES 8 OF YOURS' },
      { title: 'Chicken and sweetcorn fried rice', meta: '15 MIN · USES 9 OF YOURS' },
    ],
    lane: 'Free · from your pantry · phrased as a maybe',
  },
  'Clear my fridge': {
    text: "That's 51 things in your fridge. Clear them?",
    sub: 'Ground coriander, asparagus tips, new potatoes, Greek yoghurt, dill, salmon fillets, flat leaf parsley and 44 more',
    confirmYes: 'Clear your fridge',
    lane: 'Free · one ask · nothing leaves without a yes',
  },
  'High protein': {
    text: 'Six of yours clear 30g a serving.',
    sub: 'Counted per serving, from the macros already on each recipe.',
    cards: [
      { title: 'Harissa butter beans, feta', meta: '20 MIN · 34G PROTEIN' },
      { title: 'Cod, lentils, salsa verde', meta: '28 MIN · 41G PROTEIN' },
    ],
    lane: 'Free · from your macros · 6 of 142',
  },
  'Quick meals': {
    text: 'Nine come in under 20 minutes.',
    sub: 'Two of them you have never cooked.',
    cards: [
      { title: 'Cacio e pepe', meta: '12 MIN · 4 INGREDIENTS' },
      { title: 'Smash burgers, burnt onion mayo', meta: '16 MIN · 8 INGREDIENTS' },
    ],
    lane: 'Free · no model runs · 9 of 142',
  },
  'BBQ ideas': {
    text: 'Nothing saved matches that.',
    sub: 'I can write you a collection instead. Five to start, saved to your library.',
    priced: 'Write 5 BBQ recipes · 1 credit',
    balance: 'You have 5 credits · free in ChatGPT',
    lane: 'Free · searched 142 of yours · 0 matches',
  },
};

const WRITTEN: Card[] = [
  { title: 'Gochujang chicken thighs, charred spring onion', meta: '35 MIN · 42G PROTEIN' },
  { title: 'Smoked aubergine, tahini, pomegranate', meta: '40 MIN · 6 PLANTS' },
  { title: 'Lamb koftas, cucumber and mint', meta: '28 MIN · SERVES 4' },
];

const CPS = 55; // characters a second for the typewriter

// Owns its own tick so a running headline never re-renders the thread.
function TypeLine({ full }: { full: string }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
    const tick = setInterval(() => {
      setN((prev) => {
        const next = prev + 2;
        if (next >= full.length) {
          clearInterval(tick);
          return full.length;
        }
        return next;
      });
    }, Math.round(2000 / CPS));
    return () => clearInterval(tick);
  }, [full]);

  return (
    <span>
      {full.slice(0, n)}
      <span className="msg-caret" aria-hidden="true" />
    </span>
  );
}

export default function Composer() {
  const [thread, setThread] = useState<Message[]>([]);
  const [typed, setTyped] = useState('');
  const [scopeMine, setScopeMine] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread]);

  const patch = useCallback((id: number, phase: 'typing' | 'done') => {
    setThread((prev) => prev.map((m) => (m.id === id && m.kind === 'ai' ? { ...m, phase } : m)));
  }, []);

  // Two re-renders per reply: one when typing starts, one when it lands.
  const push = useCallback(
    (user: string | null, reply: Reply) => {
      const aiId = (nextId.current += 1);
      const added: Message[] = [];
      if (user !== null) {
        added.push({ id: (nextId.current += 1), kind: 'user', text: user });
      }
      added.push({ id: aiId, kind: 'ai', phase: 'thinking', ...reply });
      setThread((prev) => [...prev, ...added]);

      const start = setTimeout(() => {
        patch(aiId, 'typing');
        const done = setTimeout(() => patch(aiId, 'done'), (reply.text.length / CPS) * 1000 + 120);
        timers.current.push(done);
      }, 620);
      timers.current.push(start);
    },
    [patch],
  );

  const send = () => {
    const text = typed.trim();
    if (!text) return;
    setTyped('');
    push(text, {
      text: 'Nothing of yours is close enough to that.',
      sub: 'This one needs writing, so it runs the model, and only when you say so.',
      priced: 'Something new · 1 credit',
      balance: 'You have 5 credits · free in ChatGPT',
      lane: 'Free · searched 142 of yours · 0 matches',
    });
  };

  const spend = () =>
    push(null, {
      text: 'Written, and saved to My Recipes.',
      sub: 'Macros counted, quantities metric, badged so you know what the machine wrote.',
      saved: WRITTEN,
      lane: 'AI Chef · 1 credit spent · 4 left',
    });

  const clearFridge = () =>
    push(null, {
      text: 'Fridge cleared, 51 gone.',
      sub: 'Your cupboard and freezer are untouched. Say the word and I can put them all back.',
      lane: 'Free · undo available · pantry now 38 items',
    });

  const keepFridge = () =>
    push(null, {
      text: 'Left as it was.',
      sub: 'Nothing removed. I only ever ask.',
      lane: 'Free · no changes made',
    });

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setThread([]);
    setTyped('');
  };

  return (
    <div>
      <div className="composer-head">
        <span className="meta-line">Try it · the app&rsquo;s composer</span>
        <button type="button" className="composer-reset" onClick={reset}>
          New chat
        </button>
      </div>

      <div className="composer">
        <div className="composer-bar">
          <span className="composer-burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="meta-line">AI Chef</span>
          <span className="composer-avatar" aria-hidden="true">
            A
          </span>
        </div>

        <div className="composer-thread" ref={threadRef}>
          {thread.length === 0 && (
            <div className="composer-empty">
              <div className="composer-empty-h">What are you cooking?</div>
              <div className="composer-empty-p">
                Ask about your own recipes for free, or have AI Chef write something new.
              </div>
            </div>
          )}

          {thread.map((m) =>
            m.kind === 'user' ? (
              <div className="msg" key={m.id}>
                <div className="msg-user">{m.text}</div>
              </div>
            ) : (
              <div className="msg" key={m.id}>
                <div className="msg-ai">
                  {m.phase === 'thinking' && (
                    <div className="msg-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  )}
                  {m.phase === 'typing' && (
                    <div className="msg-h">
                      <TypeLine full={m.text} />
                    </div>
                  )}
                  {m.phase === 'done' && (
                    <>
                      <div className="msg-h">{m.text}</div>
                      {m.sub && <div className="msg-sub">{m.sub}</div>}
                      {m.cards && m.cards.length > 0 && (
                        <div className="msg-cards">
                          {m.cards.map((c) => (
                            <div className="msg-card" key={c.title}>
                              <span className="msg-card-thumb" aria-hidden="true" />
                              <div className="msg-card-body">
                                <div className="msg-card-title">{c.title}</div>
                                <div className="msg-card-meta">{c.meta}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {m.saved && m.saved.length > 0 && (
                        <div className="msg-cards">
                          {m.saved.map((c) => (
                            <div className="msg-card" key={c.title}>
                              <span className="msg-card-thumb" aria-hidden="true" />
                              <div className="msg-card-body">
                                <div className="msg-card-title">{c.title}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                  <span className="badge-ai">AI CHEF</span>
                                  <span className="msg-card-meta">{c.meta}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {m.confirmYes && (
                        <div className="msg-confirm">
                          <button type="button" className="msg-confirm-yes" onClick={clearFridge}>
                            {m.confirmYes}
                          </button>
                          <button type="button" className="msg-confirm-no" onClick={keepFridge}>
                            Keep them
                          </button>
                        </div>
                      )}
                      {m.priced && (
                        <div className="msg-priced">
                          <button type="button" onClick={spend}>
                            {m.priced}
                          </button>
                          {m.balance && <span className="msg-balance">{m.balance}</span>}
                        </div>
                      )}
                      <div className="msg-lane">{m.lane}</div>
                    </>
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        <div className="composer-foot">
          <div className="chip-row">
            {CHIPS.map((label) => (
              <button
                type="button"
                className="chip"
                key={label}
                onClick={() => push(label, FREE_REPLIES[label])}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="composer-input">
            <span aria-hidden="true">+</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send();
              }}
              placeholder="Ask for a meal, or paste a recipe link"
              aria-label="Ask AI Chef"
            />
            <button type="button" className="composer-send" onClick={send} aria-label="Send">
              ↑
            </button>
          </div>
          <div className="composer-scope">
            <button
              type="button"
              className="scope-btn"
              aria-pressed={scopeMine}
              onClick={() => setScopeMine((v) => !v)}
            >
              My Recipes only
              <span className="scope-track" aria-hidden="true">
                <span className="scope-knob" />
              </span>
            </button>
            <span className="scope-label">
              {scopeMine ? 'Your 142 recipes only' : 'Including Chop it recipes'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
