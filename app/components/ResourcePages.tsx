// Shared renderers for the Learn and Research sections.
//
// Both sections use the blog's existing article and index styling classes on
// purpose: no new CSS means no new design language, and the two sections read
// as native parts of the site rather than a bolted-on content farm.
//
// The FAQ block is rendered from the registry entry and the same strings are
// serialized into FAQPage JSON-LD, so the visible copy and the markup cannot
// drift apart.

import type { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Breadcrumbs, { type Crumb } from '@/app/components/Breadcrumbs';
import Footer from '@/app/components/Footer';
import MarkdownImage from '@/app/components/MarkdownImage';
import Nav from '@/app/components/Nav';
import StoreLink from '@/app/components/home/StoreLink';
import { appStoreUrl, CHATGPT_URL } from '@/app/lib/app-stores';
import { ALEX_FAHEY } from '@/app/lib/authors';
import { buildFaqJsonLd } from '@/app/lib/blogSchema';
import {
  getResource,
  getResourceBody,
  getResources,
  type ResourceMeta,
  type ResourceSection,
} from '@/app/lib/resources';
import { buildBreadcrumbJsonLd, serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const SECTION_COPY: Record<
  ResourceSection,
  { label: string; kicker: string; lead: string; description: string }
> = {
  learn: {
    label: 'Learn',
    kicker: '— LEARN',
    lead: 'Plain answers to the questions people actually ask about cooking and planning with AI. Each guide works on its own, with or without the app.',
    description:
      'Plain-English guides to AI cooking: creating recipes, shopping lists, food waste and saving recipes from any source. Useful with or without Chop it.',
  },
  research: {
    label: 'Research',
    kicker: '— RESEARCH',
    lead: 'Sourced reference material on AI in home cooking. Every figure is cited, dated and traceable to the organisation that published it.',
    description:
      'Reference pages on AI in home cooking, built from cited research. Every statistic is sourced, dated and traceable to its publisher.',
  },
  features: {
    label: 'Features',
    kicker: '— FEATURES',
    lead: 'The parts of Chop it that deserve a page of their own: what each one measures or manages, how it works, and where its limits sit.',
    description:
      'Canonical pages for Chop it features: the Weekly Diversity Score and the self-maintaining pantry, each explained with its limits stated.',
  },
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function resourceIndexMetadata(section: ResourceSection): Metadata {
  const copy = SECTION_COPY[section];
  const title = `${copy.label} · Chop it`;
  const url = `${SITE_ORIGIN}/${section}`;
  return {
    title,
    description: copy.description,
    alternates: { canonical: url },
    openGraph: { title, description: copy.description, url, type: 'website' },
    twitter: { card: 'summary', title, description: copy.description },
  };
}

export function resourceArticleMetadata(section: ResourceSection, slug: string): Metadata {
  const r = getResource(section, slug);
  if (!r) return { title: 'Not found · Chop it' };
  const url = `${SITE_ORIGIN}/${section}/${r.slug}`;
  const title = `${r.seoTitle} · Chop it`;
  const image = r.image ? `${SITE_ORIGIN}${r.image}` : undefined;
  return {
    title,
    description: r.description,
    alternates: { canonical: url },
    authors: [{ name: ALEX_FAHEY.name, url: ALEX_FAHEY.url }],
    openGraph: {
      title: r.seoTitle,
      description: r.description,
      url,
      type: 'article',
      publishedTime: new Date(`${r.datePublished}T00:00:00Z`).toISOString(),
      modifiedTime: new Date(`${r.dateModified}T00:00:00Z`).toISOString(),
      authors: [ALEX_FAHEY.name],
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: r.seoTitle,
      description: r.description,
      images: image ? [image] : undefined,
    },
  };
}

export function ResourceIndexPage({ section }: { section: ResourceSection }) {
  const copy = SECTION_COPY[section];
  const items = getResources(section);
  const url = `${SITE_ORIGIN}/${section}`;

  const crumbs: Crumb[] = [{ name: 'Home', href: '/' }, { name: copy.label }];
  const listLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Chop it ${copy.label}`,
    description: copy.description,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((r, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${url}/${r.slug}`,
        name: r.title,
      })),
    },
  };

  return (
    <>
      <Nav />
      <main>
        <section className="section blog-index">
          <Breadcrumbs crumbs={crumbs} />
          <div className="section-head">
            <div className="kicker mono">{copy.kicker}</div>
            <h1 className="h-editorial">{copy.label}</h1>
            <p className="lead">{copy.lead}</p>
          </div>
          <ul className="blog-list">
            {items.map((r) => (
              <li key={r.slug} className="blog-card">
                <Link href={`/${section}/${r.slug}`} className="blog-card-link">
                  <time className="blog-card-date mono" dateTime={r.dateModified}>
                    Updated {formatDate(r.dateModified)}
                  </time>
                  <h2 className="blog-card-title">{r.title}</h2>
                  <p className="blog-card-desc">{r.description}</p>
                  <span className="blog-card-more mono">Read →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(listLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBreadcrumbJsonLd(crumbs)) }}
      />
      <Footer />
    </>
  );
}

