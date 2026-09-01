-- ===========================================================================
-- Highlights, inclusions, exclusions, day-by-day itineraries and departures.
-- Attached by package slug so ids never need to be hard-coded.
-- ===========================================================================

-- ---------------------------------------------------------------- highlights
INSERT INTO package_detail_items (package_id, item_type, text, sort_order,
                                  created_at, updated_at, created_by, updated_by, version)
SELECT p.id, 'HIGHLIGHT', v.text, v.sort_order,
       UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0
FROM tour_packages p
         JOIN (
    SELECT 'bali-honeymoon-escape' AS slug, 'Private pool villa overlooking the Ayung river' AS text, 1 AS sort_order
    UNION ALL SELECT 'bali-honeymoon-escape', 'Floating breakfast served in your own pool', 2
    UNION ALL SELECT 'bali-honeymoon-escape', 'Couples spa ritual with a Balinese flower bath', 3
    UNION ALL SELECT 'bali-honeymoon-escape', 'Sunset catamaran cruise off Benoa', 4
    UNION ALL SELECT 'bali-explorer', 'Sunrise trek to the summit of Mount Batur', 1
    UNION ALL SELECT 'bali-explorer', 'Downhill cycle through the Tegallalang terraces', 2
    UNION ALL SELECT 'bali-explorer', 'Kecak fire dance on the Uluwatu cliffs', 3
    UNION ALL SELECT 'maldives-overwater-retreat', 'Overwater villa with a glass floor and lagoon ladder', 1
    UNION ALL SELECT 'maldives-overwater-retreat', 'Return seaplane transfers included', 2
    UNION ALL SELECT 'maldives-overwater-retreat', 'Two guided dive days on the atoll reef walls', 3
    UNION ALL SELECT 'maldives-overwater-retreat', 'Private beach dinner under the stars', 4
    UNION ALL SELECT 'dubai-city-and-desert', 'Burj Khalifa level 148 observation deck', 1
    UNION ALL SELECT 'dubai-city-and-desert', 'Overnight desert camp with falconry at sunset', 2
    UNION ALL SELECT 'dubai-city-and-desert', 'Abra crossing and the old Deira souks', 3
    UNION ALL SELECT 'golden-triangle-heritage', 'Sunrise entry to the Taj Mahal', 1
    UNION ALL SELECT 'golden-triangle-heritage', 'Gatimaan Express between Delhi and Agra', 2
    UNION ALL SELECT 'golden-triangle-heritage', 'Amber Fort and the Jaipur bazaars with a local guide', 3
    UNION ALL SELECT 'royal-rajasthan', 'One night in a converted heritage fort', 1
    UNION ALL SELECT 'royal-rajasthan', 'Mehrangarh Fort above the blue city of Jodhpur', 2
    UNION ALL SELECT 'royal-rajasthan', 'Sunset boat on Lake Pichola, Udaipur', 3
    UNION ALL SELECT 'tokyo-and-beyond', 'Ryokan night in Hakone with a private onsen', 1
    UNION ALL SELECT 'tokyo-and-beyond', 'Golden Gai and a Tsukiji market breakfast', 2
    UNION ALL SELECT 'tokyo-and-beyond', 'Lake Ashi cruise with Mount Fuji on the skyline', 3
    UNION ALL SELECT 'singapore-family-break', 'Gardens by the Bay and the Cloud Forest dome', 1
    UNION ALL SELECT 'singapore-family-break', 'Full day on Sentosa island', 2
    UNION ALL SELECT 'singapore-family-break', 'Night Safari tram ride', 3
    UNION ALL SELECT 'venice-and-italian-lakes', 'Dawn vaporetto through the empty lagoon', 1
    UNION ALL SELECT 'venice-and-italian-lakes', 'Cicchetti crawl through Cannaregio', 2
    UNION ALL SELECT 'venice-and-italian-lakes', 'Private boat around the villas of Lake Como', 3
    UNION ALL SELECT 'swiss-alps-rail-journey', 'Jungfraujoch, Europe''s highest railway station', 1
    UNION ALL SELECT 'swiss-alps-rail-journey', 'The Glacier Express from Zermatt to Chur', 2
    UNION ALL SELECT 'swiss-alps-rail-journey', 'Regional rail pass included throughout', 3
    UNION ALL SELECT 'canadian-rockies-discovery', 'Moraine Lake and Lake Louise at first light', 1
    UNION ALL SELECT 'canadian-rockies-discovery', 'Guided glacier walk on the Columbia Icefield', 2
    UNION ALL SELECT 'canadian-rockies-discovery', 'The full Icefields Parkway to Jasper', 3
    UNION ALL SELECT 'phuket-island-weekender', 'Phang Nga Bay by longtail with sea-cave kayaking', 1
    UNION ALL SELECT 'phuket-island-weekender', 'Wat Chalong and the Big Buddha viewpoint', 2
    UNION ALL SELECT 'phuket-island-weekender', 'Two free days on the quieter north beaches', 3
) v ON v.slug = p.slug;

