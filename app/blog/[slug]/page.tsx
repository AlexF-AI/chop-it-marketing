import { isValidElement, type ReactNode } from 'react';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Image from 'next/image';
import Link from 'next/link';

import BlogCTA from '@/app/components/BlogCTA';
import ReadingProgress from '@/app/components/ReadingProgress';
import Breadcrumbs, { type Crumb } from '@/app/components/Breadcrumbs';
import Footer from '@/app/components/Footer';
import MarkdownImage from '@/app/components/MarkdownImage';
import Nav from '@/app/components/Nav';
import SummerSaladsArticle from '@/app/components/SummerSaladsArticle';
import { ALEX_FAHEY } from '@/app/lib/authors';
import { BLOG_AUTHOR, getAllPostsMeta, getPostBody, getPostMeta } from '@/app/lib/blog';
import { orgRef } from '@/app/lib/entity';
import {
  APP_LIST_BY_SLUG,
  buildAppItemListJsonLd,
  buildFaqJsonLd,
  FAQ_BY_SLUG,
} from '@/app/lib/blogSchema';
import { isoDuration } from '@/app/lib/iso';
import { getMenuRecipesFull, type FullMenuRecipe } from '@/app/lib/menuRecipes';
import { buildBreadcrumbJsonLd, serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';
import { headingSlug, parseArticle } from '@/app/lib/blogArticle';
import styles from './BlogArticle.module.css';

// Articles are file-backed (content/blog/<slug>.md) except menu-backed posts,
// which read from Supabase at build. Prerender every known slug and reject
// anything else, so getPostBody's fs read only ever runs at build time. Like
// the rest of the DB-backed pages here, the menu post is baked at build and
// refreshes on the next deploy / revalidation.
export const dynamicParams = false;


// schema.org ItemList of Recipes for the interactive menu post — gives each
// salad a Recipe rich-result with ingredients, steps and time. Each item
// needs a unique URL, so we anchor to the salad's card on this page.
function buildSaladItemListJsonLd(
  pageUrl: string,
  title: string,
  recipes: FullMenuRecipe[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    numberOfItems: recipes.length,
    url: pageUrl,
    itemListElement: recipes.map((r, idx) => {
      const recipe: Record<string, unknown> = {
        '@type': 'Recipe',
        name: r.title,
        url: `${pageUrl}#salad-${r.id}`,
        author: orgRef,
      };
      if (r.image_url) recipe.image = [r.image_url];
      if (r.description) recipe.description = r.description;
      if (r.cuisine) recipe.recipeCuisine = r.cuisine;
      if (r.servings) recipe.recipeYield = `${r.servings} servings`;
      const total = isoDuration(r.total_minutes);
      if (total) recipe.totalTime = total;
      if (r.ingredients.length > 0) recipe.recipeIngredient = r.ingredients;
      if (r.method.length > 0) {
        recipe.recipeInstructions = r.method.map((text, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          text,
        }));
      }
      return { '@type': 'ListItem', position: idx + 1, item: recipe };
    }),
  };
}

/**
 * Flattens a ReactMarkdown heading's children back to plain text.
 *
 * The heading id has to match the slug the contents list links to, and that
 * slug is computed from the raw markdown — so a heading carrying inline
 * emphasis or a link arrives here as an element tree rather than a string,
 * and has to be walked back to text before hashing.
 */
function childrenToText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(childrenToText).join('');
  if (isValidElement(node)) {
    return childrenToText((node.props as { children?: ReactNode }).children);
  }
  return '';
}

