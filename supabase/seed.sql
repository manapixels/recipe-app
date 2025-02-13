-- Start a transaction
BEGIN;

-- Insert users
DO $$ DECLARE
  user_id uuid;
BEGIN
  FOR i IN 1..100 LOOP
    user_id := uuid_generate_v4();
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
      i || '@recipe-app.fam',
      crypt('password123', gen_salt('bf')),
      now(),
      NULL, '', NULL, '', NULL, '', '', NULL, NULL,
      '{"provider":"email","providers":["email"]}'::jsonb,
      ('{"name":"User ' || i || '","avatar_url":"","birthmonth":1, "birthyear":2000}')::jsonb,
      now(),
      now()
    );

    -- Assign 'participant' role to each user
    INSERT INTO public.user_roles (user_id, role) VALUES (user_id, 'participant');
  
  END LOOP;

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
      'shirley@recipe-app.fam',
      crypt('password123', gen_salt('bf')),
      now(),
      NULL, '', NULL, '', NULL, '', '', NULL, NULL,
      '{"provider":"email","providers":["email"]}'::jsonb,
      ('{"name":"Shirley Chen","avatar_url":"' || user_id || '.png","birthmonth":7, "birthyear":1993}')::jsonb,
      now(),
      now()
    );

  -- Assign 'host' roles to Shirley
  INSERT INTO public.user_roles (user_id, role) VALUES (user_id, 'host');


  -- Insert events
  INSERT INTO events (
      category, 
      created_at, 
      date_start, 
      date_end, 
      description, 
      id, 
      image_thumbnail_url,
      image_banner_url,
      location_name, 
      location_address,
      location_country, 
      name, 
      price, 
      price_currency,
      status, 
      created_by, 
      slots
  ) 
  VALUES 
  (
      ARRAY['speed-dating']::public.event_categories[], 
      '2023-07-02T10:00:00+08:00', 
      '2023-08-02T20:00:00+08:00', 
      '2023-08-02T22:00:00+08:00', 
      '', 
      '514cec29-5a04-488a-8dad-5d43e861f3b8', 
      '514cec29-5a04-488a-8dad-5d43e861f3b8.png', 
      '514cec29-5a04-488a-8dad-5d43e861f3b8.png',
      'The Otherside', 
      '7 Erskine Rd, Singapore 069320',
      'Singapore', 
      'Speed Dating Night Debute', 
      48, 
      'sgd',
      'completed', 
      user_id, 
      46
  ),
  (
      ARRAY['speed-dating']::public.event_categories[],  
      '2023-09-01T09:00:00+08:00', 
      '2023-09-21T19:00:00+08:00', 
      '2023-09-21T22:00:00+08:00', 
      '', 
      'e89dd521-24a9-4ef0-9667-8a3c46433c85', 
      'e89dd521-24a9-4ef0-9667-8a3c46433c85.png', 
      'e89dd521-24a9-4ef0-9667-8a3c46433c85.png',
      'The Otherside', 
      '7 Erskine Rd, Singapore 069320',
      'Singapore', 
      'When the Stars Align', 
      58, 
      'sgd',
      'completed', 
      user_id, 
      48
  ),
  (
      ARRAY['speed-dating']::public.event_categories[],  
      '2023-11-01T10:00:00+08:00', 
      '2023-11-24T20:00:00+08:00', 
      '2023-11-24T22:00:00+08:00', 
      '', 
      '295f43cc-c332-40ec-ab5e-467c663241fd', 
      '295f43cc-c332-40ec-ab5e-467c663241fd.jpg', 
      '295f43cc-c332-40ec-ab5e-467c663241fd.jpg',
      'Projector X: No Spoilers Bar', 
      '8 Grange Rd, #05-01, Singapore 239695',
      'Singapore', 
      'It''s a Masquerade!', 
      58, 
      'sgd',
      'completed', 
      user_id, 
      47
  ),
  (
      ARRAY['speed-dating']::public.event_categories[],  
      '2023-12-01T00:00:00+08:00', 
      '2023-12-23T19:00:00+08:00', 
      '2023-12-23T22:00:00+08:00', 
      '', 
      'f90d618d-291e-4923-a083-2e44651a069f', 
      'f90d618d-291e-4923-a083-2e44651a069f.jpg', 
      'f90d618d-291e-4923-a083-2e44651a069f.jpg',
      'Suntec City', 
      'Suntec Tower 3, 8 Temasek Blvd, Singapore 038988',
      'Singapore', 
      'Christmas Singles Night', 
      48, 
      'sgd',
      'completed', 
      user_id, 
      56
  ),
  (
      ARRAY['speed-dating']::public.event_categories[],  
      '2024-01-01T10:00:00+08:00', 
      '2024-01-27T19:00:00+08:00', 
      '2024-01-27T22:00:00+08:00', 
      'kinda like single''s inferno... but not exactly', 
      'a3157df3-4b7b-451a-842b-0fe5e72ffdcf', 
      'a3157df3-4b7b-451a-842b-0fe5e72ffdcf.jpg', 
      'a3157df3-4b7b-451a-842b-0fe5e72ffdcf.jpg',
      'Suntec Tower 3', 
      'Suntec Tower 3, 8 Temasek Blvd, Singapore 038988',
      'Singapore', 
      'MBTI X Singles Night', 
      58, 
      'sgd',
      'completed', 
      user_id, 
      62
  ),
  (
      ARRAY['speed-dating']::public.event_categories[],  
      '2024-02-20T10:00:00+08:00', 
      '2024-03-23T19:00:00+08:00', 
      '2024-03-23T22:00:00+08:00', 
      '', 
      '9a6654b8-32c3-47a8-bd82-4ad16e299663', 
      '9a6654b8-32c3-47a8-bd82-4ad16e299663.jpg', 
      '9a6654b8-32c3-47a8-bd82-4ad16e299663.jpg',
      'MYSEAT.sg', 
      '2 Veerasamy Rd, Singapore 207305',
      'Singapore', 
      'MBTI X Singles Night', 
      58, 
      'sgd',
      'completed', 
      user_id, 
      100
  ),
  (
      ARRAY['speed-dating']::public.event_categories[],  
      '2024-04-25T09:00:00+08:00', 
      '2024-05-22T19:00:00+08:00', 
      '2024-05-22T22:00:00+08:00', 
      '', 
      '52e401c2-632c-4d96-9e4f-08d4f1c85ddd', 
      '52e401c2-632c-4d96-9e4f-08d4f1c85ddd.png', 
      '52e401c2-632c-4d96-9e4f-08d4f1c85ddd.png',
      'MYSEAT.sg', 
      '2 Veerasamy Rd, Singapore 207305',
      'Singapore', 
      'MBTI X Singles Night', 
      58, 
      'sgd',
      'reserving', 
      user_id, 
      100
  );
