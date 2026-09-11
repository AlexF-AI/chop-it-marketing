-- Read-only ingredient-catalogue lookup for the marketing site.
--
-- The homepage's "One shop. One place to cook." section shows a real
-- combined shopping list built from published recipes rather than a
-- screenshot of one. Merging needs three reference fields per ingredient:
--
--   name_uk        what to call it on the list
--   plural         what to call it when the line asks for more than one
--   category       which section it belongs in
--   pantry_staple  whether it is probably already in the cupboard
--
-- Those live in `ingredients_canonical`, which has RLS enabled with a
-- service_role-only policy, so the anon key cannot read it.
--
-- Rather than open the table to anon, this returns just those columns for
-- a bounded set of ids. It exposes no user data: the same ingredient names
-- are already public on every /recipes/<slug> page, and the categories are
-- reference data about food, not about anyone.
--
-- Apply: paste into the Supabase SQL editor (same convention as the other
-- migrations in this folder).

-- Dropped first because the returned column list changed (plural was added
-- after the first version shipped); Postgres will not replace a function
-- whose return type differs. The grant below is re-issued for the same
-- reason.
drop function if exists public.get_ingredient_catalogue(bigint[]);

create function public.get_ingredient_catalogue(p_ids bigint[])
returns table (id bigint, name_uk text, plural text, category text, pantry_staple boolean)
language sql
stable
security definer
set search_path = public
as $$
  select ic.id, ic.name_uk, ic.plural, ic.category, coalesce(ic.pantry_staple, false)
  from ingredients_canonical ic
  where ic.id = any(coalesce(p_ids, '{}'::bigint[]))
  -- Bounded so a caller cannot use this to page the whole table cheaply;
  -- four recipes ask for a few dozen ids at a time.
  limit 400;
$$;

comment on function public.get_ingredient_catalogue(bigint[]) is
  'Reference rows (name, plural, category, pantry_staple) for the given canonical ingredient ids. Read-only, no user data.';

grant execute on function public.get_ingredient_catalogue(bigint[]) to anon, authenticated;
