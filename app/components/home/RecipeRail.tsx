import Image from 'next/image';
import Link from 'next/link';

import { supabase, supabaseConfigured } from '@/app/lib/supabase';

export const revalidate = 3600;

type RailRecipe = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  meta: string;
};

// Shown when Supabase isn't configured for the environment (preview builds,
// local checkouts without env vars) so the rail never renders empty.
const FALLBACK: RailRecipe[] = [
  { id: 'f1', slug: 'chicken-sweetcorn-fried-rice', title: 'Chicken and sweetcorn fried rice', image_url: null, meta: '22 MIN · SERVES 4' },
  { id: 'f2', slug: 'charred-broccoli-tahini-butter-beans', title: 'Charred broccoli, tahini, butter beans', image_url: null, meta: '25 MIN · SERVES 2' },
  { id: 'f3', slug: 'miso-glazed-salmon-soba', title: 'Miso-glazed salmon, soba', image_url: null, meta: '22 MIN · SERVES 2' },
  { id: 'f4', slug: 'crispy-gnocchi-brown-butter-sage', title: 'Crispy gnocchi, brown butter sage', image_url: null, meta: '18 MIN · SERVES 2' },
  { id: 'f5', slug: 'harissa-butter-beans-whipped-feta', title: 'Harissa butter beans, whipped feta', image_url: null, meta: '20 MIN · 34G PROTEIN' },
  { id: 'f6', slug: 'lamb-koftas-cucumber-mint', title: 'Lamb koftas, cucumber and mint', image_url: null, meta: '28 MIN · SERVES 4' },
];

type Row = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  servings: number | null;
  timings_json: { total_minutes?: number | null } | null;
  nutrition_protein_g: number | null;
};

// Meta line under each card: minutes first, then whichever of servings or
// protein the row actually carries. Anything missing is dropped rather than
// printed as a zero.
function metaFor(r: Row): string {
  const bits: string[] = [];
  const mins = r.timings_json?.total_minutes;
  if (mins) bits.push(`${mins} MIN`);
  if (r.servings) bits.push(`SERVES ${r.servings}`);
  if (r.nutrition_protein_g) bits.push(`${Math.round(r.nutrition_protein_g)}G PROTEIN`);
  return bits.join(' · ');
}

async function getRailRecipes(): Promise<RailRecipe[]> {
  if (!supabase || !supabaseConfigured) {
    console.warn('[RecipeRail] Supabase env missing — using fallback rail');
    return FALLBACK;
  }
  const { data, error } = await supabase
    .from('recipes_published')
    .select('id, slug, title, image_url, servings, timings_json, nutrition_protein_g')
    .not('image_url', 'is', null)
    .not('slug', 'is', null)
    .order('display_priority', { ascending: false })
    .limit(10);

  if (error || !data || data.length === 0) {
    if (error) console.warn('[RecipeRail] query error, using fallback:', error.message);
    return FALLBACK;
  }
  return (data as Row[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    image_url: r.image_url,
    meta: metaFor(r),
  }));
}

export default async function RecipeRail() {
  const recipes = await getRailRecipes();

  return (
    <section id="recipes" className="hp-band" style={{ padding: 'clamp(56px,7vw,104px) 0 clamp(56px,7vw,100px)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        <div className="rail-head">
          <div style={{ maxWidth: '34ch' }}>
            <div className="eyebrow" style={{ marginBottom: 20 }}>
              — Already in the app
            </div>
            <h2 className="hp-h2 hp-h2-lg">Over 1,000 recipes, written before you arrive.</h2>
          </div>
          <div style={{ maxWidth: '46ch' }}>
            <p className="hp-lede" style={{ marginBottom: 18 }}>
              AI Chef wrote all 1,035 to a nine-stage standard, the way a chef builds a plate from
              scratch: protein and its plant pairing chosen together, a named umami base, two
              plants at full weight, acid matched to the cuisine, and something with crunch to
              break it up.
            </p>
            <p className="hp-lede" style={{ marginBottom: 20 }}>
              The average Chop it recipe reaches 5.6 plants and 34g of protein a serving.
            </p>
            <Link className="hp-link" href="/method">
              How we build a Chop it recipe →
            </Link>
          </div>
        </div>
      </div>

      <div className="rail">
        {recipes.map((r) => (
          <Link className="rail-item" href={`/recipes/${r.slug}`} key={r.id}>
            <div className="rail-item-img">
              {r.image_url ? (
                <Image
                  src={r.image_url}
                  alt={r.title}
                  width={580}
                  height={725}
                  sizes="(max-width: 720px) 60vw, 290px"
                />
              ) : null}
            </div>
            <div className="rail-item-title">{r.title}</div>
            {r.meta && <div className="rail-item-meta">{r.meta}</div>}
          </Link>
        ))}
      </div>

      <div className="rail-foot">
        <span className="meta-line">
          1,035 recipes · 5.6 plants and 34g protein a serving on average · yours join them
        </span>
        <Link className="hp-link" href="/recipes">
          Browse the recipes →
        </Link>
      </div>
    </section>
  );
}
