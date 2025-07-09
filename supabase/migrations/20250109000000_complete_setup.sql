-- Complete Recipe App Database Setup Migration
-- This migration includes all initial setup and recipe versioning features

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create custom types
CREATE TYPE public.app_permission AS ENUM('events.create', 'events.delete');
CREATE TYPE public.unit_system AS ENUM('metric', 'imperial');
CREATE TYPE public.recipe_status AS ENUM('draft', 'published', 'archived');
CREATE TYPE public.recipe_categories AS ENUM('sweets', 'breads');
CREATE TYPE public.recipe_subcategories AS ENUM(
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

-- ..........
--
-- PROFILES
--
-- ..........
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  username TEXT NOT NULL UNIQUE,
  preferred_unit_system unit_system DEFAULT 'metric',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments
COMMENT ON TABLE public.profiles IS 'Profile data for each user.';
COMMENT ON COLUMN public.profiles.id IS 'References the internal Supabase Auth user.';
COMMENT ON COLUMN public.profiles.username IS 'Unique slug based on username.';

-- .........
--
-- RECIPES
--
-- .........
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status recipe_status NOT NULL DEFAULT 'draft',
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category recipe_categories NOT NULL DEFAULT 'sweets',
  subcategory recipe_subcategories NOT NULL,
  components JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (
    jsonb_typeof(components) = 'array'
    AND jsonb_array_length(components) >= 0
  ),
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (
    jsonb_typeof(instructions) = 'array'
    AND jsonb_array_length(instructions) >= 0
  ),
  nutrition_info JSONB,
  total_time INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1,
  difficulty INTEGER NOT NULL DEFAULT 1,
  image_thumbnail_url VARCHAR(255),
  image_banner_url VARCHAR(255),
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB,
  version_id UUID -- Will be linked to recipe_versions table
);

-- Comments
COMMENT ON TABLE public.recipes IS 'Details for each recipe.';

-- RLS for recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewable by everyone." ON recipes FOR SELECT USING (true);
CREATE POLICY "Can update own recipes." ON recipes FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Can delete own recipes." ON recipes FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Can insert recipes." ON recipes FOR INSERT WITH CHECK (auth.uid() = created_by);

-- User favorite recipes table
CREATE TABLE public.user_favorite_recipes (
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT user_favorite_recipes_pkey PRIMARY KEY (user_id, recipe_id),
  CONSTRAINT user_favorite_recipes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT user_favorite_recipes_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.user_favorite_recipes IS 'Stores recipes favorited by users.';
COMMENT ON COLUMN public.user_favorite_recipes.user_id IS 'ID of the user who favorited the recipe.';
COMMENT ON COLUMN public.user_favorite_recipes.recipe_id IS 'ID of the recipe that was favorited.';
COMMENT ON COLUMN public.user_favorite_recipes.created_at IS 'Timestamp of when the recipe was favorited.';

ALTER TABLE public.user_favorite_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their own favorites"
ON public.user_favorite_recipes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own favorites"
ON public.user_favorite_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own favorites"
ON public.user_favorite_recipes FOR DELETE USING (auth.uid() = user_id);

-- ......................
--
-- RECIPE VERSIONING SYSTEM
--
-- ......................

-- Recipe versioning table
CREATE TABLE recipe_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  parent_version_id UUID REFERENCES recipe_versions(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_summary TEXT,
  is_public BOOLEAN DEFAULT true,
  fork_count INTEGER DEFAULT 0,
  success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5),
  
  -- Constraints
  CONSTRAINT unique_version_per_recipe UNIQUE (recipe_id, version_number)
);

-- Recipe diary entries table
CREATE TABLE recipe_diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_version_id UUID NOT NULL REFERENCES recipe_versions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('pre_cooking', 'during_cooking', 'post_cooking', 'next_time')),
  content TEXT NOT NULL,
  cooking_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  images TEXT[] DEFAULT '{}'
);

-- Recipe changes tracking table
CREATE TABLE recipe_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_version_id UUID NOT NULL REFERENCES recipe_versions(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN (
    'ingredient_added', 
    'ingredient_removed', 
    'ingredient_modified', 
    'instruction_added', 
    'instruction_removed', 
    'instruction_modified',
    'general_info_modified'
  )),
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_recipe_versions_original_recipe ON recipe_versions(original_recipe_id);
CREATE INDEX idx_recipe_versions_parent ON recipe_versions(parent_version_id);
CREATE INDEX idx_recipe_versions_created_by ON recipe_versions(created_by);
CREATE INDEX idx_recipe_versions_recipe_id ON recipe_versions(recipe_id);