export function generateStaticParams() {
  return getAllPostsMeta().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostMeta(slug);
  if (!post) return { title: 'Article not found · Chop it' };

  const url = `${SITE_ORIGIN}/blog/${post.slug}`;
  const author = post.menuShareCode
    ? { name: BLOG_AUTHOR, url: SITE_ORIGIN }
    : { name: ALEX_FAHEY.name, url: ALEX_FAHEY.url };
  return {
    title: `${post.title} · Chop it`,
    description: post.description,
    alternates: { canonical: url },
    authors: [author],
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: new Date(`${post.datePublished}T00:00:00Z`).toISOString(),
      modifiedTime: new Date(`${post.dateModified}T00:00:00Z`).toISOString(),
      authors: [author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostMeta(slug);
  if (!post) notFound();

  const url = `${SITE_ORIGIN}/blog/${post.slug}`;

  const crumbs: Crumb[] = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: post.title },
  ];
  const breadcrumbLd = buildBreadcrumbJsonLd(crumbs);

  const articleLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    headline: post.title,
    description: post.description,
    datePublished: new Date(`${post.datePublished}T00:00:00Z`).toISOString(),
    dateModified: new Date(`${post.dateModified}T00:00:00Z`).toISOString(),
    author: post.menuShareCode
      ? orgRef
      : {
          '@type': 'Person',
          '@id': `${ALEX_FAHEY.url}#person`,
          name: ALEX_FAHEY.name,
          url: ALEX_FAHEY.url,
        },
    publisher: orgRef,
    mainEntityOfPage: url,
    image: `${url}/opengraph-image`,
  };

  // Menu-backed interactive post (e.g. "This week's dinners").
  if (post.menuShareCode) {
    const menu = await getMenuRecipesFull(post.menuShareCode);
    if (!menu || menu.recipes.length === 0) notFound();
    const menuUrl = `/m/${post.menuShareCode}`;
    if (menu.recipes[0]?.image_url) articleLd.image = menu.recipes[0].image_url;
    const itemListLd = buildSaladItemListJsonLd(url, post.title, menu.recipes);

    return (
      <>
        <Nav />
        <main>
          <div className="salad-page">
            <Breadcrumbs crumbs={crumbs} />
            <SummerSaladsArticle
              recipes={menu.recipes}
              menuUrl={menuUrl}
              dateModified={post.dateModified}
            />
          </div>
        </main>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListLd) }}
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

  const raw = getPostBody(slug);
  const article = parseArticle(raw);

  // Optional per-article schema. Only comparison articles carry these: the
  // FAQ answers mirror the visible copy to prevent contradictory machine-
  // readable text, and the ItemList follows the order of the app sections.
  //
  // Two FAQ sources exist and only one may be emitted, or the page ships two
  // competing FAQPage nodes: the curated FAQ_BY_SLUG entries win where they
  // exist, and the "Quick answers" list the parser lifted out of the body is
  // the fallback. Whichever is chosen is both rendered AND described, so the
  // visible copy and the structured data can never disagree.
  const faq = FAQ_BY_SLUG[slug] ?? (article.faqs.length > 0 ? article.faqs : undefined);
  const listedApps = APP_LIST_BY_SLUG[slug];

  const dateLabel = new Date(`${post.dateModified}T00:00:00Z`).toLocaleDateString(
    'en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' },
  );

  // Three more to read, newest first, never this one.
  const keepReading = getAllPostsMeta()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <Nav />
      <ReadingProgress />
      <main>
        <article>
          <header className={styles.hero}>
            {post.heroImage ? (
              <>
                <Image
                  src={post.heroImage.src}
                  alt={post.heroImage.alt}
                  fill
                  priority
                  sizes="100vw"
                  className={styles.heroImg}
                />
                <div className={styles.heroScrim} aria-hidden="true" />
              </>
            ) : null}
            <div className={styles.heroInner}>
              {post.category ? (
                <div className={styles.badge}>{post.category}</div>
              ) : null}
              <h1 className={styles.h1}>{post.title}</h1>
            </div>
          </header>

          <div className={styles.measure}>
            <Breadcrumbs crumbs={crumbs} />

            <div className={styles.byline}>
              <Image
                src="/logo.webp"
                alt=""
                width={34}
                height={34}
                aria-hidden="true"
                className={styles.bylineMark}
              />
              <div className={styles.bylineText}>
                By{' '}
                <Link href={ALEX_FAHEY.url} className={styles.bylineAuthor}>
                  {ALEX_FAHEY.name}
                </Link>
                , founder of Chop it.
                <br />
                Last updated {dateLabel}.
              </div>
              <div className={styles.readingTime}>
                {article.readingMinutes} min read
              </div>
            </div>

            {article.shortAnswer ? (
              <div className={styles.shortAnswer}>
                <div className={styles.shortAnswerLabel}>Short answer</div>
                <p className={styles.shortAnswerText}>{article.shortAnswer}</p>
              </div>
            ) : null}

            {article.contents.length > 1 ? (
              <nav className={styles.contents} aria-label="On this page">
                <div className={styles.contentsLabel}>On this page</div>
                <ol className={styles.contentsList}>
                  {article.contents.map((entry, index) => (
                    <li key={entry.id} className={styles.contentsItem}>
                      <span className={styles.contentsN} aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <a href={`#${entry.id}`} className={styles.contentsLink}>
                        {entry.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <div className={styles.body}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: MarkdownImage,
                  // The contents links point at these, so the ids have to
                  // match headingSlug exactly rather than whatever the
                  // renderer would default to.
                  h2: ({ children }) => (
                    <h2 id={headingSlug(childrenToText(children))}>{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 id={headingSlug(childrenToText(children))}>{children}</h3>
                  ),
                  // A wide comparison table is the one thing allowed to
                  // scroll sideways; the page body never does.
                  table: ({ children }) => (
                    <div className={styles.tableScroll}>
                      <table>{children}</table>
                    </div>
                  ),
                }}
              >
                {article.body}
              </ReactMarkdown>
            </div>
          </div>

          {faq && faq.length > 0 ? (
            <section className={styles.faqBand} aria-labelledby="faq-h">
              <div className={styles.faqInner}>
                <h2 id="faq-h" className={styles.faqH}>
                  Quick answers
                </h2>
                <ul className={styles.faqList}>
                  {faq.map((entry) => (
                    <li key={entry.question} className={styles.faqItem}>
                      <div className={styles.faqQ}>{entry.question}</div>
                      <div className={styles.faqA}>{entry.answer}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          <BlogCTA />

          {keepReading.length > 0 ? (
            <section className={styles.keepReading} aria-labelledby="keep-reading-h">
              <h2 id="keep-reading-h" className={styles.keepReadingH}>
                Keep reading
              </h2>
              <ul className={styles.keepReadingList}>
                {keepReading.map((p) => (
                  <li key={p.slug} className={styles.keepReadingItem}>
                    <Link href={`/blog/${p.slug}`} className={styles.keepReadingLink}>
                      <div className={styles.keepReadingTitle}>{p.title}</div>
                      <div className={styles.keepReadingDesc}>{p.description}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleLd) }}
      />
      {faq ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildFaqJsonLd(faq)) }}
        />
      ) : null}
      {listedApps ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildAppItemListJsonLd(url, post.title, listedApps)),
          }}
        />
      ) : null}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbLd) }}
      />
      <Footer />
    </>
  );
}
