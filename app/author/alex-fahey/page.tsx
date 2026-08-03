import type { Metadata } from 'next';
import Link from 'next/link';

import Breadcrumbs, { type Crumb } from '@/app/components/Breadcrumbs';
import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import { ALEX_FAHEY } from '@/app/lib/authors';
import { getAllPostsMeta } from '@/app/lib/blog';
import { buildBreadcrumbJsonLd, serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';

export const metadata: Metadata = {
  title: 'Alex Fahey, Founder of Chop it',
  description: ALEX_FAHEY.description,
  alternates: { canonical: ALEX_FAHEY.url },
  authors: [{ name: ALEX_FAHEY.name, url: ALEX_FAHEY.url }],
  openGraph: {
    title: 'Alex Fahey, Founder of Chop it',
    description: ALEX_FAHEY.description,
    url: ALEX_FAHEY.url,
    type: 'profile',
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

export default function AlexFaheyAuthorPage() {
  const posts = getAllPostsMeta().filter((post) => !post.menuShareCode);
  const crumbs: Crumb[] = [{ name: 'Home', href: '/' }, { name: ALEX_FAHEY.name }];
  const breadcrumbLd = buildBreadcrumbJsonLd(crumbs);
  const profileLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': ALEX_FAHEY.url,
    url: ALEX_FAHEY.url,
    name: `${ALEX_FAHEY.name}, ${ALEX_FAHEY.jobTitle}`,
    description: ALEX_FAHEY.description,
    mainEntity: {
      '@type': 'Person',
      '@id': `${ALEX_FAHEY.url}#person`,
      name: ALEX_FAHEY.name,
      jobTitle: ALEX_FAHEY.jobTitle,
      url: ALEX_FAHEY.url,
      worksFor: {
        '@type': 'Organization',
        name: 'Chop it',
        url: SITE_ORIGIN,
      },
    },
  };

  return (
    <>
      <Nav />
      <main>
        <section className="section blog-index">
          <Breadcrumbs crumbs={crumbs} />
          <div className="section-head">
            <div className="kicker mono">— FOUNDER</div>
            <h1 className="h-editorial">Alex Fahey</h1>
            <p className="lead">
              Founder of Chop it, the UK cooking app that keeps recipes from AI, cookbooks,
              websites and social in one place.
            </p>
            <p>
              Alex built Chop it after finding that useful recipes created in ChatGPT disappeared
              into old conversations while trusted recipes stayed scattered across books,
              screenshots and bookmarks. He writes about the practical systems that carry a dinner
              idea through planning, shopping and cooking.
            </p>
          </div>

          <h2 className="blog-card-title">Articles by Alex</h2>
          <ul className="blog-list">
            {posts.map((post) => (
              <li key={post.slug} className="blog-card">
                <Link href={`/blog/${post.slug}`} className="blog-card-link">
                  <time className="blog-card-date mono" dateTime={post.dateModified}>
                    Updated {formatDate(post.dateModified)}
                  </time>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-desc">{post.description}</p>
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(profileLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <Footer />
    </>
  );
}
