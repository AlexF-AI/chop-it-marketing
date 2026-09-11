// "One shop. One place to cook." — the two claims, demonstrated.
//
// Both panels used to be app screenshots. They are now built from
// published recipes at build time: the shopping list is the real merge of
// the four dinners (see lib/shoppingList.ts), grouped into the app's own
// aisles, and the recipe card is a real published recipe with its real
// method, ingredients and macros. Nothing here is mocked, which is the
// point — the section claims the product combines a week into one list and
// gives you one place to cook from, and now it shows both happening on the
// actual catalogue.
//
// When the data is unavailable (Supabase unconfigured, or unreachable at
// build time) the section still renders its copy and drops only the two
// panels. The headings and claims are true either way; vanishing a whole
// homepage section on a failed query would be a worse failure than showing
// it without its demonstration.

import Link from 'next/link';

import { getWeekDemo } from '@/app/lib/weekDemo';
import RecipeCardPanel from './RecipeCardPanel';
import ShoppingListPanel from '@/app/components/shop/ShoppingListPanel';
import shared from './shared.module.css';
import styles from './RecipeToDinner.module.css';

export const revalidate = 3600;

export default async function RecipeToDinner() {
  const demo = await getWeekDemo();
  const recipes = demo?.recipes ?? [];
  const shoppingList = demo?.shoppingList ?? null;

  // The first dinner of the week (app/lib/theWeek.ts), so the card opens on
  // the dish the rail above leads with.
  const cardRecipe = recipes[0] ?? null;

  return (
    <section id="how" className={shared.section}>
      <div className={shared.shell}>
        <div className={shared.eyebrow}>From plan to dinner</div>
        <h2 className={shared.h2}>One shop. One place to cook.</h2>
        <p className={shared.lede}>
          {shoppingList
            ? `Both panels below are live. The list is the real combined shop for the ${recipes.length} dinners above, and the card is the recipe you would cook from.`
            : 'Pick the week, and the shop writes itself.'}
        </p>

        <div className={styles.steps}>
          <div>
            {shoppingList ? (
              <ShoppingListPanel list={shoppingList} perRecipe={demo?.perRecipe ?? []} />
            ) : null}

            <div className={styles.copy}>
              <span className={styles.numeral} aria-hidden="true">
                i
              </span>
              <div>
                <div className={styles.label}>Shop once</div>
                <div className={styles.text}>
                  Every ingredient becomes one list, grouped by aisle and
                  checked against what you already have. Send it to your basket
                  through Whisk when you are ready to buy.
                </div>
              </div>
            </div>
          </div>

          <div>
            {cardRecipe ? <RecipeCardPanel recipe={cardRecipe} /> : null}

            <div className={styles.copy}>
              <span className={styles.numeral} aria-hidden="true">
                ii
              </span>
              <div>
                <div className={styles.label}>Cook from the same place</div>
                <div className={styles.text}>
                  Open each meal for its method, ingredients and macros in one
                  card, and tick meals off as the week moves.{' '}
                  {cardRecipe ? (
                    <Link href={`/recipes/${cardRecipe.slug}`} className={shared.link}>
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
