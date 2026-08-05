import { ResourceIndexPage, resourceIndexMetadata } from '@/app/components/ResourcePages';

export const metadata = resourceIndexMetadata('research');

export default function ResearchIndex() {
  return <ResourceIndexPage section="research" />;
}
