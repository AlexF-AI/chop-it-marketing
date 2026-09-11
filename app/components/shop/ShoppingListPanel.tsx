'use client';

import { useMemo, useState } from 'react';

import type { ShoppingLine, ShoppingList } from '@/app/lib/shoppingList';
import styles from './ShoppingListPanel.module.css';

/**
 * The combined shop, as the app shows it.
 *
 * A real merge (lib/shoppingList.ts) grouped into the app's own aisles,
 * laid out the way the app's shopping list is: aisle cards with a
 * done-count, a round tick per line, and the Combined / By recipe switch.
 *
 * Two surfaces render it: the homepage's week, and the /menu builder's
 * live shop for whatever you have picked.
 *
 * Ticking works. Lines the catalogue flags as cupboard staples start
 * ticked, which is what the app does with anything your pantry says you
 * already have — hence "you probably have" rather than a bare count.
 *
 * Rendered on the server first, so the whole list is in the HTML and reads
 * correctly with JS off; only the ticking and the view switch need the
 * client.
 */

type Props = {
  /** The week's combined shop. */
  list: ShoppingList;
  /** The same merge one recipe at a time, in the order shown above. */
  perRecipe: { title: string; list: ShoppingList }[];
};

type Group = { key: string; label: string; lines: ShoppingLine[] };

/**
 * Explains a merge marker.
 *
 * Most merges are across recipes ("wanted by three of them"), but a recipe
 * can also want the same ingredient twice in different units — Marbella
 * asks for red wine vinegar by the spoon for the marinade and by the
 * millilitre for the pan. Saying "wanted by: Marbella" for that reads like
 * a mistake, so the two cases get different wording.
 */
function mergeTitle(line: ShoppingLine): string {
  if (line.fromRecipes.length > 1) {
    return `Wanted by ${line.fromRecipes.length} recipes: ${line.fromRecipes.join(', ')}`;
  }
  return `${line.mergedFrom} separate lines in ${line.fromRecipes[0] ?? 'this recipe'}`;
}

export default function ShoppingListPanel({ list, perRecipe }: Props) {
  const [byRecipe, setByRecipe] = useState(false);
  // Cupboard staples start ticked. Only the lines the reader has changed
  // are stored, so the default can stay a property of the data.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const allLines = useMemo(
    () => list.sections.flatMap((section) => section.lines),
    [list],
  );

  const isDone = (line: ShoppingLine) => toggled[line.key] ?? line.pantryStaple;
  const toggle = (line: ShoppingLine) =>
    setToggled((prev) => ({ ...prev, [line.key]: !(prev[line.key] ?? line.pantryStaple) }));

  const doneCount = allLines.filter(isDone).length;
  const toBuy = allLines.length - doneCount;

  // Both views key their lines the same way, so a tick in one is a tick in
  // the other — as it is in the app. The amounts differ on purpose: by
  // aisle they are the week's, by recipe they are that recipe's.
  const groups: Group[] = useMemo(() => {
    if (!byRecipe) {
      return list.sections.map((s) => ({ key: s.aisle, label: s.label, lines: s.lines }));
    }
    return perRecipe
      .map(({ title, list: own }) => ({
        key: title,
        label: title,
        lines: own.sections.flatMap((s) => s.lines),
      }))
      .filter((g) => g.lines.length > 0);
  }, [byRecipe, list, perRecipe]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Shopping list</span>
        <span className={styles.panelMeta}>
          {toBuy} to buy · {doneCount} you probably have
        </span>
      </div>

      <div className={styles.segmentRow}>
        <div className={styles.segment} role="tablist" aria-label="Group the list by">
          <button
            type="button"
            role="tab"
            aria-selected={!byRecipe}
            className={`${styles.segmentBtn} ${byRecipe ? '' : styles.segmentBtnOn}`}
            onClick={() => setByRecipe(false)}
          >
            Combined
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={byRecipe}
            className={`${styles.segmentBtn} ${byRecipe ? styles.segmentBtnOn : ''}`}
            onClick={() => setByRecipe(true)}
          >
            By recipe
          </button>
        </div>
      </div>

      <div className={styles.listBody}>
        {groups.map((group) => {
          const done = group.lines.filter(isDone).length;
          return (
            <section key={group.key} className={styles.aisle}>
              <div className={styles.aisleHead}>
                <span className={styles.aisleDot} aria-hidden="true" />
                <h4 className={styles.aisleName}>{group.label}</h4>
                <span className={styles.aisleCount}>
                  {done}/{group.lines.length}
                </span>
              </div>

              <ul className={styles.lines}>
                {group.lines.map((line) => {
                  const checked = isDone(line);
                  // One unit reads as a label — "500 g Beef mince". Two do
                  // not: "6 cloves + 6 Garlic" looks like a typo, so those
                  // put the amount after the name instead.
                  const inlineAmount = line.amountParts.length === 1;
                  return (
                    <li key={line.key}>
                      <label className={`${styles.line} ${checked ? styles.lineDone : ''}`}>
                        <input
                          type="checkbox"
                          className={styles.lineInput}
                          checked={checked}
                          onChange={() => toggle(line)}
                        />
                        <span className={styles.tick} aria-hidden="true" />
                        <span className={styles.lineName}>
                          {inlineAmount ? `${line.amount} ` : ''}
                          {line.name}
                          {inlineAmount ? null : (
                            <span className={styles.lineAmount}>{line.amount}</span>
                          )}
                        </span>
                        {line.mergedFrom > 1 ? (
                          <span className={styles.mergeTag} title={mergeTitle(line)}>
                            ×{line.mergedFrom}
                          </span>
                        ) : null}
                        {checked ? <span className={styles.lineState}>Have it</span> : null}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <div className={styles.listFoot}>
        {list.totalIngredientLines > list.totalShoppingLines ? (
          <>
            {list.totalIngredientLines} ingredient lines across the{' '}
            {perRecipe.length} recipes became {list.totalShoppingLines} things to
            buy — {list.totalIngredientLines - list.totalShoppingLines} duplicates
            merged.
          </>
        ) : (
          <>
            {list.totalShoppingLines} things to buy across the {perRecipe.length}{' '}
            recipes.
          </>
        )}{' '}
        Tick anything you already have.
      </div>
    </div>
  );
}
