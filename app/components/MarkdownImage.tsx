// Image renderer for markdown article bodies (blog, learn, research,
// features). ReactMarkdown turns ![alt](src) into this component instead of
// a bare <img>, so every article image ships intrinsic width/height and
// never causes layout shift. Local /public assets go through next/image
// (responsive srcset, lazy by default); anything we cannot size falls back
// to a plain lazy <img> rather than breaking the article.

import Image from 'next/image';

import { getPublicImageDimensions } from '@/app/lib/imageDimensions';

// Article bodies render at ~720px wide; screens/graphics are often 1179px+
// originals, so tell next/image what will actually be displayed.
const SIZES = '(max-width: 760px) 100vw, 720px';

export default function MarkdownImage({
  src,
  alt,
}: {
  src?: string | Blob;
  alt?: string;
}) {
  const url = typeof src === 'string' ? src : '';
  const dims = url ? getPublicImageDimensions(url) : null;

  if (!url) return null;

  if (!dims) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt ?? ''} loading="lazy" decoding="async" style={{ maxWidth: '100%', height: 'auto' }} />;
  }

  // Tall phone screenshots read better constrained; wide graphics fill the
  // column. Both keep their aspect ratio from the intrinsic dimensions.
  const isPortrait = dims.height > dims.width * 1.2;

  return (
    <Image
      src={url}
      alt={alt ?? ''}
      width={dims.width}
      height={dims.height}
      sizes={SIZES}
      style={{
        width: isPortrait ? 'min(100%, 360px)' : '100%',
        height: 'auto',
        borderRadius: 4,
        border: '1px solid var(--line)',
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
}
