import shared from './shared.module.css';
import styles from './WhyChopIt.module.css';

const STATS = [
  {
    value: '66.8%',
    text: 'of Britons have used AI tools for food-related activities.',
  },
  {
    value: '75.9%',
    text: 'would be comfortable with AI-recommended recipes.',
  },
  {
    value: '63%',
    text: 'cook from scratch at least a few times a week.',
  },
];

export function WhyChopIt() {
  return (
    <section id="why" className={shared.section}>
      <div className={shared.shellPadded}>
        <div className={`${shared.eyebrow} ${styles.eyebrow}`}>Why Chop it</div>

        <div className={`${shared.split} ${shared.splitEnd} ${styles.split}`}>
          <h2 className={shared.h2}>A good dinner idea should outlive the chat.</h2>
          <p className={shared.lede}>
            Britons are already using AI for food, but dinner still happens in
            a real kitchen. Chop it keeps the useful ideas and turns them into
            a week you can shop and cook.
          </p>
        </div>

        <div className={styles.stats}>
          {STATS.map((stat) => (
            <div key={stat.value} className={styles.stat}>
              <strong className={styles.statValue}>{stat.value}</strong>
              <span className={styles.statText}>{stat.text}</span>
            </div>
          ))}
        </div>

        <p className={styles.sources}>
          Sources:{' '}
          <a
            href="https://www.askattest.com/blog/research/ai-in-the-kitchen-the-future-of-food-or-recipe-for-disaster"
            target="_blank"
            rel="noopener noreferrer"
          >
            Attest, AI in the food industry (2026)
          </a>{' '}
          and{' '}
          <a
            href="https://yougov.com/en-gb/articles/51613-how-people-in-the-uk-prefer-to-cook-from-scratch-or-meal-kits"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouGov Profiles (2025)
          </a>
          .
        </p>
      </div>
    </section>
  );
}
