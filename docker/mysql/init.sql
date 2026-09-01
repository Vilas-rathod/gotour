-- Creates one schema per core service. Flyway builds the tables and seeds data
-- on each service's first start.
CREATE DATABASE IF NOT EXISTS gotour_identity   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS gotour_catalog     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS gotour_booking     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS gotour_engagement  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
