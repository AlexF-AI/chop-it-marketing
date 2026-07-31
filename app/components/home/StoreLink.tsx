'use client';

import type { ReactNode } from 'react';

import {
  trackAppStoreClick,
  trackChatgptClick,
  trackCtaClicked,
  type CtaLocation,
  type CtaSurface,
} from '@/lib/posthog-events';

type StoreLinkProps = {
  destination: 'app_store' | 'chatgpt';
  href: string;
  /** Funnel bucket on app_store_click / chatgpt_click. */
  location: CtaLocation;
  /** Finer-grained surface on cta_clicked. */
  surface: CtaSurface;
  label: string;
  className?: string;
  children: ReactNode;
};

// Anchor that fires the store/ChatGPT funnel events before it navigates.
// Wraps every install CTA on the marketing site so the section a click came
// from stays in the payload.
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
        if (destination === 'app_store') trackAppStoreClick({ location });
        else trackChatgptClick({ location });
        trackCtaClicked({ cta_location: surface, cta_label: label, cta_destination: href });
      }}
    >
      {children}
    </a>
  );
}