END $$;

DO $$
DECLARE
  event_record RECORD;
  reservation_id uuid;
  user_ids uuid[];
  shirley_id uuid;
  event_counter integer := 0;
  random_decision integer;
  sign_up_result text;
BEGIN
  -- Fetch Shirley's user ID to exclude her from the event sign-up process
  SELECT id INTO shirley_id FROM auth.users WHERE email = 'shirley@recipe-app.fam';

  -- Fetch all event IDs and their slots
  FOR event_record IN SELECT id, slots, price, price_currency FROM public.events LOOP

    -- Increment event counter
    event_counter := event_counter + 1;

    IF event_counter = 7 THEN
      EXIT;
    END IF;

    -- Fetch user IDs from the auth.users table, limited by the number of slots for the event
    SELECT array_agg(id) INTO user_ids FROM profiles WHERE id <> shirley_id LIMIT event_record.slots;

    -- Loop through the user IDs and sign up each user for the current event
    FOR i IN 1..event_record.slots LOOP
      BEGIN
        -- Save the reservation ID from the sign-up function
        reservation_id := public.sign_up_for_event(event_record.id, user_ids[i], 1); -- 1 tix / user

      -- Update the event reservation with payment and confirmation details
      UPDATE public.event_reservations
      SET payment_status = 'paid',
          reservation_status = 'confirmed',
          payment_amount = event_record.price,
          payment_currency = event_record.price_currency
      WHERE id = reservation_id;

      EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error signing up user % for event %: %', user_ids[i], event_record.id, SQLERRM;
      END;
    END LOOP;
  END LOOP;
END $$;

-- Commit the transaction
COMMIT;

