-- ===========================================================================
-- Seed catalogue: 10 GoTour partner properties with room types.
-- Property names are GoTour's own; imagery is generic resort/scenery so no
-- photograph is presented as a specific real building.
-- ===========================================================================

INSERT INTO hotels (name, slug, destination_slug, destination_name, city, country, address,
                    short_description, description, star_rating, rating, review_count,
                    price_per_night, currency, hero_image_url, amenities, check_in_time, check_out_time,
                    latitude, longitude, featured, active,
                    created_at, updated_at, created_by, updated_by, version)
VALUES
('Ubud Canopy Retreat', 'ubud-canopy-retreat', 'bali', 'Bali', 'Ubud', 'Indonesia',
 'Jalan Raya Sanggingan, Ubud, Gianyar 80571',
 'Pool villas set into the ridge above the Ayung river, ten minutes from central Ubud.',
 'Twenty-four private villas stepped down a jungle ridge, each with its own plunge pool facing the valley. The spa runs traditional Balinese rituals, the restaurant grows most of its own vegetables, and a shuttle runs into Ubud every hour. Mornings here are mist and birdsong; the road is far enough away that you never hear it.',
 5, 4.90, 412, 18500.00, 'INR',
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80',
 'WIFI,POOL,SPA,RESTAURANT,AIRPORT_SHUTTLE,BREAKFAST,AIR_CONDITIONING',
 '14:00', '12:00', -8.5068800, 115.2624600, b'1', b'1',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Seminyak Sands Resort', 'seminyak-sands-resort', 'bali', 'Bali', 'Seminyak', 'Indonesia',
 'Jalan Kayu Aya 88, Seminyak, Badung 80361',
 'Beachfront rooms and a sunset bar on the sand, walking distance from Jalan Kayu Aya.',
 'A relaxed beachfront property on the strip between Seminyak and Petitenget. Two pools, a beach club that stays open past sunset, and boutiques and restaurants a few minutes'' walk in either direction. Rooms face either the garden or straight out to the Indian Ocean.',
 4, 4.60, 328, 11200.00, 'INR',
 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=80',
 'WIFI,POOL,BEACH_ACCESS,RESTAURANT,BAR,BREAKFAST,GYM,AIR_CONDITIONING',
 '15:00', '11:00', -8.6833300, 115.1583300, b'0', b'1',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Atoll Water Villas', 'atoll-water-villas', 'maldives', 'Maldives', 'North Male Atoll', 'Maldives',
 'North Male Atoll, Kaafu, Republic of Maldives',
 'Overwater villas with glass floors and private ladders into the house-reef lagoon.',
 'Thirty-six overwater villas on a single jetty arc, each with a sun deck, a glass floor panel and steps directly into the lagoon. The house reef starts twenty metres out, so the snorkelling needs no boat. Full-board dining includes a weekly beach dinner, and seaplane transfers are arranged around your flight times.',
 5, 4.90, 267, 46500.00, 'INR',
 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1600&q=80',
 'WIFI,POOL,SPA,RESTAURANT,BAR,DIVING,BEACH_ACCESS,AIRPORT_SHUTTLE,BREAKFAST',
 '14:00', '12:00', 4.1755000, 73.5093000, b'1', b'1',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Coral Lagoon Beach Resort', 'coral-lagoon-beach-resort', 'maldives', 'Maldives', 'South Ari Atoll', 'Maldives',
 'South Ari Atoll, Alifu Dhaalu, Republic of Maldives',
 'Beach villas on a quiet island known for whale sharks year round.',
 'A smaller, quieter island in South Ari, chosen for its position near the whale shark migration route. Beach villas open straight onto the sand, the dive centre runs two boats daily, and the whole island can be walked in fifteen minutes. Half-board and full-board options are both available.',
 4, 4.70, 189, 28900.00, 'INR',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
 'WIFI,POOL,SPA,RESTAURANT,DIVING,BEACH_ACCESS,BREAKFAST,AIRPORT_SHUTTLE',
 '14:00', '12:00', 3.4833300, 72.8333300, b'0', b'1',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Marina Skyline Hotel', 'marina-skyline-hotel', 'dubai', 'Dubai', 'Dubai', 'United Arab Emirates',
 'Sheikh Zayed Road, Dubai Marina, Dubai',
 'High-floor rooms over the Marina, two Metro stops from Downtown.',
 'A modern tower hotel in Dubai Marina with floor-to-ceiling glass and an infinity pool on the twenty-eighth floor. The Marina Walk restaurants are at street level and the Metro puts Downtown and the Burj Khalifa within fifteen minutes. Rooms above the twentieth floor look out over the water.',
 5, 4.70, 534, 16800.00, 'INR',
 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
 'WIFI,POOL,SPA,GYM,RESTAURANT,BAR,PARKING,AIRPORT_SHUTTLE,AIR_CONDITIONING',
 '15:00', '12:00', 25.0805000, 55.1403000, b'1', b'1',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Desert Rose Camp and Spa', 'desert-rose-camp-and-spa', 'dubai', 'Dubai', 'Al Marmoom', 'United Arab Emirates',
 'Al Marmoom Desert Conservation Reserve, Dubai',
 'Permanent luxury tents in the conservation reserve, an hour from the city.',
 'Twenty canvas suites with proper beds, ensuites and air conditioning, set far enough into the Al Marmoom reserve that there is no light pollution at all. Dune drives and falconry run at golden hour, dinner is served around a central fire, and the stargazing is the reason most guests stay a second night.',
 4, 4.80, 156, 22400.00, 'INR',
 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
 'WIFI,SPA,RESTAURANT,AIRPORT_SHUTTLE,BREAKFAST,AIR_CONDITIONING',
 '16:00', '11:00', 24.8000000, 55.4000000, b'0', b'1',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Alpine Lake Lodge', 'alpine-lake-lodge', 'swiss-alps', 'Swiss Alps', 'Interlaken', 'Switzerland',
 'Hoheweg 42, 3800 Interlaken, Bern',
 'A timber lodge between the lakes, five minutes from Interlaken Ost station.',
 'A family-run lodge on the strip between Lake Thun and Lake Brienz, with balconies facing the Jungfrau massif. The station for the Jungfraujoch railway is a five-minute walk, and the hotel holds a stock of regional travel passes. Breakfast is included and served until ten.',
 4, 4.80, 243, 24600.00, 'INR',
 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80',
 'WIFI,RESTAURANT,BAR,SPA,PARKING,BREAKFAST,PET_FRIENDLY',
 '15:00', '11:00', 46.6863200, 7.8632100, b'1', b'1',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Rockies Panorama Lodge', 'rockies-panorama-lodge', 'banff', 'Banff', 'Banff', 'Canada',
 '405 Spray Avenue, Banff, Alberta T1L 1J4',
 'A mountain lodge inside the national park, ten minutes from Banff Avenue.',
 'Built from local timber and stone, with most rooms facing Sulphur Mountain or the Bow valley. There is an outdoor hot pool that stays open through the winter, a ski shuttle in season, and the Banff Gondola is a short drive away. Elk regularly wander through the grounds at dusk.',
 4, 4.70, 198, 26800.00, 'INR',
 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80',
 'WIFI,POOL,SPA,RESTAURANT,BAR,PARKING,GYM,BREAKFAST',
 '16:00', '11:00', 51.1650000, 115.5700000, b'0', b'1',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Ligurian Cliff Hotel', 'ligurian-cliff-hotel', 'cinque-terre', 'Cinque Terre', 'Riomaggiore', 'Italy',
 'Via Colombo 15, 19017 Riomaggiore, La Spezia',
 'A converted village house above Riomaggiore harbour, on the coastal trail.',
 'Eleven rooms in a restored pastel house stacked above the harbour, with the Sentiero Azzurro trailhead directly outside. Breakfast is served on a terrace over the water. There is no lift and the village has no cars, so pack light — the walk up from the station is five minutes of steps.',
 3, 4.60, 167, 14200.00, 'INR',
 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80',
 'WIFI,RESTAURANT,BREAKFAST,SEA_VIEW,AIR_CONDITIONING',
 '14:00', '10:00', 44.0996000, 9.7374000, b'0', b'1',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Andaman Shores Resort', 'andaman-shores-resort', 'phuket', 'Phuket', 'Phuket', 'Thailand',
 '88 Moo 3, Mai Khao, Thalang, Phuket 83110',
 'A quiet north-coast resort on an eleven-kilometre stretch of beach.',
 'Set on Mai Khao, the longest and least developed beach on Phuket, twenty minutes from the airport and well away from the Patong crowds. Two pools, a beachfront restaurant, and a turtle conservation project that guests can visit between November and February.',
 4, 4.50, 389, 8900.00, 'INR',
 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
 'WIFI,POOL,SPA,RESTAURANT,BAR,BEACH_ACCESS,GYM,BREAKFAST,AIRPORT_SHUTTLE',
 '14:00', '12:00', 8.1833300, 98.3000000, b'1', b'1',
 UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0);

