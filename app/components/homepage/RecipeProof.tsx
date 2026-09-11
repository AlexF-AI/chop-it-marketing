import Image from 'next/image';
import Link from 'next/link';

import RecipeRail from '@/app/components/RecipeRail';
import { getFeaturedRecipes, RECIPE_COUNT } from '@/app/lib/featuredRecipes';
import shared from './shared.module.css';
import styles from './RecipeProof.module.css';

export const revalidate = 3600;

export default async function RecipeProof() {
  const recipes = await getFeaturedRecipes();

  return (
    <section id="recipes" className={styles.section}>
      <div className={shared.shell}>
        <div className={shared.eyebrow}>Ready before you add a thing</div>
        <h2 className={shared.h2}>
          All {RECIPE_COUNT} built to the same standard.
        </h2>
        <div className={styles.copy}>
          <p className={shared.lede}>
            Every dish you browse was built to a nine-stage standard, from
            the centre of the plate and its cuisine through umami,
            aromatics, plants, acid, texture and a fresh finish.
          </p>
          <p className={shared.lede}>
            Each recipe is checked so its ingredients, method, timings,
            nutrition and food-safety instructions agree. Everything uses
            UK English and metric quantities. Taste has the veto: we add
            flavour before replacing what makes a dish good.
          </p>
          <p className={shared.lede}>
            The average recipe has 5.6 plants and 34g of protein per serving.
          </p>
          <Link href="/method" className={`${shared.link} ${styles.methodLink}`}>
            How we build a Chop it recipe <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Horizontal rail — see components/RecipeRail. */}
      <RecipeRail
        label="Featured recipes"
        eager={2}
        items={recipes.map((recipe) => ({
          href: recipe.href,
          title: recipe.title,
          meta: recipe.meta,
          imageUrl: recipe.imageUrl,
          badge: 'Chef IQ',
        }))}
      />

      <div className={styles.tail}>
        <Link href="/recipes" className={`${shared.link} ${shared.linkPlain}`}>
          Browse all {RECIPE_COUNT} recipes <span aria-hidden="true">→</span>
        </Link>

        <figure className={styles.founder}>
          <div className={styles.founderEyebrow}>Why I built it</div>
          <blockquote className={styles.quote}>
            &ldquo;I was already using ChatGPT to plan meals. The useful
            recipes kept disappearing into old chats while the ones I trusted
            were scattered across books, screenshots and bookmarks. Chop it is
            the place I wanted the whole thing to live.&rdquo;
          </blockquote>
          <figcaption className={styles.attribution}>
            <Image
              src="/logo.webp"
              alt=""
              width={26}
              height={26}
              aria-hidden="true"
              className={styles.founderMark}
            />
            <div>
              <div className={styles.founderName}>Alex</div>
              <div className={styles.founderRole}>Founder, Chop it</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
