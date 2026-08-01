import Image from 'next/image';
import { getFeaturedRecipes, RECIPE_COUNT } from '@/app/lib/featuredRecipes';
import Link from 'next/link';
import shared from './shared.module.css';
import styles from './RecipeProof.module.css';

export const revalidate = 3600;

export default async function RecipeProof() {
  const recipes = await getFeaturedRecipes();

  return (
    <section id="recipes" className={styles.section}>
      <div className={shared.shell}>
        <div className={`${shared.eyebrow} ${styles.eyebrow}`}>
          Ready before you add a thing
        </div>
        <div className={`${shared.split} ${shared.splitEnd} ${styles.intro}`}>
          <h2 className={shared.h2}>
            Start with {RECIPE_COUNT} recipes. Add everything else.
          </h2>
          <p className={shared.lede}>
            Chop it comes with a full dinner library built for UK kitchens:
            metric quantities, clear methods and useful nutrition. The average
            recipe has 5.6 plants and 34g of protein per serving.
          </p>
        </div>
      </div>

      <div className={`${shared.rail} ${styles.rail}`}>
        {recipes.map((recipe, index) => (
          <Link
            key={recipe.href}
            href={recipe.href}
            className={styles.card}
          >
            <div className={styles.cardImage}>
              {recipe.imageUrl ? (
                <Image
                  src={recipe.imageUrl}
                  alt=""
                  fill
                  loading={index < 2 ? 'eager' : 'lazy'}
                  sizes="(max-width: 640px) 60vw, 300px"
                />
              ) : null}
              <span className={styles.badge}>AI Chef</span>
            </div>
            <div className={styles.cardTitle}>{recipe.title}</div>
            <div className={styles.cardMeta}>{recipe.meta}</div>
          </Link>
        ))}
      </div>

      <div className={styles.tail}>
        <Link href="/recipes" className={styles.browse}>
          Browse all {RECIPE_COUNT} recipes <span aria-hidden="true">→</span>
        </Link>

        <div className={styles.founder}>
          <span className={styles.founderRule} />
          <div className={styles.founderEyebrow}>Why I built it</div>
          <blockquote className={styles.quote}>
            “I was already using ChatGPT to plan meals. The useful recipes kept
            disappearing into old chats while the ones I trusted were scattered
            across books, screenshots and bookmarks. Chop it is the place I
            wanted the whole thing to live.”
          </blockquote>
          <div className={styles.founderName}>Alex</div>
          <div className={styles.founderRole}>Founder, Chop it</div>
        </div>
      </div>
    </section>
  );
}
