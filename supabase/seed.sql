-- Start a transaction
BEGIN;

-- Insert users and their profiles
DO $$ 
DECLARE
  user_id uuid;
  username text;
BEGIN

  -- Create admin user
  user_id := 'b02e2f4a-94ed-45ad-a745-435d986db886';
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@recipe.app',
    crypt('password123', gen_salt('bf')),
    now(),
    NULL, '', NULL, '', NULL, '', '', NULL, NULL,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin"}'::jsonb,
    now(),
    now()
  );

  -- Insert admin profile
  INSERT INTO public.profiles (id, name, username, avatar_url)
  VALUES (user_id, 'Admin', 'admin', user_id || '.png');

  -- Insert sample recipes
  INSERT INTO public.recipes (
    name,
    description,
    category,
    subcategory,
    ingredients,
    instructions,
    total_time,
    servings,
    difficulty,
    created_by,
    status
  ) VALUES 
  (
    'Chocolate Chip Cookies',
    'Classic chocolate chip cookies that are crispy on the outside and chewy on the inside',
    'sweets',
    'cookies',
    '[
      {"name": "All-purpose flour", "amount": "240", "unit": "g"},
      {"name": "Butter", "amount": "170", "unit": "g"},
      {"name": "Brown sugar", "amount": "150", "unit": "g"},
      {"name": "Chocolate chips", "amount": "200", "unit": "g"}
    ]'::jsonb,
    '[
      {"step": "1", "content": "Cream butter and sugar"},
      {"step": "2", "content": "Add dry ingredients"},
      {"step": "3", "content": "Fold in chocolate chips"},
      {"step": "4", "content": "Bake at 180°C for 12 minutes"}
    ]'::jsonb,
    20,
    24,
    2,
    user_id,
    'published'
  ),
  (
    'Sourdough Bread',
    'Traditional sourdough bread with a crispy crust and chewy interior',
    'breads',
    'sourdough',
    '[
      {"name": "Bread flour", "amount": "500", "unit": "g"},
      {"name": "Water", "amount": "350", "unit": "g"},
      {"name": "Salt", "amount": "10", "unit": "g"},
      {"name": "Sourdough starter", "amount": "100", "unit": "g"}
    ]'::jsonb,
    '[
      {"step": "1", "content": "Mix ingredients and autolyse"},
      {"step": "2", "content": "Perform stretch and folds"},
      {"step": "3", "content": "Bulk ferment for 4 hours"},
      {"step": "4", "content": "Shape and final proof"},
      {"step": "5", "content": "Bake in Dutch oven at 240°C"}
    ]'::jsonb,
    30,
    1,
    3,
    user_id,
    'published'
  );
END $$;

-- Commit the transaction
COMMIT;
