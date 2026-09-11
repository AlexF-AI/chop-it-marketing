// "One shop. One place to cook." — the two claims, demonstrated.
//
// Both panels used to be app screenshots. They are now built from
// published recipes at build time: the shopping list is the real merge of
// the four dinners (see lib/shoppingList.ts), and Cook Mode steps through a
// real method. Nothing here is mocked, which is the point — the section
// claims the product combines a week into one list, and now it shows it
// doing that on the actual catalogue.
//
// When the data is unavailable (Supabase unconfigured, or unreachable at
// build time) the section still renders its copy and drops only the two
// panels. The headings and claims are true either way; vanishing a whole
// homepage section on a failed query would be a worse failure than showing
// it without its demonstration.

import Link from 'next/link';

import { getWeekDemo } from '@/app/lib/weekDemo';
import CookModePanel from './CookModePanel';
import shared from './shared.module.css';
import styles from './RecipeToDinner.module.css';

export const revalidate = 3600;

/**
 * Explains a merge marker.
 *
 * Most merges are across recipes ("wanted by three of them"), but a recipe
 * can also want the same ingredient twice in different units — the katsu
 * asks for plain flour by weight for the coating and by the spoon for the
 * sauce. Saying "wanted by: Katsu" for that reads like a mistake, so the
 * two cases get different wording.
 */
function mergeTitle(line: { mergedFrom: number; fromRecipes: string[] }): string {
  if (line.fromRecipes.length > 1) {
    return `Wanted by ${line.fromRecipes.length} recipes: ${line.fromRecipes.join(', ')}`;
  }
  return `${line.mergedFrom} separate lines in ${line.fromRecipes[0] ?? 'this recipe'}`;
}

export default async function RecipeToDinner() {
  const demo = await getWeekDemo();
  const recipes = demo?.recipes ?? [];
  const shoppingList = demo?.shoppingList ?? null;
  const saved = shoppingList
    ? shoppingList.totalIngredientLines - shoppingList.totalShoppingLines
    : 0;

  // The longest method makes the better demo — a three-step recipe doesn't
  // show what Cook Mode is for.
  const cookRecipe =
    recipes.length > 0
      ? recipes.reduce((best, r) => (r.steps.length > best.steps.length ? r : best))
      : null;

  return (
    <section id="how" className={shared.section}>
      <div className={shared.shell}>
        <div className={shared.eyebrow}>From plan to dinner</div>
        <h2 className={shared.h2}>One shop. One place to cook.</h2>
        <p className={shared.lede}>
          {shoppingList
            ? `Both panels below are live. The list is the real combined shop for the ${recipes.length} dinners above, and the method is the real one you would cook from.`
            : 'Pick the week, and the shop writes itself.'}
        </p>

        <div className={styles.steps}>
          <div>
            {shoppingList ? (
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <span className={styles.panelTitle}>Shopping list</span>
                <span className={styles.panelMeta}>
                  {shoppingList.totalShoppingLines} lines from {recipes.length} dinners
                </span>
              </div>

              <div className={styles.listBody}>
                {shoppingList.sections.map((section) => (
                  <div key={section.category}>
                    <div className={styles.sectionLabel}>{section.label}</div>
                    {section.lines.map((line) => (
                      <div key={line.key} className={styles.line}>
                        <span className={styles.lineName}>{line.name}</span>
                        {line.pantryStaple ? (
                          <span
                            className={styles.staple}
                            title="A cupboard staple — you probably have this already"
                          >
                            Cupboard
                          </span>
                        ) : null}
                        {line.mergedFrom > 1 ? (
                          <span className={styles.mergeTag} title={mergeTitle(line)}>
                            ×{line.mergedFrom}
                          </span>
                        ) : null}
                        <span className={styles.lineAmount}>{line.amount}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className={styles.listFoot}>
                {saved > 0 ? (
                  <>
                    {shoppingList.totalIngredientLines} ingredient lines across the{' '}
                    {recipes.length} recipes became {shoppingList.totalShoppingLines}{' '}
                    things to buy — {saved} duplicate{saved === 1 ? '' : 's'} merged.
                  </>
                ) : (
                  <>
                    {shoppingList.totalShoppingLines} things to buy across the{' '}
                    {recipes.length} recipes.
                  </>
                )}
                {shoppingList.pantryStapleLines > 0 ? (
                  <> {shoppingList.pantryStapleLines} are cupboard staples you probably already have.</>
                ) : null}
              </div>
            </div>
            ) : null}

            <div className={styles.copy}>
              <span className={styles.numeral} aria-hidden="true">
                i
              </span>
              <div>
                <div className={styles.label}>Shop once</div>
                <div className={styles.text}>
                  Every ingredient becomes one list, combined by section and
                  checked against what you already have. Send it to your basket
                  through Whisk when you are ready to buy.
                </div>
              </div>
            </div>
          </div>

          <div>
            {cookRecipe ? <CookModePanel recipe={cookRecipe} /> : null}

            <div className={styles.copy}>
              <span className={styles.numeral} aria-hidden="true">
                ii
              </span>
              <div>
                <div className={styles.label}>Cook from the same place</div>
                <div className={styles.text}>
                  Open each meal in Cook Mode for clear ingredients, steps and
                  timers. Tick meals off as the week moves.{' '}
                  {cookRecipe ? (
                    <Link href={`/recipes/${cookRecipe.slug}`} className={shared.link}>
                      See the full recipe
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
