-- Insert 12 mock reviews for pagination testing
DO $$
DECLARE
    v_user_id UUID;
    v_shop_id UUID := 'dfee852d-8b82-4228-b1d4-f655848d5d1f'; -- Jenny House Premium used in mock seed
BEGIN
    -- Get a user ID (any user)
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    -- If no user found in auth.users, try profiles (for local dev safety)
    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM profiles LIMIT 1;
    END IF;

    -- If still no user, we cannot insert
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No user found to assign reviews to';
        RETURN;
    END IF;

    -- 1. Long review for "Read More" test
    INSERT INTO reviews (user_id, shop_id, rating, content, created_at)
    VALUES (v_user_id, v_shop_id, 5, 'This is a very long review to test the read more functionality. I really enjoyed the service here. The staff was incredibly friendly and professional. The atmosphere was relaxing and clean. I would definitely recommend this place to my friends and family. It exceeded my expectations in every way possible. The haircut was perfect and the styling lasted all day long. Thank you so much!', NOW() - INTERVAL '1 day');

    -- 2. Short review
    INSERT INTO reviews (user_id, shop_id, rating, content, created_at)
    VALUES (v_user_id, v_shop_id, 4, 'Great service, will come again!', NOW() - INTERVAL '2 days');

    -- 3. Medium review
    INSERT INTO reviews (user_id, shop_id, rating, content, created_at)
    VALUES (v_user_id, v_shop_id, 5, 'Loved the hair treatment. My hair feels so soft and shiny now.', NOW() - INTERVAL '3 days');

    -- 4. Another long review
    INSERT INTO reviews (user_id, shop_id, rating, content, created_at)
    VALUES (v_user_id, v_shop_id, 3, 'The cut was okay but I had to wait for 30 minutes even with a reservation. Ideally they should manage time better. However, the stylist was apologetic and gave me a discount coupon for next time, which was a nice gesture. I might give them another try.', NOW() - INTERVAL '4 days');

    -- 5-12. Bulk insert for pagination
    INSERT INTO reviews (user_id, shop_id, rating, content, created_at) VALUES 
    (v_user_id, v_shop_id, 5, 'Absolutely fantastic experience!', NOW() - INTERVAL '5 days'),
    (v_user_id, v_shop_id, 4, 'Good value for money.', NOW() - INTERVAL '6 days'),
    (v_user_id, v_shop_id, 5, 'Best salon in the area.', NOW() - INTERVAL '7 days'),
    (v_user_id, v_shop_id, 2, 'Not what I expected based on other reviews.', NOW() - INTERVAL '8 days'),
    (v_user_id, v_shop_id, 5, 'Stylish interior and skilled designers.', NOW() - INTERVAL '9 days'),
    (v_user_id, v_shop_id, 4, 'Pleasant experience overall.', NOW() - INTERVAL '10 days'),
    (v_user_id, v_shop_id, 5, 'Highly recommended!', NOW() - INTERVAL '11 days'),
    (v_user_id, v_shop_id, 3, 'It was average.', NOW() - INTERVAL '12 days');

END $$;
