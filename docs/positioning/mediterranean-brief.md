# Positioning brief: easy Mediterranean eating, planned weekly

Status: proposal, September 2026. Owner: Alex. Decision needed before any
app copy, App Store listing or content cluster changes.

## The problem this solves

Chop it is a general meal planner in a market full of them. The numbers
behind this brief (app database, PostHog, 6 September 2026):

- 98% of people who ever opened the app were active for exactly one day.
- Of roughly 3,180 identities, 15 reached four or more active days.
- The people who stay are the ones who set a week live and mark it done: 4
  of the 6 who ever activated a menu and 4 of the 5 who ever completed a week
  are long-term returners. Recipe browsing predicts nothing (758 of 772
  recipe viewers never came back).
- Marketing site: 532 visitors in 90 days, 22 sign-ups.

A general promise ("plan meals better") gives a first-time visitor no reason
to build a week in their first session, and no reason to return on Sunday.
A specific promise can do both.

## The proposal

Reposition Chop it as **the easy way to eat Mediterranean, one week at a
time**: a weekly plan, a shopping list and a plants-per-week score for a
family, built on a recipe library that already eats this way.

Not a diet app. The Mediterranean pattern is a way of eating, NHS-endorsed,
consistently rated the best-regarded diet in the UK, and family-shaped.
Weight-loss framing attracts people who churn in three weeks when the scale
does not move; habit framing keeps the people who want the weekly loop.

## Why Chop it can own this

- **The library is already there.** Of 1,055 live recipes, about 430 (41%)
  carry Mediterranean-basin cuisine tags, 944 have five or more plants, and
  the average recipe has 8.3 plants. This is curation and labelling, not a
  content rebuild.
- **The editorial rules are Mediterranean rules.** "Add before swapping,
  taste has the veto, no fake-healthy substitutions, plants and fibre scored"
  is the canonical recipe contract in the app repo. Keto or calorie counting
  would fight the prompts; this is native to them.
- **The scoring exists.** The weekly food score already counts distinct
  plants against a target of 30 and scores protein and fibre. The app now
  also keeps week-over-week history and a streak, and sends a Sunday
  planning nudge that quotes the week's score.
- **It sharpens search.** "Mediterranean diet meal plan UK", "Mediterranean
  diet shopping list" and "30 plants a week" are queries with intent that a
  general planner never ranks for. The Learn and Research clusters on the
  site are the right vehicle.

## What changes, in order

1. **Content first, app second.** Publish a Mediterranean cluster on the
   site (learn pages, a weekly plan template, a shopping list, a "30 plants"
   explainer) and watch whether it brings search traffic that converts to a
   live week. This is the cheapest validation available at 22 sign-ups a
   quarter; an in-app A/B test cannot read at this volume.
2. **Onboarding ends with a live week.** First session: a few preference
   taps, a generated Mediterranean week, "Make this my week", shopping list.
   Activation metric: `menu_set_this_week` in the first session.
3. **A four-week starter programme.** A named week-one plan removes the blank
   page. Programmes retain because the app says what to do next.
4. **App Store listing and home copy** follow once the content cluster shows
   demand. Keep "Chop it" as the brand; the descriptor is what changes.

## What does not change

- Recipe voice and the taste-first editorial contract.
- The credit model and Pro pricing. Positioning is not a pricing change.
- The core loop (Draft and Saved Weeks, This Week, Shop, Pantry, Cook).

## Risks

- **Narrowing too far.** Mitigation: "Mediterranean" is the descriptor, not
  a gate. The library keeps its full range; the plan generator leans
  Mediterranean by default and users can pull in anything.
- **Diet fatigue.** Mitigation: never lead with weight. Lead with easy,
  family, plants, weekly.
- **Measurement.** The site still cannot attribute an in-app purchase to a
  marketing page (the `phid` identify stitch is unfinished and the site
  tracks no revenue events). Fix before spending on distribution.

## Decision

Approve step 1 now; steps 2 to 4 wait on evidence from the content cluster
and on the activation metric moving.
