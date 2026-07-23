'use client';

// End-of-article dual CTA for blog posts: ChatGPT primary (filled,
// AI accent) + App Store secondary (outline). Rendered after the article
// body in app/blog/[slug]/page.tsx — the markdown files stay CTA-free.

import { APP_STORE_URL, CHATGPT_LIVE, CHATGPT_URL, IOS_LIVE } from '@/app/lib/app-stores';
import {
  trackAppStoreClick,
  trackChatgptClick,
  trackCtaClicked,
} from '@/lib/posthog-events';

/** The dual button pair on its own — reused by the salads post outro. */
export function BlogCTAButtons({ className = 'blog-cta-row' }: { className?: string }) {
  if (!CHATGPT_LIVE && !IOS_LIVE) return null;
  return (
    <div className={className}>
      {CHATGPT_LIVE && (
          <a
            className="btn btn-ai"
            href={CHATGPT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackChatgptClick({ location: 'blog_cta' });
              trackCtaClicked({
                cta_location: 'blog_footer',
                cta_label: 'ChatGPT',
                cta_destination: CHATGPT_URL,
              });
            }}
          >
            Use it in ChatGPT
          </a>
        )}
        {IOS_LIVE && (
          <a
            className="btn btn-ghost"
            href={APP_STORE_URL}
            rel="noopener noreferrer"
            onClick={() => {
              trackAppStoreClick({ location: 'blog_cta' });
              trackCtaClicked({
                cta_location: 'blog_footer',
                cta_label: 'App Store',
                cta_destination: APP_STORE_URL,
              });
            }}
          >
            Get the iPhone app
          </a>
        )}
    </div>
  );
}

export default function BlogCTA() {
  if (!CHATGPT_LIVE && !IOS_LIVE) return null;
  return (
    <aside className="blog-cta" aria-label="Try Chop It">
      <h2 className="blog-cta-h">Put this into practice this week</h2>
      <p className="blog-cta-sub">
        Chop It works inside ChatGPT: plan the week in a conversation and get one consolidated
        shopping list. Everything you save is waiting in the iPhone app.
      </p>
      <BlogCTAButtons />
    </aside>
  );
}
