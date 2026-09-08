# Aligning chop-it.com and chopit.app as one entity

## The problem

One company publishes on two domains:

- **chop-it.com** — this repository. Marketing site, blog, recipes, resources.
- **chopit.app** — separate repository. The web app.

Both are fully indexable, both title themselves "Chop it", and search engines
pick **chopit.app** for the brand term. That choice is reasonable — `chopit`
matches the spoken name where `chop-it` does not, and the app is where people
land and stay — and it is fine for the business: a brand searcher who reaches
the product beats one who reaches a marketing page.

What is *not* fine is that the two domains do not describe each other, so a
crawler has no basis for treating them as one entity rather than two sites
that happen to share a name. Authority earned by either accrues to neither.

Observed 2026-09-07:

- chopit.app serves `index, follow`, its own sitemap, and its own JSON-LD.
- chopit.app contains **zero** links back to chop-it.com.
- chop-it.com contained **no visible link to chopit.app at all** — only a
  `sameAs`, a terms-page mention, and the `/m/[code]` deep-link base.

## What chop-it.com now emits

`app/lib/entity.ts` is the single source of the entity graph. Before it, this
site published three anonymous `Organization` nodes under two different names
("Chop it" in the layout and recipe author, "Chop It AI Ltd" in the homepage
`MobileApplication` author), none carrying an `@id`. A crawler had to infer
identity from matching `url` strings, and the differing names worked against
even that.

Now there is exactly one:

```json
{
  "@type": "Organization",
  "@id": "https://chop-it.com/#organization",
  "name": "Chop it",
  "legalName": "Chop It AI Ltd",
  "url": "https://chop-it.com",
  "logo": { "@type": "ImageObject", "url": "https://chop-it.com/logo.webp" },
  "sameAs": [
    "https://chopit.app",
    "https://apps.apple.com/gb/app/chop-it/id6762079343",
    "https://www.tiktok.com/@chop_it"
  ]
}
```

Every other node — `WebSite`, `MobileApplication`, `BlogPosting`, `Article`,
`Recipe`, the author's `worksFor` — references it by `@id` instead of inlining
a fresh copy. Verify after any schema change:

```bash
npm run build
grep -rho '{"@type":"Organization"[^}]*}' .next/server/app --include=*.html | sort -u
# Expect no output. Any match is a new anonymous node that needs `orgRef`.
```

## What chopit.app must emit

This is the half this repository cannot ship. Three changes, in order of value:

**1. A visible link back to chop-it.com.** A footer link is enough. Markup
supports a link; it does not replace one. Without this the reciprocity claim
rests entirely on JSON-LD that only some consumers read.

**2. The identical Organization node, same `@id`.** Not a similar node — the
same `@id` string, `https://chop-it.com/#organization`, even though it is
emitted on a different domain. That is the mechanism by which two documents
are understood to describe one entity. Copy the block above verbatim.

**3. `sameAs` pointing back.** The app's own `sameAs` should include
`https://chop-it.com`, so the identity claim runs in both directions rather
than only outward from the marketing site.

If the app declares a `WebApplication` node for itself, give it
`publisher: { "@id": "https://chop-it.com/#organization" }` so it hangs off the
same organisation rather than standing alone.

## Deliberately not done here

**No `WebApplication` node for chopit.app on this site.** Structured data
should represent visible content, and chop-it.com does not currently link to
the web app anywhere a reader would find it. Add the link first, then the
markup describing it — not the reverse.

**No title-tag change.** chop-it.com and chopit.app both lead with "Chop it".
Differentiating them is plausible but is a title change without page-level
click-through evidence, which the project's SEO guidance rules out. Record a
baseline first.

## Which domain should own what

The two domains serve different stages and should stop competing:

| Query type | Should win | Why |
| --- | --- | --- |
| `chop it`, `chop it app` | chopit.app | Brand searchers want the product |
| `best meal planning apps uk`, `chatgpt meal planning` | chop-it.com | Research-phase readers want the article |

chop-it.com reached position 9.1 on informational queries in early August 2026
before the 18 August ranking reset. That is the ground it can hold. The brand
term is not.
