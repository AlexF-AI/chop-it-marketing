# Research centre roadmap — pages that need data we do not have yet

The live /research section only publishes figures traceable to a named
external source. The pages below were briefed but CANNOT be built honestly
without original data. Do not ship them as thin placeholder pages; publish
each one only when its input exists.

## State of AI Meal Planning 2026

The flagship. Needs an original survey — nothing citable exists at this
title, which is exactly why it would earn citations.

Required input: a commissioned consumer survey (Attest or similar run UK
panels from ~£1 per response; 500+ UK respondents makes the numbers
quotable). Questions worth asking, chosen so the answers are interesting
whatever direction they fall:
- Have you ever asked an AI chatbot for a recipe or a meal plan?
- Did you cook it? Did you keep it? Where is it now?
- What stopped you (trust, effort, forgot, result was poor)?
- Weekly food shop planning method (none / paper / notes app / dedicated app / AI).

Also usable, and free: anonymised aggregate product data. PostHog is the
accurate source for this — the app tracks in the org's "Default project"
(id 146925), separate from the marketing project (180088). The events that
would feed research pages already exist:

  canonical_import_validation_status   recipe imports (source split)
  scan_recipe_opened                   cookbook/photo captures
  gpt_plugin_request                   ChatGPT app usage
  recipe_added_to_menu / menu_created  planning behaviour
  pantry_item_added                    pantry usage
  whisk_handoff_completed              shop handoffs

VOLUME GATE, checked 5 August 2026 (90-day window): 22 sign-ups,
114 people opening recipes, and single-digit user counts on most feature
events (4 people importing, 3 creating menus, 1 using the GPT plugin).
Publishing percentages from samples this size would be the exact
fabricated-authority pattern the research section exists to avoid — "75%
of Chop it menus" must never mean three of four people. Do not publish any
product-data statistic until the underlying figure covers at least a few
hundred distinct users, and always state the n alongside the percentage.
Re-check volumes quarterly with the same 90-day query.

## Live now: reader survey on chop-it.com (started 5 August 2026)

A three-question PostHog popover survey runs on the marketing site,
project 180088, survey id 019fd3a5-9e1d-0000-affc-4a52e04804ec:

  1. Have you ever asked an AI, like ChatGPT, for a recipe or a meal plan?
  2. What happened to the last recipe an AI gave you?
  3. How do you plan your weekly food shop? (with an open "other")

Settings: 20-second delay before showing, one response per person, 90-day
quiet period after seeing any survey, partial responses stored. No code
changes were needed; it renders through the posthog-js SDK already on the
site.

BIAS CAVEAT, non-negotiable: respondents are chop-it.com visitors, a
population already interested in AI cooking. Results are publishable only
as "a survey of chop-it.com readers, n=X", never as UK consumer research.
The same volume gate applies as for product data: no published percentage
until n reaches a few hundred, always with n stated. This survey
complements the commissioned panel; it does not replace it.

## AI Grocery Shopping Trends / ChatGPT Recipe Trends

Same constraint. Either commissioned data or waiting for third-party
research to cite. Watch for: Ofcom's online nation reports (AI usage),
supermarket annual reports mentioning AI features, YouGov trackers.

## Downloadable assets

Once State of AI Meal Planning exists, a PDF version with charts is the
citable artefact journalists actually link. Charts should be original
SVGs, not stock; the site has no charting dependency and does not need
one for static figures.

## Already live

- /research/ai-cooking-statistics — compiled from Attest, YouGov and WRAP,
  every figure dated and linked. Update cadence: re-check quarterly, move
  the dateModified only when a figure actually changes.
