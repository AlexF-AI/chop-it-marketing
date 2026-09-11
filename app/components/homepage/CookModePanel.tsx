'use client';

import { useState } from 'react';

import type { WeekRecipe } from '@/app/lib/weekDemo';
import styles from './RecipeToDinner.module.css';

/**
 * Cook Mode, running.
 *
 * Steps through a real published recipe's method with its ingredients
 * underneath. This replaced a screenshot of the same screen — the steps
 * here are the recipe's actual `method_steps_json`, so what a reader steps
 * through is what they would cook.
 *
 * The first step is rendered on the server, so the panel says something
 * real before hydration and with JS off; only the stepping needs the
 * client.
 */
export default function CookModePanel({ recipe }: { recipe: WeekRecipe }) {
  const [index, setIndex] = useState(0);
  const total = recipe.steps.length;
  const atStart = index === 0;
  const atEnd = index >= total - 1;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Cook mode</span>
        <span className={styles.panelMeta}>
          Step {index + 1} of {total}
        </span>
      </div>

      <div className={styles.cookBody}>
        <div className={styles.cookRecipe}>{recipe.title}</div>

        <div className={styles.cookTrack} aria-hidden="true">
          {recipe.steps.map((step, i) => (
            <span
              key={step.slice(0, 24) + i}
              className={`${styles.cookTick} ${i <= index ? styles.cookTickOn : ''}`}
            />
          ))}
        </div>

        {/* aria-live so a screen reader hears the new step on advance
            rather than silently losing its place. */}
        <p className={styles.cookStep} aria-live="polite">
          <span className={styles.cookStepN}>Step {index + 1}</span>
          {recipe.steps[index]}
        </p>

        <div className={styles.cookNav}>
          <button
            type="button"
            className={styles.cookBtn}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={atStart}
          >
            Back
          </button>
          <button
            type="button"
            className={`${styles.cookBtn} ${styles.cookBtnPrimary}`}
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
            disabled={atEnd}
          >
            {atEnd ? 'Done' : 'Next step'}
          </button>
        </div>

        {recipe.ingredientLines.length > 0 ? (
          <div className={styles.cookIngredients}>
            <div className={styles.cookIngredientsLabel}>
              What you need · {recipe.ingredientLines.length} ingredients
            </div>
            <ul className={styles.cookIngredientsList}>
              {recipe.ingredientLines.slice(0, 12).map((line, i) => (
                <li key={line + i} className={styles.cookIngredient}>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
