'use client';

import type { ReactNode } from 'react';

import {
  trackAppStoreClick,
  trackCtaClicked,
  type CtaLocation,
  type CtaSurface,
} from '@/lib/posthog-events';

type StoreLinkProps = {
  destination: 'app_store' | 'chatgpt';
  href: string;
  /**
   * Funnel bucket on app_store_click. Only meaningful for the App Store
   * destination — ChatGPT links report through `cta_clicked` alone, since
   * the old `chatgpt_click` event was a straight duplicate of it.
   */
  location?: CtaLocation;
  /** Finer-grained surface on cta_clicked. */
  surface: CtaSurface;
  label: string;
  className?: string;
  children: ReactNode;
};

// Anchor that fires the store/ChatGPT funnel events before it navigates.
// Wraps every install CTA on the marketing site so the section a click came
// from stays in the payload.
//
// The anchor renders server-side (Next.js SSRs client components), so `href`
// is in the raw HTML before hydration — a visitor who clicks before JS loads
// still reaches the store, they just aren't counted.
export default function StoreLink({
  destination,
  href,
  location,
  surface,
  label,
  className,
  children,
}: StoreLinkProps) {
  return (
    <a
      className={className}
      href={href}
      rel="noopener noreferrer"
      onClick={() => {
        if (destination === 'app_store' && location) trackAppStoreClick({ location });
        trackCtaClicked({ cta_location: surface, cta_label: label, cta_destination: href });
      }}
    >
      {children}
    </a>
  );
}
