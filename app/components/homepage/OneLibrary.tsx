import Image from 'next/image';
import shared from './shared.module.css';
import styles from './OneLibrary.module.css';

/** Alt text is empty: the adjacent label already names what each one is. */
const SOURCES = [
  {
    label: 'Paste a link',
    text: 'Save recipes from anywhere online, including TikTok and Instagram.',
    src: '/screens/source-paste-a-link.webp',
    objectPosition: '58% 50%',
  },
  {
    label: 'Snap a page',
    text: 'Photograph a cookbook page or a handwritten card and keep it for good.',
    src: '/screens/source-snap-a-page.webp',
    objectPosition: '50% 40%',
  },
  {
    label: 'Ask AI',
    text: 'Start with an idea and turn it into a full recipe.',
    src: '/screens/source-ask-ai.jpeg',
    objectPosition: '50% 62%',
  },
  {
    label: 'Scan your shop',
    text: 'Photograph a veg box or food shop and add it straight to your pantry.',
    src: '/screens/source-scan-your-shop.webp',
    objectPosition: '50% 50%',
  },
  {
    label: 'Snap a dish',
    text: 'Turn a restaurant dish into a recipe you can cook at home.',
    src: '/screens/source-snap-a-dish.webp',
    objectPosition: '50% 50%',
  },
];

export function OneLibrary() {
  return (
    <section
      id="ai-chef"
      className={`${shared.sectionBand} ${shared.bandWarm}`}
    >
      <div className={shared.shell}>
        <div className={shared.eyebrow}>Your recipes too</div>

        <h2 className={shared.h2}>
          The recipes you already love, alongside ours.
        </h2>
        <p className={shared.lede}>
          Save the recipes you love from anywhere online, or snap them
          straight from a cookbook, and they sit alongside our dishes, ready
          to plan. Recreate a restaurant dish, or scan a food shop into your
          pantry. Chop it turns every one into metric quantities, clear
          ingredients and a method you can actually follow.
        </p>

        <div className={styles.sources}>
          {SOURCES.map((source) => (
            <div key={source.label} className={styles.source}>
              <div className={styles.sourceThumb}>
                <Image
                  src={source.src}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="72px"
                  className={styles.sourceThumbImage}
                  style={{ objectPosition: source.objectPosition }}
                />
              </div>
              <div className={styles.sourceCopy}>
                <span className={styles.sourceLabel}>{source.label}</span>
                <span className={styles.sourceText}>{source.text}</span>
              </div>
            </div>
          ))}
        </div>

        <p className={shared.closer}>
          Everything becomes searchable, plannable and ready to shop.
        </p>
      </div>
    </section>
  );
}
