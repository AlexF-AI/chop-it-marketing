// Unit tests for the shopping-list merge.
//
// This is the logic behind the homepage's "one shop" claim, so the cases
// that matter are the ones a reader would notice being wrong: an ingredient
// two recipes share appearing twice, quantities summed across units that
// cannot be added, or a line vanishing because it had no quantity.
//
// Run with `npm test`.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildShoppingList,
  type CanonicalIngredient,
  type SourceIngredient,
  type SourceRecipe,
} from '../app/lib/shoppingList.ts';
import { shopAisle } from '../app/lib/shopAisles.ts';

const CATALOGUE = new Map<number, CanonicalIngredient>([
  [62, { id: 62, name: 'onion', plural: 'onions', category: 'veg', pantryStaple: false }],
  // Garlic's plural is "garlic bulbs", which is why a line measured in
  // cloves must not take it.
  [65, { id: 65, name: 'garlic', plural: 'garlic bulbs', category: 'veg', pantryStaple: true }],
  [178, { id: 178, name: 'plain flour', plural: null, category: 'carb', pantryStaple: true }],
  [2, { id: 2, name: 'chicken thigh', plural: 'chicken thighs', category: 'protein', pantryStaple: false }],
  [220, { id: 220, name: 'butter', plural: null, category: 'fat', pantryStaple: false }],
]);

function ing(partial: Partial<SourceIngredient>): SourceIngredient {
  return {
    canonicalId: null,
    canonicalName: null,
    name: null,
    display: null,
    qty: null,
    unit: null,
    optional: false,
    section: 'Ingredients',
    ...partial,
  };
}

function lineNamed(list: ReturnType<typeof buildShoppingList>, name: string) {
  return list.sections.flatMap((s) => s.lines).find((l) => l.name === name);
}

