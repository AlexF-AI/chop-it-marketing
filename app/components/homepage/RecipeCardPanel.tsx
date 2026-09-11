'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import type { WeekRecipe } from '@/app/lib/weekDemo';
import styles from './RecipeToDinner.module.css';

/**
 * A recipe, open — the card the app opens when you tap a dish.
 *
 * Photo, title, the time / servings / ingredient-count line, and the
 * Method / Ingredients / Macros tabs. Everything on it is the published
 * recipe: the steps are its `method_steps_json`, the lines are its
 * `ingredients_json`, and the macros are the per-serving figures on the
 * row. This replaced a screenshot of the same screen.
 *
 * Method is rendered on the server, so the card says something real before
 * hydration and with JS off; only the tab switch needs the client.
 */

type Tab = 'method' | 'ingredients' | 'macros';

const TABS: { id: Tab; label: string }[] = [
  { id: 'method', label: 'Method' },
  { id: 'ingredients', label: 'Ingredients' },
  { id: 'macros', label: 'Macros' },
];

/** "652 kcal" / "53 g". Rounded — nobody shops to a decimal gram. */
function macro(value: number | null, unit: string): string | null {
  if (value === null || !Number.isFinite(value)) return null;
  return `${Math.round(value)}${unit}`;
}

export default function RecipeCardPanel({ recipe }: { recipe: WeekRecipe }) {
  const [tab, setTab] = useState<Tab>('method');

  const meta = [
    recipe.totalMinutes ? `${recipe.totalMinutes}M` : null,
    recipe.servings ? `Serves ${recipe.servings}` : null,
    recipe.ingredients.length > 0 ? `${recipe.ingredients.length} ingredients` : null,
  ].filter(Boolean);

  const macros = [
    { label: 'Calories', value: macro(recipe.nutrition.kcal, ' kcal') },
    { label: 'Protein', value: macro(recipe.nutrition.proteinG, 'g') },
    { label: 'Carbs', value: macro(recipe.nutrition.carbsG, 'g') },
    { label: 'Fat', value: macro(recipe.nutrition.fatG, 'g') },
    { label: 'Fibre', value: macro(recipe.nutrition.fibreG, 'g') },
  ].filter((m): m is { label: string; value: string } => m.value !== null);

  return (
    <div className={styles.panel}>
      <div className={styles.cardHero}>
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            sizes="(min-width: 768px) 560px, 100vw"
            className={styles.cardHeroImg}
          />
        ) : null}
        {/* The app's Chef IQ mark: this recipe was built to the standard. */}
        <span className={styles.iqBadge}>IQ</span>
      </div>

      <div className={styles.cardHead}>
        <h3 className={styles.cardTitle}>{recipe.title}</h3>
        {meta.length > 0 ? (
          <div className={styles.cardMeta}>{meta.join(' · ')}</div>
        ) : null}

        <div className={styles.cardActions}>
          {/* State, not a control: it is in the week shown above. */}
          <span className={styles.cardPill}>
            <span aria-hidden="true">✓</span> In this week
          </span>
          <Link href="/menu" className={`${styles.cardPill} ${styles.cardPillLink}`}>
            Add to collection
          </Link>
        </div>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Recipe">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`recipe-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`recipe-panel-${t.id}`}
            className={`${styles.tab} ${tab === t.id ? styles.tabOn : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        className={styles.cardBody}
        role="tabpanel"
        id={`recipe-panel-${tab}`}
        aria-labelledby={`recipe-tab-${tab}`}
      >
        {tab === 'method' ? (
          <>
            <div className={styles.cardBodyLabel}>Method</div>
            <ol className={styles.steps2}>
              {recipe.steps.map((step, i) => (
                <li key={step.slice(0, 24) + i} className={styles.step2}>
                  <span className={styles.stepN2} aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className={styles.stepText2}>{step}</span>
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {tab === 'ingredients' ? (
          <>
            <div className={styles.cardBodyLabel}>Ingredients</div>
            <ul className={styles.ingredients}>
              {recipe.ingredients.map((ing, i) => (
                <li key={ing.text + i} className={styles.ingredient}>
                  <span className={styles.ingredientText}>{ing.text}</span>
                  {ing.pantryStaple ? (
                    <span
                      className={styles.ingredientMark}
                      title="A cupboard staple — you probably have this already"
                    >
                      Cupboard
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {tab === 'macros' ? (
          <>
            <div className={styles.cardBodyLabel}>Per serving</div>
            <dl className={styles.macros}>
              {macros.map((m) => (
                <div key={m.label} className={styles.macro}>
                  <dt className={styles.macroLabel}>{m.label}</dt>
                  <dd className={styles.macroValue}>{m.value}</dd>
                </div>
              ))}
            </dl>
            <p className={styles.macroNote}>
              Checked against the ingredients and the method, not estimated
              from the title.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
