import Image from 'next/image';
import shared from './shared.module.css';
import styles from './RecipeToDinner.module.css';

const STEPS = [
  {
    numeral: 'i',
    label: 'Shop once',
    text: 'Every ingredient becomes one list, combined by aisle and checked against what you already have. Send it to your basket through Whisk when you are ready to buy.',
    src: '/screens/shop-once.webp',
    alt: 'Chop it shopping list with ingredients from several recipes combined into one line each and grouped by supermarket aisle',
  },
  {
    numeral: 'ii',
    label: 'Cook from the same place',
    text: 'Open each meal in Cook Mode for clear ingredients, steps and timers. Tick meals off as the week moves.',
    src: '/screens/cook-mode.webp',
    alt: 'Chop it Cook Mode part way through a recipe, showing the current step alongside its ingredients and a timer',
  },
];

export function RecipeToDinner() {
  return (
    <section id="how" className={shared.section}>
      <div className={shared.shell}>
        <div className={shared.eyebrow}>From plan to dinner</div>
        <h2 className={shared.h2}>One shop. One place to cook.</h2>

        <div className={styles.steps}>
          {STEPS.map((step) => (
            <div key={step.label}>
              <div className={styles.shot}>
                <Image
                  src={step.src}
                  alt={step.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 560px"
                  className={styles.shotImg}
                />
              </div>
              <div className={styles.copy}>
                <span className={styles.numeral} aria-hidden="true">
                  {step.numeral}
                </span>
                <div>
                  <div className={styles.label}>{step.label}</div>
                  <div className={styles.text}>{step.text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