-- ------------------------------------------------------------------- rooms
INSERT INTO hotel_rooms (hotel_id, room_type, description, price_per_night, capacity, bed_type,
                         size_sqm, total_rooms, rooms_booked, image_url,
                         created_at, updated_at, created_by, updated_by, version)
SELECT h.id, v.room_type, v.description,
       ROUND(h.price_per_night * v.price_factor, 2), v.capacity, v.bed_type,
       v.size_sqm, v.total_rooms, v.rooms_booked, h.hero_image_url,
       UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0
FROM hotels h
         JOIN (
    SELECT 'Deluxe Room' AS room_type,
           'A comfortable base room with a garden or city outlook, work desk and rainfall shower.' AS description,
           1.00 AS price_factor, 2 AS capacity, 'King' AS bed_type, 32 AS size_sqm,
           14 AS total_rooms, 4 AS rooms_booked
    UNION ALL SELECT 'Premium Suite',
           'A separate living area, a larger terrace and the better outlook on the property.',
           1.65, 3, 'King', 58, 8, 3
    UNION ALL SELECT 'Family Room',
           'Two connecting bedrooms sharing a lounge, sleeping up to four adults or two adults and three children.',
           1.95, 4, '1 King + 2 Twin', 72, 6, 2
) v
WHERE h.active = b'1';
