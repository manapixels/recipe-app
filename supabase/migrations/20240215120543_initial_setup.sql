create type public.app_permission as enum('events.create', 'events.delete');

-- ..........
--
-- PROFILES
--
-- ..........
create table public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  name text not null,
  avatar_url text,
  username text not null unique
);

-- Comments
comment on table public.profiles is 'Profile data for each user.';

comment on column public.profiles.id is 'References the internal Supabase Auth user.';

comment on column public.profiles.username is 'Unique slug based on username.';

-- .........
--
-- RECIPES
--
-- .........
-- Types
create type public.recipe_status as enum('draft', 'published', 'archived');

create type public.recipe_categories as enum('sweets', 'breads');

create type public.recipe_subcategories as enum(
  -- Sweets sub-categories
  'cookies',
  'muffins.cupcakes',
  'roll.cakes',
  'tarts',
  'pies',
  'brownies',
  'donuts',
  'ice.cream',
  'puddings',
  'chocolates',
  'candies',
  'cheesecakes',
  'macarons',
  'traditional.sweets',
  -- Bread sub-categories
  'sourdough',
  'flatbreads',
  'sweet.breads',
  'buns.rolls',
  'bagels',
  'croissants',
  'baguettes',
  'natural-yeast'
);

-- Table
create table public.recipes (
  id uuid not null default gen_random_uuid () primary key,
  status recipe_status not null default 'draft',
  slug text not null unique,
  name text not null,
  description text,
  category recipe_categories not null default 'sweets',
  subcategory recipe_subcategories not null,
  ingredients jsonb not null default '[]'::jsonb check (
    jsonb_typeof(ingredients) = 'array'
    and jsonb_array_length(ingredients) >= 0
  ),
  instructions jsonb not null default '[]'::jsonb check (
    jsonb_typeof(instructions) = 'array'
    and jsonb_array_length(instructions) >= 0
  ),
  total_time integer not null default 0,
  servings integer not null default 1,
  difficulty integer not null default 1,
  image_thumbnail_url varchar(255),
  image_banner_url varchar(255),
  created_by uuid references public.profiles (id) on delete set null not null,
  created_at timestamp with time zone default timezone ('utc'::text, now()) not null,
  metadata jsonb
);

-- Comments
comment on table public.recipes is 'Details for each recipe.';

-- RLS
alter table recipes enable row level security;

create policy "Viewable by everyone." on recipes for
select
  using (true);

create policy "Can update own recipes." on recipes
for update
  using (auth.uid () = created_by);

create policy "Can delete own recipes." on recipes for delete using (auth.uid () = created_by);

create policy "Can insert recipes." on recipes for insert
with
  check (auth.uid () = created_by);

-- Function to generate a unique slug using a text input
create extension if not exists "unaccent";

create or replace function slugify ("value" text) returns text as $$
  with "unaccented" as (
    select unaccent("value") as "value"
  ),
  "lowercase" as (
    select lower("value") as "value"
    from "unaccented"
  ),
  "removed_quotes" as (
    select regexp_replace("value", '[''"]+', '', 'gi') as "value"
    from "lowercase"
  ),
  "hyphenated" as (
    select regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') as "value"
    from "removed_quotes"
  ),
  "trimmed" as (
    select regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') as "value"
    from "hyphenated"
  )
  select "value" from "trimmed";
$$ language sql strict immutable;

-- Create a function to generate and set a unique slug from the recipe name
create or replace function public.set_recipe_slug () returns trigger as $$
declare
    base_slug text;
    new_slug text;
    slug_count int;
begin
    new_slug := slugify(NEW.name);
    slug_count := 1;

    -- Check if the slug already exists and append a number to make it unique
    loop
        select count(*) into slug_count from public.recipes where slug = new_slug;
        exit when slug_count = 0;
        new_slug := new_slug || '-' || slug_count;
        slug_count := slug_count + 1;
    end loop;

    new.slug := new_slug;
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically generate slug for new recipes
create trigger set_recipe_slug before insert on public.recipes for each row
execute function set_recipe_slug ();

-- Create view for recipes with author data
create or replace view recipes_with_author_data as
select
  r.id,
  r.name,
  r.slug,
  r.category,
  r.description,
  r.ingredients,
  r.instructions,
  r.total_time,
  r.servings,
  r.difficulty,
  r.image_thumbnail_url,
  r.image_banner_url,
  r.created_at,
  r.status,
  json_build_object(
    'id',
    p.id,
    'name',
    p.name,
    'username',
    p.username,
    'avatar_url',
    p.avatar_url,
    'recipes_created',
    rc.recipes_created
  ) as created_by
from
  public.recipes r
  left join public.profiles p on p.id = r.created_by
  left join (
    select
      created_by,
      count(id) as recipes_created
    from
      public.recipes
    group by
      created_by
  ) rc on rc.created_by = p.id
where
  r.status <> 'draft';

drop publication if exists supabase_realtime;

create publication supabase_realtime for table recipes;