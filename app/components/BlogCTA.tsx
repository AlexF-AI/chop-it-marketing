'use client';

// End-of-article dual CTA for blog posts: ChatGPT primary (filled,
// AI accent) + App Store secondary (outline). Rendered after the article
// body in app/blog/[slug]/page.tsx — the markdown files stay CTA-free.

import { appStoreUrl, CHATGPT_LIVE, CHATGPT_URL, IOS_LIVE } from '@/app/lib/app-stores';
import { trackAppStoreClick, trackCtaClicked } from '@/lib/posthog-events';

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
            href={appStoreUrl('blog_footer')}
            rel="noopener noreferrer"
            onClick={() => {
              trackAppStoreClick({ location: 'blog_cta' });
              trackCtaClicked({
                cta_location: 'blog_footer',
                cta_label: 'App Store',
                cta_destination: appStoreUrl('blog_footer'),
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
    <aside className="blog-cta" aria-label="Try Chop it">
      <h2 className="blog-cta-h">Keep the good ideas</h2>
      <p className="blog-cta-sub">
        Create or find a recipe with Chop it in ChatGPT, then open anything you want to keep in
        the iPhone app alongside recipes from cookbooks, websites and social. Plan the week, build
        one shopping list and cook from the same library.
      </p>
      <BlogCTAButtons />
    </aside>
  );
}
