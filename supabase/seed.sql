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
    id,
    name,
    description,
    category,
    subcategory,
    components,
    instructions,
    total_time,
    servings,
    difficulty,
    created_by,
    status,
    image_thumbnail_url,
    image_banner_url
  ) VALUES 
  (
    'd2d3c8a0-40a3-4a8e-8c6b-6f8e1a2b3c4d',
    'Chocolate Chip Cookies',
    'Classic chocolate chip cookies that are crispy on the outside and chewy on the inside',
    'sweets',
    'cookies',
    '[
      {
        "id": "main",
        "name": "Main",
        "description": "Primary cookie ingredients",
        "order": 1,
        "ingredients": [
          {"name": "All-purpose flour", "amount": "240", "unit": "g", "is_flour": false},
          {"name": "Butter", "amount": "170", "unit": "g", "is_flour": false},
          {"name": "Brown sugar", "amount": "150", "unit": "g", "is_flour": false},
          {"name": "Chocolate chips", "amount": "200", "unit": "g", "is_flour": false}
        ]
      }
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
    'published',
    'd2d3c8a0-40a3-4a8e-8c6b-6f8e1a2b3c4d-thumbnail.jpg',
    'd2d3c8a0-40a3-4a8e-8c6b-6f8e1a2b3c4d-banner.jpg'
  ),
  (
    'f0f1f2f3-f4f5-f6f7-f8f9-fafbfcfdfeff',
    'Sourdough Bread',
    'Traditional sourdough bread with a crispy crust and chewy interior',
    'breads',
    'sourdough',
    '[
      {
        "id": "main",
        "name": "Main",
        "description": "Primary bread ingredients",
        "order": 1,
        "ingredients": [
          {"name": "Bread flour", "amount": "500", "unit": "g", "is_flour": true},
          {"name": "Water", "amount": "350", "unit": "g", "is_flour": false},
          {"name": "Salt", "amount": "10", "unit": "g", "is_flour": false},
          {"name": "Sourdough starter", "amount": "100", "unit": "g", "is_flour": false}
        ]
      }
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
    'published',
    'f0f1f2f3-f4f5-f6f7-f8f9-fafbfcfdfeff-thumbnail.jpg',
    'f0f1f2f3-f4f5-f6f7-f8f9-fafbfcfdfeff-banner.jpg'
  ),
  (
    '12345678-90ab-cdef-1234-567890abcdef',
    'Traditional Poolish Baguette',
    'Baguette de tradition sur poolish',
    'breads',
    'baguettes',
    '[
      {
        "id": "poolish",
        "name": "Poolish",
        "description": "Pre-ferment for flavor development",
        "order": 1,
        "ingredients": [
          {"name": "Fresh yeast, crumbled", "amount": "1", "unit": "g", "is_flour": false},
          {"name": "Water", "amount": "100", "unit": "g", "is_flour": false},
          {"name": "White bread flour", "amount": "100", "unit": "g", "is_flour": true},
          {"name": "Salt", "amount": "2", "unit": "g", "is_flour": false}
        ]
      },
      {
        "id": "final_dough",
        "name": "Final Dough",
        "description": "Main baguette dough",
        "order": 2,
        "ingredients": [
          {"name": "White bread flour", "amount": "500", "unit": "g", "is_flour": true},
          {"name": "Water", "amount": "300", "unit": "g", "is_flour": false},
          {"name": "Poolish (above)", "amount": "203", "unit": "g", "is_flour": false, "from_component": "poolish"},
          {"name": "Salt", "amount": "9", "unit": "g", "is_flour": false},
          {"name": "Fresh yeast", "amount": "2", "unit": "g", "is_flour": false},
          {"name": "Water (for bassinage)", "amount": "10", "unit": "g", "is_flour": false}
        ]
      }
    ]'::jsonb,
    '[
      {"step": "1", "content": "Preparing the poolish: Whisk the yeast into the water until it has dissolved completely. Whisk in the flour and salt until well combined and smooth. Cover with plastic wrap and let ferment for 4 hours at room temperature. "},
      {"step": "2", "content": "Preparing the baguette dough: Knead the flour and water in the bowl of the stand mixer on low speed for 5 minutes until no dry bits remain. Cover the bowl with plastic wrap and let rest for 30 minutes-1 hour at room temperature (autolyse). Add the poolish, yeast, and salt, and knead on low speed for 10 minutes, followed by 2 minutes on high speed, until the dough is supple, smooth, and elastic. With the mixer running on low speed, gradually add the 10 g water, then increase the speed to high until the water is absorbed and the dough is smooth (bassinage). Make sure the dough temperature does not exceed 25°C. Place in a clean bowl, cover with plastic wrap, and let ferment for l hour at room temperature. Fold the dough once halfway through the rise time, after 30 minutes (see technique p. 48). Divide the dough into 5 pieces weighing 200 g each, and gently shape each one into a ball. Let rest for 30 minutes at room temperature. "},
      {"step": "3", "content": "Shaping and proofing the dough: Shape each piece of dough into a 12-in. (30-cm) baguette. Place the baguettes seam side down on a floured bakers couche or thick dish towel and pleat the couche or towel like an accordion between them to maintain their shape. Let proof for 45 minutes-1 hour at room temperature in a draft-free place. "},
      {"step": "4", "content": "Scoring and baking: Place a heavy-duty baking sheet or baking stone on a rack in the center of the oven and an empty heavy-duty rimmed baking sheet on the bottom rack. Preheat the oven to 270°C and bring 250 ml water to a simmer. Transfer the baguettes to a sheet of parchment paper. Using the bread lame, score the baguettes, making 3 cuts in each. Slide the baguettes, still on the parchment paper, onto the hot baking sheet or baking stone in the center of the oven and carefully pour the simmering water into the rimmed sheet on the lower rack to create steam. Quickly close the oven door and bake for 20 minutes. If you want a thick, crisp crust, lower the oven temperature to 200°C, open the door to release the steam, and then close it again. Leave the baguettes to dry for 5-10 minutes. Immediately transfer the baguettes to a rack and let them cool completely at room temperature. "}
    ]'::jsonb,
    600,
    5,
    3,
    user_id,
    'published',
    '12345678-90ab-cdef-1234-567890abcdef-thumbnail.jpg',
    '12345678-90ab-cdef-1234-567890abcdef-banner.jpg'
  );
END $$;

-- Commit the transaction
COMMIT;
