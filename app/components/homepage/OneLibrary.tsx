import Image from 'next/image';
import shared from './shared.module.css';
import styles from './OneLibrary.module.css';

/** Alt text is empty: the adjacent label already names what each one is. */
const SOURCES = [
  {
    label: 'Ask AI',
    text: 'Start with an idea and turn it into a full recipe.',
    src: '/screens/source-ask-ai.jpeg',
    objectPosition: '50% 62%',
  },
  {
    label: 'Snap a page',
    text: 'Bring cookbook and handwritten recipes into your library.',
    src: '/screens/source-snap-a-page.webp',
    objectPosition: '50% 40%',
  },
  {
    label: 'Paste a link',
    text: 'Rescue recipes from websites, TikTok and Instagram.',
    src: '/screens/source-paste-a-link.webp',
    objectPosition: '58% 50%',
  },
];

export function OneLibrary() {
  return (
    <section id="ai-chef" className={shared.section}>
      <div className={shared.shellPadded}>
        <div className={`${shared.eyebrow} ${styles.eyebrow}`}>One library</div>

        <div className={`${shared.split} ${shared.splitEnd} ${styles.intro}`}>
          <h2 className={shared.h2}>AI recipes meet the ones you already trust.</h2>
          <p className={shared.lede}>
            Save a ChatGPT recipe, photograph a cookbook page or paste a link
            from a website, TikTok or Instagram. Chop it gives each one metric
            quantities, clear ingredients and a method you can actually follow.
          </p>
        </div>

        <div className={`${shared.split} ${shared.splitLibrary}`}>
          <div className={styles.sources}>
            {SOURCES.map((source) => (
              <div key={source.label} className={styles.source}>
                <div className={styles.sourceThumb}>
                  <Image
                    src={source.src}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="96px"
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

          <figure className={shared.figure}>
            <div className={`${shared.frame} ${styles.frame}`}>
              <Image
                src="/screens/app-thread.webp"
                alt="AI Chef finding recipes from a plain-language request"
                fill
                loading="lazy"
                sizes="(max-width: 1000px) 92vw, 44vw"
                className={styles.shot}
              />
            </div>
            <figcaption className={shared.caption}>
              One library, asked in plain words
            </figcaption>
          </figure>
        </div>

        <p className={styles.closing}>
          Everything becomes searchable, plannable and ready to shop.
        </p>
      </div>
    </section>
  );
}
