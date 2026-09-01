-- ===========================================================================
-- Development seed accounts.
--
--   admin@gotour.com    / Admin@123      (ADMIN)
--   customer@gotour.com / Customer@123   (CUSTOMER)
--
-- Passwords are BCrypt (strength 12). Change or remove these before any
-- deployment that is reachable outside a developer machine.
-- ===========================================================================

INSERT INTO users (email, password_hash, full_name, phone, enabled, email_verified,
                   failed_login_attempts, created_at, updated_at, created_by, updated_by, version)
VALUES ('admin@gotour.com',
        '$2a$12$0sHcyvMYHnxezn2.NZKnjOB04Xjoo8iLidkf1bhyCpwabVqWUJNve',
        'GoTour Administrator', '+91 9000000001', b'1', b'1', 0,
        UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),
       ('customer@gotour.com',
        '$2a$12$bMsj0bdQuclPYMvkSfdTEeWm0i4v3MFzcnBqCBiegdWGk3RVjqMZy',
        'Demo Traveller', '+91 9000000002', b'1', b'1', 0,
        UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0);

INSERT INTO user_roles (user_id, role)
SELECT id, 'ADMIN' FROM users WHERE email = 'admin@gotour.com';

INSERT INTO user_roles (user_id, role)
SELECT id, 'CUSTOMER' FROM users WHERE email IN ('admin@gotour.com', 'customer@gotour.com');
