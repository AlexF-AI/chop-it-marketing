-- Public menu builder — mint a /m/<code> share link from the marketing site.
--
-- The site already READS shared menus through get_shared_menu (SECURITY
-- DEFINER, so the anon key is enough). There was no write path: shared_menus
-- has RLS on with zero policies, and collections / recipe_collections are
-- policy-gated to their owner. This adds the one write the builder needs,
-- as a SECURITY DEFINER function with a deliberately narrow surface.
--
-- What an anonymous caller can do through it:
--   * create one collection whose name is at most 80 characters
--   * attach between 1 and 24 recipes that already exist in
--     recipes_published AND are live AND are seo_published
--   * mint one share code for it
--
-- What it cannot do: write arbitrary rows, reach user_recipes, set an owner,
-- or attach a recipe that isn't publicly browsable already. The payload is
-- bounded to a short string plus a set of ids that must resolve, which keeps
-- the abuse value low.
--
-- Apply: paste into the Supabase SQL editor (same convention as
-- supabase/migrations/20260516_marketing_waitlist.sql).

-- ---------------------------------------------------------------------------
-- Share-code generator.
--
-- Alphabet is 31 characters: A-Z without I, L and O, then 2-9 without 0 and 1.
-- Nothing in a code can be misread off a screenshot or down a phone line.
-- Six characters gives 31^6 ~= 887 million codes, and the caller below retries
-- on collision against the unique index rather than trusting that.
-- ---------------------------------------------------------------------------
create or replace function public.gen_share_code(p_len int default 6)
returns text
language sql
volatile
set search_path = public
as $$
  select string_agg(
           substr(
             'ABCDEFGHJKMNPQRSTUVWXYZ23456789',
             1 + floor(random() * 31)::int,
             1
           ),
           ''
         )
  from generate_series(1, greatest(p_len, 1));
$$;

comment on function public.gen_share_code(int) is
  'Random share code from an unambiguous 31-character alphabet (no I, L, O, 0, 1).';

-- ---------------------------------------------------------------------------
-- Mint a public shared menu.
--
-- Returns { share_code, name, recipe_count }. Raises on an empty or
-- unresolvable pick list so the caller can tell "nothing valid was sent"
-- apart from "wrote nothing".
-- ---------------------------------------------------------------------------
create or replace function public.create_public_shared_menu(
  p_name       text,
  p_recipe_ids text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name          text;
  v_ids           text[];
  v_collection_id uuid;
  v_device_code   text;
  v_code          text;
  v_attempt       int := 0;
begin
  if p_recipe_ids is null or array_length(p_recipe_ids, 1) is null then
    raise exception 'no_recipes' using errcode = '22023';
  end if;

  -- Bound the work before touching a table: reject an oversized array
  -- outright rather than joining it against recipes_published first.
  if array_length(p_recipe_ids, 1) > 60 then
    raise exception 'too_many_recipes' using errcode = '22023';
  end if;

  v_name := nullif(btrim(coalesce(p_name, '')), '');
  if v_name is null then
    v_name := 'A Chop it menu';
  end if;
  v_name := left(v_name, 80);

  -- Keep only live, SEO-published recipes, de-duplicated, in the order the
  -- visitor picked them. DISTINCT ON keeps the earliest pick of a repeat,
  -- which is also what the unique index on (collection_id, recipe_id) wants.
  select array_agg(ranked.recipe_id order by ranked.ord)
    into v_ids
  from (
    select distinct on (rp.id) rp.id::text as recipe_id, picked.ord
    from unnest(p_recipe_ids) with ordinality as picked(id, ord)
    join recipes_published rp
      on rp.id::text = picked.id
     and rp.deleted_at is null
     and rp.seo_published is true
    order by rp.id, picked.ord
  ) ranked;

  if v_ids is null or array_length(v_ids, 1) is null then
    raise exception 'no_valid_recipes' using errcode = '22023';
  end if;

  if array_length(v_ids, 1) > 24 then
    raise exception 'too_many_recipes' using errcode = '22023';
  end if;

  -- collections carries CHECK collections_identity_exclusive: exactly one of
  -- user_id / device_code must be set. A menu built here has no signed-in
  -- user, so it takes the device side. owner_account_code mirrors
  -- device_code, which is what the app's own anonymous rows do. The `web_`
  -- prefix keeps site-built menus separable from app ones for analytics and
  -- for any later cleanup.
  v_device_code := 'web_' || extract(epoch from clock_timestamp())::bigint
                          || '_' || lower(public.gen_share_code(8));

  insert into collections (name, owner_account_code, kind, device_code, user_id)
  values (v_name, v_device_code, 'generic', v_device_code, null)
  returning id into v_collection_id;

  -- added_at is what get_shared_menu orders the recipes by, and now() is
  -- transaction-stable in Postgres: every row inserted here would otherwise
  -- carry one identical timestamp and the visitor's pick order would be lost
  -- on the share page. Stagger by ordinality so the order survives.
  insert into recipe_collections (collection_id, recipe_id, added_at)
  select v_collection_id,
         picked.id,
         now() + (picked.ord * interval '1 millisecond')
  from unnest(v_ids) with ordinality as picked(id, ord);

  -- Retry against the unique index rather than pre-checking for a free code:
  -- check-then-insert races as soon as two visitors generate at the same
  -- moment, and the index is the only real arbiter.
  loop
    v_attempt := v_attempt + 1;
    v_code := public.gen_share_code(6);
    begin
      insert into shared_menus (share_code, collection_id)
      values (v_code, v_collection_id);
      exit;
    exception when unique_violation then
      if v_attempt >= 10 then
        raise exception 'share_code_exhausted' using errcode = '40001';
      end if;
    end;
  end loop;

  return jsonb_build_object(
    'share_code',   v_code,
    'name',         v_name,
    'recipe_count', array_length(v_ids, 1)
  );
end;
$$;

comment on function public.create_public_shared_menu(text, text[]) is
  'Marketing-site menu builder: creates a collection of 1-24 seo_published recipes and returns its /m/<code> share code.';

-- The marketing site calls this with the anon key, through the
-- /api/menu/share route handler.
grant execute on function public.gen_share_code(int) to anon, authenticated;
grant execute on function public.create_public_shared_menu(text, text[]) to anon, authenticated;
