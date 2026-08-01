import Image from 'next/image';
import { chatgptSection } from '@/app/lib/chatgpt';
import { APP_STORE_URL, CHATGPT_URL } from '@/app/lib/app-stores';
import shared from './shared.module.css';
import styles from './InChatGPT.module.css';

export function InChatGPT() {
  const { liveNow, comingSoon, showComingSoon, pluginShot, pluginCaption } =
    chatgptSection;

  return (
    <section id="chatgpt" className={styles.section}>
      <div className={`${shared.split} ${shared.splitChatgpt} ${styles.inner}`}>
        <div>
          <div className={styles.eyebrow}>Chop it in ChatGPT</div>
          <h2 className={`${shared.h2} ${styles.h2}`}>
            Keep using the AI you already use.
          </h2>
          <p className={styles.body}>
            Add the free Chop it plug-in to ChatGPT to search Chop it recipes,
            create or import something new, plan a week and build the shop. Open
            anything you want to keep in the iPhone app.
          </p>
          <a href={CHATGPT_URL} className={styles.cta}>
            Use Chop it in ChatGPT
          </a>

          <div className={styles.statusBlocks}>
            <div>
              <div className={styles.statusHeader}>
                <span className={styles.markLive} />
                <span className={styles.statusLabel}>Live now</span>
              </div>
              <div className={styles.rows}>
                {liveNow.map((text) => (
                  <div key={text} className={styles.row}>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {showComingSoon ? (
              <div>
                <div className={styles.statusHeader}>
                  <span className={styles.markSoon} />
                  <span
                    className={`${styles.statusLabel} ${styles.statusLabelSoon}`}
                  >
                    Coming soon
                  </span>
                </div>
                <div className={styles.rows}>
                  {comingSoon.map((text) => (
                    <div
                      key={text}
                      className={`${styles.row} ${styles.rowSoon}`}
                    >
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.shots}>
          {pluginShot ? (
            <figure className={shared.figure}>
              <div className={styles.pluginFrame}>
                <Image
                  src={pluginShot.src}
                  alt={pluginShot.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1000px) 92vw, 42vw"
                  className={styles.pluginShot}
                />
              </div>
              <figcaption className={styles.shotCaption}>
                {pluginCaption}
              </figcaption>
            </figure>
          ) : null}

          <figure className={shared.figure}>
            <div className={styles.directoryFrame}>
              <Image
                src="/screens/chatgpt-plugins-directory.jpeg"
                alt="Searching Plugins in ChatGPT for Chop it"
                width={1178}
                height={1229}
                loading="lazy"
                sizes="(max-width: 1000px) 92vw, 42vw"
                className={styles.directoryShot}
              />
            </div>
            <figcaption className={styles.shotCaption}>
              Plugins, search “Chop it”, enable
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