export function ResourceArticlePage({ resource }: { resource: ResourceMeta }) {
  const copy = SECTION_COPY[resource.section];
  const url = `${SITE_ORIGIN}/${resource.section}/${resource.slug}`;
  const body = getResourceBody(resource.section, resource.slug);

  const crumbs: Crumb[] = [
    { name: 'Home', href: '/' },
    { name: copy.label, href: `/${resource.section}` },
    { name: resource.title },
  ];

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    headline: resource.seoTitle,
    description: resource.description,
    datePublished: new Date(`${resource.datePublished}T00:00:00Z`).toISOString(),
    dateModified: new Date(`${resource.dateModified}T00:00:00Z`).toISOString(),
    author: {
      '@type': 'Person',
      '@id': `${ALEX_FAHEY.url}#person`,
      name: ALEX_FAHEY.name,
      url: ALEX_FAHEY.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Chop it',
      url: SITE_ORIGIN,
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/logo.webp` },
    },
    mainEntityOfPage: url,
    ...(resource.image ? { image: `${SITE_ORIGIN}${resource.image}` } : {}),
  };

  return (
    <>
      <Nav />
      <main>
        <article className="blog-article">
          <Breadcrumbs crumbs={crumbs} />
          <div className="blog-article-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: MarkdownImage }}>
              {body}
            </ReactMarkdown>
            {resource.faq && resource.faq.length > 0 ? (
              <>
                <h2>Frequently asked questions</h2>
                {resource.faq.map((f) => (
                  <div key={f.question}>
                    <p>
                      <strong>{f.question}</strong>
                    </p>
                    <p>{f.answer}</p>
                  </div>
                ))}
              </>
            ) : null}
          </div>
          {resource.cta ? (
            <aside className="blog-cta" aria-label={resource.cta.heading}>
              <h2 className="blog-cta-h">{resource.cta.heading}</h2>
              <p className="blog-cta-sub">{resource.cta.body}</p>
              <div className="blog-cta-row">
                {resource.cta.kind === 'chatgpt' ? (
                  <StoreLink
                    destination="chatgpt"
                    href={CHATGPT_URL}
                    surface="resource_footer"
                    label={resource.cta.label}
                    className="btn btn-ai"
                  >
                    {resource.cta.label}
                  </StoreLink>
                ) : (
                  <StoreLink
                    destination="app_store"
                    href={appStoreUrl('resource_footer')}
                    location="download_cta"
                    surface="resource_footer"
                    label={resource.cta.label}
                    className="btn btn-ai"
                  >
                    {resource.cta.label}
                  </StoreLink>
                )}
              </div>
            </aside>
          ) : null}
        </article>
      </main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleLd) }}
      />
      {resource.faq && resource.faq.length > 0 ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqJsonLd(resource.faq)) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildBreadcrumbJsonLd(crumbs)) }}
      />
      <Footer />
    </>
  );
}