describe('buildShoppingList', () => {
  it('merges the same ingredient across recipes into one line', () => {
    const recipes: SourceRecipe[] = [
      { title: 'Katsu', ingredients: [ing({ canonicalId: 62, qty: 1 })] },
      { title: 'Tacos', ingredients: [ing({ canonicalId: 62, qty: 2 })] },
      { title: 'Orzo', ingredients: [ing({ canonicalId: 62, qty: 1 })] },
    ];
    const list = buildShoppingList(recipes, CATALOGUE);
    // Four of them, so the line says "Onions".
    const onion = lineNamed(list, 'Onions');

    assert.ok(onion, 'expected one onion line');
    assert.equal(onion.amount, '4');
    assert.equal(onion.mergedFrom, 3);
    assert.deepEqual(onion.fromRecipes, ['Katsu', 'Tacos', 'Orzo']);
    assert.equal(list.totalIngredientLines, 3);
    assert.equal(list.totalShoppingLines, 1);
  });

  it('sums within a unit', () => {
    const list = buildShoppingList(
      [
        { title: 'A', ingredients: [ing({ canonicalId: 178, qty: 60, unit: 'g' })] },
        { title: 'B', ingredients: [ing({ canonicalId: 178, qty: 400, unit: 'g' })] },
      ],
      CATALOGUE,
    );
    assert.equal(lineNamed(list, 'Plain flour')?.amount, '460 g');
  });

  it('does not invent a conversion between units it cannot add', () => {
    // The real katsu recipe wants both "60 g plain flour" and "1 tbsp plain
    // flour". Adding those needs a density, so the line shows both.
    const list = buildShoppingList(
      [
        {
          title: 'Katsu',
          ingredients: [
            ing({ canonicalId: 178, qty: 60, unit: 'g' }),
            ing({ canonicalId: 178, qty: 1, unit: 'tbsp' }),
          ],
        },
      ],
      CATALOGUE,
    );
    const flour = lineNamed(list, 'Plain flour');
    assert.equal(flour?.amount, '60 g + 1 tbsp');
    assert.equal(flour?.mergedFrom, 2);
  });

  it('keeps an ingredient that carries no quantity', () => {
    const list = buildShoppingList(
      [
        {
          title: 'A',
          ingredients: [ing({ name: 'Fine salt and black pepper', display: 'Fine salt and black pepper' })],
        },
      ],
      CATALOGUE,
    );
    const salt = lineNamed(list, 'Fine salt and black pepper');
    assert.ok(salt, 'an unquantified ingredient must still be on the list');
    assert.equal(salt.amount, '');
  });

  it('rounds away floating-point noise', () => {
    const list = buildShoppingList(
      [
        {
          title: 'A',
          ingredients: [
            ing({ canonicalId: 220, qty: 0.1, unit: 'tbsp' }),
            ing({ canonicalId: 220, qty: 0.2, unit: 'tbsp' }),
          ],
        },
      ],
      CATALOGUE,
    );
    // 0.1 + 0.2 is 0.30000000000000004 in binary floating point.
    assert.equal(lineNamed(list, 'Butter')?.amount, '0.3 tbsp');
  });

  it('renders common fractions as glyphs', () => {
    const list = buildShoppingList(
      [{ title: 'A', ingredients: [ing({ canonicalId: 220, qty: 0.5, unit: 'tsp' })] }],
      CATALOGUE,
    );
    assert.equal(lineNamed(list, 'Butter')?.amount, '½ tsp');
  });

  it('marks a line optional only when every contributing line is', () => {
    const bothOptional = buildShoppingList(
      [
        { title: 'A', ingredients: [ing({ canonicalId: 62, qty: 1, optional: true })] },
        { title: 'B', ingredients: [ing({ canonicalId: 62, qty: 1, optional: true })] },
      ],
      CATALOGUE,
    );
    assert.equal(lineNamed(bothOptional, 'Onions')?.optional, true);

    const mixed = buildShoppingList(
      [
        { title: 'A', ingredients: [ing({ canonicalId: 62, qty: 1, optional: true })] },
        { title: 'B', ingredients: [ing({ canonicalId: 62, qty: 1, optional: false })] },
      ],
      CATALOGUE,
    );
    assert.equal(
      lineNamed(mixed, 'Onions')?.optional,
      false,
      'an ingredient a recipe genuinely needs is not optional',
    );
  });

  it('carries the pantry-staple flag from the catalogue', () => {
    const list = buildShoppingList(
      [
        {
          title: 'A',
          ingredients: [ing({ canonicalId: 65, qty: 3 }), ing({ canonicalId: 62, qty: 1 })],
        },
      ],
      CATALOGUE,
    );
    assert.equal(lineNamed(list, 'Garlic bulbs')?.pantryStaple, true);
    assert.equal(lineNamed(list, 'Onion')?.pantryStaple, false);
    assert.equal(list.pantryStapleLines, 1);
  });

  it('keeps uncatalogued ingredients, matching them by name', () => {
    const list = buildShoppingList(
      [
        { title: 'A', ingredients: [ing({ name: 'Yuzu kosho' })] },
        { title: 'B', ingredients: [ing({ name: 'yuzu kosho' })] },
        { title: 'C', ingredients: [ing({ name: 'Katsuobushi' })] },
      ],
      CATALOGUE,
    );
    assert.equal(lineNamed(list, 'Yuzu kosho')?.mergedFrom, 2, 'name match is case-insensitive');
    assert.ok(lineNamed(list, 'Katsuobushi'), 'a different name stays its own line');
  });

  it('files an ingredient with no canonical entry under Pantry', () => {
    // No canonical id means no category either, so neither the name rules
    // nor the category fallback can place it. It still has to be bought.
    const list = buildShoppingList(
      [{ title: 'A', ingredients: [ing({ name: 'Yuzu kosho' })] }],
      CATALOGUE,
    );
    const section = list.sections.find((s) => s.lines.some((l) => l.name === 'Yuzu kosho'));
    assert.equal(section?.label, 'Pantry');
  });

  it('pluralises a bare count and leaves a measured line singular', () => {
    const counted = buildShoppingList(
      [
        { title: 'A', ingredients: [ing({ canonicalId: 2, qty: 12 })] },
        { title: 'B', ingredients: [ing({ canonicalId: 2, qty: 8 })] },
      ],
      CATALOGUE,
    );
    assert.ok(lineNamed(counted, 'Chicken thighs'), '"20 Chicken thigh" reads like a bug');

    // A weight is one quantity of a thing, not a number of things — the
    // app writes "300g Chicken Thigh" too.
    const weighed = buildShoppingList(
      [{ title: 'A', ingredients: [ing({ canonicalId: 2, qty: 300, unit: 'g' })] }],
      CATALOGUE,
    );
    assert.ok(lineNamed(weighed, 'Chicken thigh'), 'a weighed line stays singular');

    // Garlic's plural is "garlic bulbs", and a line measured in cloves is
    // not asking for bulbs.
    const cloves = buildShoppingList(
      [
        { title: 'A', ingredients: [ing({ canonicalId: 65, qty: 6, unit: 'cloves' })] },
        { title: 'B', ingredients: [ing({ canonicalId: 65, qty: 6 })] },
      ],
      CATALOGUE,
    );
    const garlic = lineNamed(cloves, 'Garlic');
    assert.ok(garlic, 'a line with two units keeps the singular name');
    assert.deepEqual(garlic.amountParts, ['6 cloves', '6']);
  });

  it('drops prep notes from the shopping name but keeps the ingredient', () => {
    const list = buildShoppingList(
      [{ title: 'A', ingredients: [ing({ name: 'cucumber, halved lengthways, thinly sliced' })] }],
      CATALOGUE,
    );
    assert.ok(lineNamed(list, 'Cucumber'), 'the shop wants a cucumber, not the knife work');
  });

  it('orders sections by aisle and puts shared lines first', () => {
    const list = buildShoppingList(
      [
        {
          title: 'A',
          ingredients: [
            ing({ canonicalId: 178, qty: 1, unit: 'g' }),
            ing({ canonicalId: 62, qty: 1 }),
            ing({ canonicalId: 65, qty: 1 }),
          ],
        },
        { title: 'B', ingredients: [ing({ canonicalId: 65, qty: 1 })] },
      ],
      CATALOGUE,
    );
    // SHOP_AISLES order: vegetables come before baking.
    assert.deepEqual(
      list.sections.map((s) => s.aisle),
      ['vegetables', 'baking'],
    );
    assert.deepEqual(
      list.sections.map((s) => s.label),
      ['Vegetables', 'Baking'],
    );
    // Garlic is wanted by both recipes, so it leads its section.
    assert.deepEqual(
      list.sections[0].lines.map((l) => l.name),
      ['Garlic bulbs', 'Onion'],
    );
  });

  it('splits one canonical category across the aisles it is bought in', () => {
    // `protein` holds both of these, but nobody buys burrata at the meat
    // counter. This is the whole reason shopAisle reads the name first.
    const list = buildShoppingList(
      [
        {
          title: 'A',
          ingredients: [ing({ canonicalId: 2, qty: 4 }), ing({ canonicalId: 220, qty: 30, unit: 'g' })],
        },
      ],
      CATALOGUE,
    );
    assert.deepEqual(
      list.sections.map((s) => s.label),
      ['Meat & Fish', 'Dairy & Eggs'],
    );
  });

  it('returns an empty list for no recipes rather than throwing', () => {
    const list = buildShoppingList([], CATALOGUE);
    assert.deepEqual(list.sections, []);
    assert.equal(list.totalIngredientLines, 0);
    assert.equal(list.totalShoppingLines, 0);
  });
});