CREATE INDEX idx_diary_entries_version ON recipe_diary_entries(recipe_version_id);
CREATE INDEX idx_diary_entries_created_by ON recipe_diary_entries(created_by);
CREATE INDEX idx_diary_entries_type ON recipe_diary_entries(entry_type);
CREATE INDEX idx_diary_entries_cooking_date ON recipe_diary_entries(cooking_date);

CREATE INDEX idx_recipe_changes_version ON recipe_changes(recipe_version_id);
CREATE INDEX idx_recipe_changes_type ON recipe_changes(change_type);

-- RLS Policies for recipe_versions
ALTER TABLE recipe_versions ENABLE ROW LEVEL SECURITY;

-- Users can view public versions and their own private versions
CREATE POLICY "Users can view public recipe versions" 
  ON recipe_versions FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Users can view their own recipe versions" 
  ON recipe_versions FOR SELECT 
  USING (created_by = auth.uid());

-- Users can create versions (fork recipes)
CREATE POLICY "Users can create recipe versions" 
  ON recipe_versions FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- Users can update their own versions
CREATE POLICY "Users can update their own recipe versions" 
  ON recipe_versions FOR UPDATE 
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Users can delete their own versions
CREATE POLICY "Users can delete their own recipe versions" 
  ON recipe_versions FOR DELETE 
  USING (created_by = auth.uid());

-- RLS Policies for recipe_diary_entries
ALTER TABLE recipe_diary_entries ENABLE ROW LEVEL SECURITY;

-- Users can view diary entries for public versions and their own versions
CREATE POLICY "Users can view diary entries for accessible versions" 
  ON recipe_diary_entries FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM recipe_versions rv 
      WHERE rv.id = recipe_version_id 
      AND (rv.is_public = true OR rv.created_by = auth.uid())
    )
  );

-- Users can create diary entries for accessible versions
CREATE POLICY "Users can create diary entries" 
  ON recipe_diary_entries FOR INSERT 
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM recipe_versions rv 
      WHERE rv.id = recipe_version_id 
      AND (rv.is_public = true OR rv.created_by = auth.uid())
    )
  );

-- Users can update their own diary entries
CREATE POLICY "Users can update their own diary entries" 
  ON recipe_diary_entries FOR UPDATE 
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Users can delete their own diary entries
CREATE POLICY "Users can delete their own diary entries" 
  ON recipe_diary_entries FOR DELETE 
  USING (created_by = auth.uid());

-- RLS Policies for recipe_changes
ALTER TABLE recipe_changes ENABLE ROW LEVEL SECURITY;

-- Users can view changes for accessible versions
CREATE POLICY "Users can view recipe changes for accessible versions" 
  ON recipe_changes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM recipe_versions rv 
      WHERE rv.id = recipe_version_id 
      AND (rv.is_public = true OR rv.created_by = auth.uid())
    )
  );

-- System can create change records (no direct user access)
CREATE POLICY "System can create recipe changes" 
  ON recipe_changes FOR INSERT 
  WITH CHECK (true);

-- Add foreign key constraint to link recipes to versions
ALTER TABLE recipes ADD CONSTRAINT recipes_version_id_fkey 
  FOREIGN KEY (version_id) REFERENCES recipe_versions(id);

-- ......................
--
-- FUNCTIONS
--
-- ......................

-- Function to generate a unique slug using a text input
CREATE OR REPLACE FUNCTION slugify("value" TEXT) RETURNS TEXT AS $$
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$$ LANGUAGE SQL STRICT IMMUTABLE;

-- Create a function to generate and set a unique slug from the recipe name
CREATE OR REPLACE FUNCTION public.set_recipe_slug() RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    slug_count INT;
BEGIN
    new_slug := slugify(NEW.name);
    slug_count := 1;

    -- Check if the slug already exists and append a number to make it unique
    LOOP
        SELECT count(*) INTO slug_count FROM public.recipes WHERE slug = new_slug;
        EXIT WHEN slug_count = 0;
        new_slug := new_slug || '-' || slug_count;
        slug_count := slug_count + 1;
    END LOOP;

    NEW.slug := new_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment fork count
