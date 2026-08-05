import { ResourceIndexPage, resourceIndexMetadata } from '@/app/components/ResourcePages';

export const metadata = resourceIndexMetadata('learn');

export default function LearnIndex() {
  return <ResourceIndexPage section="learn" />;
}
