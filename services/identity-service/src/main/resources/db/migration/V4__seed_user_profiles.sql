-- Profiles matching the auth-service development seed accounts.
INSERT INTO user_profiles (user_id, email, full_name, phone, nationality, preferred_currency,
                           marketing_opt_in, created_at, updated_at, created_by, updated_by, version)
VALUES (1, 'admin@gotour.com', 'GoTour Administrator', '+91 9000000001', 'India', 'INR', b'0',
        UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),
       (2, 'customer@gotour.com', 'Demo Traveller', '+91 9000000002', 'India', 'INR', b'1',
        UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0);