CREATE OR REPLACE FUNCTION increment_fork_count(original_version_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE recipe_versions 
  SET fork_count = fork_count + 1 
  WHERE id = original_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate version number
CREATE OR REPLACE FUNCTION generate_version_number(original_recipe_id UUID, parent_version_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_version TEXT;
  next_minor INTEGER;
BEGIN
  -- If no parent, this is a direct fork (version 1.1, 1.2, etc.)
  IF parent_version_id IS NULL THEN
    SELECT COALESCE(MAX(CAST(SPLIT_PART(version_number, '.', 2) AS INTEGER)), 0) + 1
    INTO next_minor
    FROM recipe_versions 
    WHERE original_recipe_id = generate_version_number.original_recipe_id 
    AND parent_version_id IS NULL;
    
    RETURN '1.' || next_minor;
  ELSE
    -- Get parent version and increment
    SELECT version_number INTO base_version
    FROM recipe_versions 
    WHERE id = parent_version_id;
    
    SELECT COALESCE(MAX(CAST(SPLIT_PART(version_number, '.', 3) AS INTEGER)), 0) + 1
    INTO next_minor
    FROM recipe_versions 
    WHERE parent_version_id = generate_version_number.parent_version_id;
    
    RETURN base_version || '.' || next_minor;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ......................
--
-- TRIGGERS
--
-- ......................

-- Create trigger to automatically generate slug for new recipes
CREATE TRIGGER set_recipe_slug BEFORE INSERT ON public.recipes FOR EACH ROW
EXECUTE FUNCTION set_recipe_slug();

-- ......................
--
-- VIEWS
--
-- ......................

-- Create view for recipes with author data
CREATE OR REPLACE VIEW recipes_with_author_data AS
SELECT
  r.id,
  r.name,
  r.slug,
  r.category,
  r.description,
  r.components,
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
  ) AS created_by
FROM
  public.recipes r
  LEFT JOIN public.profiles p ON p.id = r.created_by
  LEFT JOIN (
    SELECT
      created_by,
      count(id) AS recipes_created
    FROM
      public.recipes
    GROUP BY
      created_by
  ) rc ON rc.created_by = p.id
WHERE
  r.status <> 'draft';

-- ......................
--
-- STORAGE
--
-- ......................
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('recipe_thumbnails', 'recipe_thumbnails', true),
  ('recipe_banners', 'recipe_banners', true);

CREATE POLICY "Public read access for avatars, recipe thumbnails, and recipe banners" 
ON storage.objects FOR SELECT USING (
  bucket_id IN ('avatars', 'recipe_thumbnails', 'recipe_banners')
);

CREATE POLICY "Public insert access for avatars, recipe thumbnails, and recipe banners" 
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id IN ('avatars', 'recipe_thumbnails', 'recipe_banners')
);

-- ......................
--
-- REALTIME
--
-- ......................
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE recipes;

-- ......................
--
-- INITIAL DATA SETUP
--
-- ......................

-- Create initial version entries for existing recipes (if any)
-- This will run after the first recipes are created
CREATE OR REPLACE FUNCTION create_initial_recipe_versions()
RETURNS VOID AS $$
BEGIN
  INSERT INTO recipe_versions (
    original_recipe_id,
    parent_version_id,
    recipe_id,
    version_number,
    created_by,
    change_summary,
    is_public
  )
  SELECT 
    id AS original_recipe_id,
    NULL AS parent_version_id,
    id AS recipe_id,
    '1.0' AS version_number,
    created_by,
    'Original recipe' AS change_summary,
    CASE 
      WHEN status = 'published' THEN true 
      ELSE false 
    END AS is_public
  FROM recipes
  WHERE NOT EXISTS (
    SELECT 1 FROM recipe_versions WHERE recipe_id = recipes.id
  );
  
  -- Update existing recipes to link to their version entries
  UPDATE recipes 
  SET version_id = rv.id 
  FROM recipe_versions rv 
  WHERE recipes.id = rv.recipe_id 
  AND rv.version_number = '1.0'
  AND recipes.version_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON recipe_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON recipe_diary_entries TO authenticated;
GRANT SELECT ON recipe_changes TO authenticated;
GRANT EXECUTE ON FUNCTION increment_fork_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_version_number(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_initial_recipe_versions() TO authenticated;