-- ---------------------------------------------------------------- inclusions
INSERT INTO package_detail_items (package_id, item_type, text, sort_order,
                                  created_at, updated_at, created_by, updated_by, version)
SELECT p.id, 'INCLUSION', v.text, v.sort_order,
       UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0
FROM tour_packages p
         JOIN (
    SELECT 'Accommodation for the full duration as described' AS text, 1 AS sort_order
    UNION ALL SELECT 'Daily breakfast, plus meals listed in the itinerary', 2
    UNION ALL SELECT 'All airport and inter-city transfers', 3
    UNION ALL SELECT 'Entry tickets for every sight in the itinerary', 4
    UNION ALL SELECT 'English-speaking local guide throughout', 5
    UNION ALL SELECT 'All applicable taxes and service charges', 6
) v
WHERE p.active = b'1';

-- ---------------------------------------------------------------- exclusions
INSERT INTO package_detail_items (package_id, item_type, text, sort_order,
                                  created_at, updated_at, created_by, updated_by, version)
SELECT p.id, 'EXCLUSION', v.text, v.sort_order,
       UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0
FROM tour_packages p
         JOIN (
    SELECT 'International and domestic airfare' AS text, 1 AS sort_order
    UNION ALL SELECT 'Visa fees and travel insurance', 2
    UNION ALL SELECT 'Meals not specified in the itinerary', 3
    UNION ALL SELECT 'Personal expenses, laundry and minibar', 4
    UNION ALL SELECT 'Optional activities and tipping', 5
) v
WHERE p.active = b'1';

-- ----------------------------------------------------------------- itinerary
INSERT INTO package_itinerary_days (package_id, day_number, title, description, meals, accommodation,
                                    created_at, updated_at, created_by, updated_by, version)
SELECT p.id, v.day_number, v.title, v.description, v.meals, v.accommodation,
       UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0
