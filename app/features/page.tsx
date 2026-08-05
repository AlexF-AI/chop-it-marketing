import { ResourceIndexPage, resourceIndexMetadata } from '@/app/components/ResourcePages';

export const metadata = resourceIndexMetadata('features');

export default function FeaturesIndex() {
  return <ResourceIndexPage section="features" />;
}
