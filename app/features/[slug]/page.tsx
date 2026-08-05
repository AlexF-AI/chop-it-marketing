import { notFound } from 'next/navigation';

import { ResourceArticlePage, resourceArticleMetadata } from '@/app/components/ResourcePages';
import { getResource, getResources } from '@/app/lib/resources';

export const dynamicParams = false;

export function generateStaticParams() {
  return getResources('features').map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return resourceArticleMetadata('features', slug);
}

export default async function FeatureArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getResource('features', slug);
  if (!resource) notFound();
  return <ResourceArticlePage resource={resource} />;
}
