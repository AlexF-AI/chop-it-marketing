import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import BlogCTA from '@/app/components/BlogCTA';
import Breadcrumbs, { type Crumb } from '@/app/components/Breadcrumbs';
import Footer from '@/app/components/Footer';
import Nav from '@/app/components/Nav';
import SummerSaladsArticle from '@/app/components/SummerSaladsArticle';
import { ALEX_FAHEY } from '@/app/lib/authors';
import { BLOG_AUTHOR, getAllPostsMeta, getPostBody, getPostMeta } from '@/app/lib/blog';
import { isoDuration } from '@/app/lib/iso';
import { getMenuRecipesFull, type FullMenuRecipe } from '@/app/lib/menuRecipes';
import { buildBreadcrumbJsonLd, serializeJsonLd, SITE_ORIGIN } from '@/app/lib/recipeSchema';

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
        author: { '@type': 'Organization', name: BLOG_AUTHOR, url: SITE_ORIGIN },
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
      ? { '@type': 'Organization', name: BLOG_AUTHOR, url: SITE_ORIGIN }
      : {
          '@type': 'Person',
          '@id': `${ALEX_FAHEY.url}#person`,
          name: ALEX_FAHEY.name,
          url: ALEX_FAHEY.url,
        },
    publisher: {
      '@type': 'Organization',
      name: BLOG_AUTHOR,
      url: SITE_ORIGIN,
      logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/logo.webp` },
    },
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

  const body = getPostBody(slug);

  return (
    <>
      <Nav />
      <main>
        <article className="blog-article">
          <Breadcrumbs crumbs={crumbs} />
          <div className="blog-article-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
          </div>
          <BlogCTA />
        </article>
      </main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleLd) }}
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