describe('shopAisle', () => {
  // Each of these is a rule that only earns its place by being wrong
  // without it — the classifier is ordered, and this is the order.
  const cases: [string, string | null, string][] = [
    ['chicken thigh', 'protein', 'meat_and_fish'],
    ['fresh burrata', 'protein', 'dairy_and_eggs'],
    // "chicken stock" is not shopped at the meat counter.
    ['chicken stock', 'flavour', 'pantry'],
    // "butter beans" must not read as butter.
    ['butter beans', 'protein', 'tinned_and_jarred'],
    ['butter', 'fat', 'dairy_and_eggs'],
    // Olives are jarred; olive oil is not.
    ['olive', 'veg', 'tinned_and_jarred'],
    ['extra virgin olive oil', 'fat', 'oils_and_vinegars'],
    // Vinegar beats wine, so the wine rule does not claim it.
    ['red wine vinegar', 'flavour', 'oils_and_vinegars'],
    ['white wine', 'flavour', 'pantry'],
    // Dried leaves are a cupboard spice; fresh ones are a herb.
    ['bay leaf', 'flavour', 'spices_and_seasoning'],
    ['ground coriander', 'flavour', 'spices_and_seasoning'],
    ['coriander', 'flavour', 'herbs'],
    ['chilli flakes', 'flavour', 'spices_and_seasoning'],
    ['red chilli', 'veg', 'vegetables'],
    // Cherry tomatoes are not fruit, whatever a botanist says.
    ['cherry tomato', 'veg', 'vegetables'],
    ['peach', 'veg', 'fruit'],
    // Grains are checked before baking, so this is not flour.
    ['flour tortilla', 'carb', 'pasta_and_grains'],
    ['caster sugar', 'carb', 'baking'],
    ['dijon mustard', 'flavour', 'sauces'],
  ];

  for (const [name, category, expected] of cases) {
    it(`puts ${name} in ${expected}`, () => {
      assert.equal(shopAisle(name, category), expected);
    });
  }

  it('falls back to the canonical category for an unknown name', () => {
    assert.equal(shopAisle('szechuan peppercorn blend', 'flavour'), 'spices_and_seasoning');
  });

  it('falls back to the cupboard when there is no category either', () => {
    assert.equal(shopAisle('something nobody has heard of', null), 'pantry');
  });
});
