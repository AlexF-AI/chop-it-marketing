import shared from './shared.module.css';
import styles from './WhyChopIt.module.css';

const STEPS = [
  { n: '01', label: 'Ask', text: 'Start in ChatGPT or AI Chef.' },
  { n: '02', label: 'Keep', text: 'Save the useful answer.' },
  { n: '03', label: 'Plan', text: 'Put it into the week.' },
  { n: '04', label: 'Shop', text: 'Combine every ingredient.' },
  { n: '05', label: 'Cook', text: 'Follow it from the same library.' },
];

export function WhyChopIt() {
  return (
    <section id="why" className={shared.section}>
      <div className={shared.shellPadded}>
        <div className={`${shared.eyebrow} ${styles.eyebrow}`}>Why Chop it</div>

        <div className={`${shared.split} ${shared.splitEnd} ${styles.split}`}>
          <h2 className={shared.h2}>A good dinner idea should outlive the chat.</h2>
          <p className={shared.lede}>
            Chop it keeps what AI creates, puts it beside the recipes you
            already trust and turns the whole lot into a week you can shop and
            cook.
          </p>
        </div>

        <div className={`${shared.rail} ${styles.steps}`}>
          {STEPS.map((step) => (
            <div key={step.n} className={styles.step}>
              <span className={styles.stepNumber}>{step.n}</span>
              <span className={styles.stepLabel}>{step.label}</span>
              <span className={styles.stepText}>{step.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