FROM tour_packages p
         JOIN (
    SELECT 'bali-honeymoon-escape' AS slug, 1 AS day_number, 'Arrive in Bali, transfer to Ubud' AS title, 'Met at Denpasar and driven north through the rice country to your villa above the Ayung river. The rest of the day is yours; dinner is served on the terrace.' AS description, 'Dinner' AS meals, 'Ubud jungle villa' AS accommodation
    UNION ALL SELECT 'bali-honeymoon-escape', 2, 'Water temples and a floating breakfast', 'Breakfast is floated into your pool at sunrise. Later, a guided morning at Tirta Empul and Ulun Danu Beratan, back in time for the sunset from the villa deck.', 'Breakfast', 'Ubud jungle villa'
    UNION ALL SELECT 'bali-honeymoon-escape', 3, 'Spa ritual and Ubud at your own pace', 'A three-hour couples ritual finishing with a Balinese flower bath. The afternoon is free for the Ubud market, the Monkey Forest or simply the pool.', 'Breakfast', 'Ubud jungle villa'
    UNION ALL SELECT 'bali-honeymoon-escape', 4, 'Tegallalang and the road south', 'A morning among the terraces before transferring to the coast at Seminyak, arriving in time for sunset drinks on the beach.', 'Breakfast', 'Seminyak beach resort'
    UNION ALL SELECT 'bali-honeymoon-escape', 5, 'Uluwatu and the kecak dance', 'A slow start, then out to the Bukit peninsula for the clifftop temple at Uluwatu and the kecak fire dance as the sun goes down. Seafood dinner at Jimbaran afterwards.', 'Breakfast, Dinner', 'Seminyak beach resort'
    UNION ALL SELECT 'bali-honeymoon-escape', 6, 'Sunset catamaran cruise', 'The day is free until late afternoon, when a catamaran takes you out of Benoa for canapes and the sunset from the water.', 'Breakfast', 'Seminyak beach resort'
    UNION ALL SELECT 'bali-honeymoon-escape', 7, 'A free day in Seminyak', 'Nothing scheduled. Beach clubs, the boutiques on Jalan Kayu Aya, or another spa afternoon if you would rather.', 'Breakfast', 'Seminyak beach resort'
    UNION ALL SELECT 'bali-honeymoon-escape', 8, 'Departure', 'Transfer to Denpasar for your flight home.', 'Breakfast', NULL

    UNION ALL SELECT 'golden-triangle-heritage', 1, 'Arrive in Delhi', 'Airport transfer and an afternoon in Old Delhi by cycle rickshaw, taking in Jama Masjid and the lanes of Chandni Chowk.', 'Dinner', 'Delhi heritage hotel'
    UNION ALL SELECT 'golden-triangle-heritage', 2, 'Delhi to Agra by express train', 'The Gatimaan Express gets you to Agra before lunch. The afternoon is spent at Agra Fort, ending at Mehtab Bagh across the river for sunset.', 'Breakfast, Dinner', 'Agra heritage hotel'
    UNION ALL SELECT 'golden-triangle-heritage', 3, 'Taj Mahal at sunrise, on to Jaipur', 'Enter the Taj as the gates open, then drive west to Jaipur via the abandoned Mughal city of Fatehpur Sikri and the Chand Baori stepwell.', 'Breakfast', 'Jaipur heritage hotel'
    UNION ALL SELECT 'golden-triangle-heritage', 4, 'Amber Fort and the Pink City', 'Amber Fort in the morning before the heat, then Jantar Mantar, the City Palace and Hawa Mahal, finishing in the bazaars.', 'Breakfast, Dinner', 'Jaipur heritage hotel'
    UNION ALL SELECT 'golden-triangle-heritage', 5, 'Jaipur at leisure', 'A free morning for shopping or the Albert Hall Museum, then an evening drive back towards Delhi.', 'Breakfast', 'Delhi heritage hotel'
    UNION ALL SELECT 'golden-triangle-heritage', 6, 'Departure', 'Transfer to Delhi airport for your onward flight.', 'Breakfast', NULL

    UNION ALL SELECT 'dubai-city-and-desert', 1, 'Arrive in Dubai', 'Transfer to your hotel and an evening at Dubai Mall for the fountain show beneath the Burj Khalifa.', 'Dinner', 'Downtown Dubai hotel'
    UNION ALL SELECT 'dubai-city-and-desert', 2, 'Burj Khalifa and old Dubai', 'Level 148 in the morning, then across the creek by abra to Al Fahidi''s wind-tower houses and the textile souk.', 'Breakfast', 'Downtown Dubai hotel'
    UNION ALL SELECT 'dubai-city-and-desert', 3, 'Into the desert', 'Afternoon dune drive into the Al Marmoom reserve, falconry at golden hour, dinner around the fire and a night in a desert camp.', 'Breakfast, Dinner', 'Desert camp'
    UNION ALL SELECT 'dubai-city-and-desert', 4, 'Back to the city and the souks', 'Return to Dubai in the morning, with the afternoon free for the gold and spice souks of Deira or the beach at Jumeirah.', 'Breakfast', 'Downtown Dubai hotel'
    UNION ALL SELECT 'dubai-city-and-desert', 5, 'Departure', 'Transfer to the airport.', 'Breakfast', NULL

    UNION ALL SELECT 'phuket-island-weekender', 1, 'Arrive in Phuket', 'Transfer to the north coast and a free evening on the beach.', 'Dinner', 'Phuket beach resort'
    UNION ALL SELECT 'phuket-island-weekender', 2, 'Phang Nga Bay by longtail', 'A full day among the limestone karsts, with kayaking through the sea caves and lunch on the boat.', 'Breakfast, Lunch', 'Phuket beach resort'
    UNION ALL SELECT 'phuket-island-weekender', 3, 'Temples and a free afternoon', 'Wat Chalong and the Big Buddha viewpoint in the morning; the afternoon is yours.', 'Breakfast', 'Phuket beach resort'
    UNION ALL SELECT 'phuket-island-weekender', 4, 'Departure', 'Transfer to Phuket airport.', 'Breakfast', NULL
) v ON v.slug = p.slug;

-- ---------------------------------------------------------------- departures
-- Six monthly departures per active package, starting next month.
INSERT INTO package_availability (package_id, departure_date, seats_total, seats_booked, price_override,
                                  created_at, updated_at, created_by, updated_by, version)
SELECT p.id,
       DATE_ADD(DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL n.n MONTH), '%Y-%m-01'), INTERVAL 9 DAY),
       COALESCE(p.max_group_size, 20),
       FLOOR(COALESCE(p.max_group_size, 20) * 0.35),
       NULL,
       UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0
FROM tour_packages p
         JOIN (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3
               UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) n
WHERE p.active = b'1';
