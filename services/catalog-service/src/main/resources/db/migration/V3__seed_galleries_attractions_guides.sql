-- ===========================================================================
-- Galleries, nearby attractions and travel guides.
-- Rows are attached by slug so they survive any change to auto-increment ids.
-- ===========================================================================

INSERT INTO destination_images (destination_id, image_url, caption, sort_order,
                                created_at, updated_at, created_by, updated_by, version)
SELECT d.id, v.image_url, v.caption, v.sort_order,
       UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0
FROM destinations d
         JOIN (
    SELECT 'bali' AS slug, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80' AS image_url, 'Private pool villas backing onto the jungle' AS caption, 1 AS sort_order
    UNION ALL SELECT 'bali', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1400&q=80', 'Turquoise shallows off the southern coast', 2
    UNION ALL SELECT 'maldives', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80', 'Sunset over an empty stretch of sand', 1
    UNION ALL SELECT 'maldives', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1400&q=80', 'The lagoon from the air', 2
    UNION ALL SELECT 'maldives', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80', 'Resort pool opening onto the palms', 3
    UNION ALL SELECT 'dubai', 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1400&q=80', 'Burj Al Arab on its own island', 1
    UNION ALL SELECT 'dubai', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80', 'The desert road out of the city', 2
    UNION ALL SELECT 'agra', 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80', 'The Taj framed by the great gate', 1
    UNION ALL SELECT 'phuket', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1400&q=80', 'Longtails moored in the shallows', 1
    UNION ALL SELECT 'phuket', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80', 'Andaman sunset', 2
    UNION ALL SELECT 'phuket', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80', 'Resort pool a few steps from the beach', 3
) v ON v.slug = d.slug;

-- image_url is intentionally left null: these points of interest have no
-- verified photography, and the UI falls back to a styled category card.
INSERT INTO attractions (destination_id, name, description, category, distance_km, sort_order,
                         created_at, updated_at, created_by, updated_by, version)
SELECT d.id, v.name, v.description, v.category, v.distance_km, v.sort_order,
       UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0
FROM destinations d
         JOIN (
    SELECT 'bali' AS slug, 'Tegallalang Rice Terraces' AS name, 'Stepped paddies carved into the valley above Ubud, best at first light before the tour buses arrive.' AS description, 'Nature' AS category, 9.50 AS distance_km, 1 AS sort_order
    UNION ALL SELECT 'bali', 'Uluwatu Temple', 'An eleventh-century sea temple on a seventy-metre cliff, with a kecak fire dance at sunset.', 'Heritage', 33.00, 2
    UNION ALL SELECT 'bali', 'Mount Batur Sunrise Trek', 'A two-hour pre-dawn climb up an active volcano, finishing above the cloud line.', 'Adventure', 62.00, 3
    UNION ALL SELECT 'maldives', 'Hanifaru Bay', 'A UNESCO biosphere where manta rays and whale sharks gather to feed between May and November.', 'Wildlife', 0.00, 1
    UNION ALL SELECT 'maldives', 'Male Fish Market', 'The working heart of the capital, and the easiest way to see everyday Maldivian life.', 'Culture', 0.00, 2
    UNION ALL SELECT 'dubai', 'Burj Khalifa', 'The tallest building in the world; book the level 148 deck and go an hour before sunset.', 'Landmark', 2.00, 1
    UNION ALL SELECT 'dubai', 'Dubai Creek and Al Fahidi', 'Wind-tower houses, the textile souk and an abra crossing that still costs a single dirham.', 'Heritage', 5.00, 2
    UNION ALL SELECT 'dubai', 'Desert Conservation Reserve', 'Dune drives, falconry and dinner under the stars an hour outside the city.', 'Adventure', 55.00, 3
    UNION ALL SELECT 'agra', 'Taj Mahal', 'Shah Jahan''s marble mausoleum for Mumtaz Mahal, completed in 1653 and best seen at sunrise.', 'Heritage', 0.00, 1
    UNION ALL SELECT 'agra', 'Agra Fort', 'The red sandstone seat of Mughal power, and the place Shah Jahan spent his final years.', 'Heritage', 2.50, 2
    UNION ALL SELECT 'agra', 'Mehtab Bagh', 'A riverside garden directly across the Yamuna, aligned with the Taj and almost empty at dusk.', 'Nature', 4.00, 3
    UNION ALL SELECT 'jaipur', 'Amber Fort', 'A hilltop fort-palace above Maota Lake, with the mirrored Sheesh Mahal at its centre.', 'Heritage', 11.00, 1
    UNION ALL SELECT 'jaipur', 'Hawa Mahal', 'The palace of winds: 953 lattice windows built so royal women could watch the street unseen.', 'Landmark', 0.50, 2
    UNION ALL SELECT 'jaipur', 'Jantar Mantar', 'Eighteenth-century astronomical instruments built at architectural scale, still accurate today.', 'Heritage', 1.00, 3
    UNION ALL SELECT 'tokyo', 'Senso-ji Temple', 'Tokyo''s oldest temple, approached through the lantern gate and market street of Nakamise.', 'Heritage', 6.00, 1
    UNION ALL SELECT 'tokyo', 'Shibuya Crossing', 'The busiest pedestrian crossing on earth; watch it from the Shibuya Sky deck above.', 'Landmark', 0.00, 2
    UNION ALL SELECT 'tokyo', 'Meiji Jingu', 'A Shinto shrine set in seventy hectares of planted forest, minutes from Harajuku.', 'Nature', 3.50, 3
    UNION ALL SELECT 'singapore', 'Gardens by the Bay', 'Supertree Grove, the Cloud Forest dome, and a light show every night at 7.45pm.', 'Nature', 1.50, 1
    UNION ALL SELECT 'singapore', 'Jewel Changi', 'The world''s tallest indoor waterfall, wrapped in a forest valley inside the airport.', 'Landmark', 17.00, 2
    UNION ALL SELECT 'venice', 'St Mark''s Basilica', 'Byzantine domes and eight thousand square metres of gold mosaic; book a skip-the-line slot.', 'Heritage', 0.00, 1
    UNION ALL SELECT 'venice', 'Burano', 'Forty minutes by vaporetto to painted fishermen''s houses and a leaning bell tower.', 'Culture', 7.00, 2
    UNION ALL SELECT 'swiss-alps', 'Jungfraujoch', 'Europe''s highest railway station at 3,454m, opening onto the Aletsch Glacier.', 'Mountains', 24.00, 1
    UNION ALL SELECT 'swiss-alps', 'Lauterbrunnen Valley', 'Seventy-two waterfalls in a single glacial trench; the Staubbach falls drop almost 300m.', 'Nature', 12.00, 2
    UNION ALL SELECT 'banff', 'Moraine Lake', 'Ten glacial peaks above water the colour of antifreeze. Shuttle access only in season.', 'Nature', 14.00, 1
    UNION ALL SELECT 'banff', 'Icefields Parkway', 'A 230km drive to Jasper past the Columbia Icefield, widely rated one of the world''s best.', 'Adventure', 5.00, 2
    UNION ALL SELECT 'london', 'British Museum', 'Eight million objects across two million years of history, and free to enter.', 'Culture', 2.00, 1
    UNION ALL SELECT 'london', 'Tower of London', 'A working fortress since 1066, still holding the Crown Jewels.', 'Heritage', 4.00, 2
    UNION ALL SELECT 'cape-town', 'Table Mountain', 'Rotating cable car to a flat summit 1,085m above the city, weather permitting.', 'Mountains', 5.00, 1
    UNION ALL SELECT 'cape-town', 'Cape of Good Hope', 'The south-western tip of Africa, with baboons on the road and whales offshore in season.', 'Nature', 70.00, 2
    UNION ALL SELECT 'cape-town', 'Boulders Beach', 'A colony of around two thousand African penguins on a sheltered white-sand cove.', 'Wildlife', 42.00, 3
    UNION ALL SELECT 'phuket', 'Phang Nga Bay', 'Limestone karsts rising straight out of the sea, explored by longtail or sea kayak.', 'Nature', 45.00, 1
    UNION ALL SELECT 'phuket', 'Big Buddha', 'A 45m marble figure on Nakkerd Hill with a 360-degree view over the island.', 'Landmark', 15.00, 2
    UNION ALL SELECT 'cinque-terre', 'Sentiero Azzurro', 'The blue trail linking all five villages along the cliffs; a permit is required in season.', 'Hiking', 0.00, 1
    UNION ALL SELECT 'paris', 'Musee d''Orsay', 'The world''s finest Impressionist collection, inside a Beaux-Arts railway station.', 'Culture', 2.00, 1
    UNION ALL SELECT 'paris', 'Montmartre', 'The old artists'' quarter around Sacre-Coeur, still a village once you leave the main square.', 'Culture', 5.00, 2
) v ON v.slug = d.slug;

INSERT INTO travel_guides (destination_id, category, title, content, sort_order,
                           created_at, updated_at, created_by, updated_by, version)
SELECT d.id, v.category, v.title, v.content, v.sort_order,
       UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0
FROM destinations d
         JOIN (
    SELECT 'bali' AS slug, 'Getting around' AS category, 'Scooters, drivers and traffic' AS title, 'Distances look short and take twice as long as the map suggests. Hiring a driver for the day is inexpensive and far less stressful than a scooter if you are not already confident riding. Base yourself in one area at a time rather than crossing the island daily.' AS content, 1 AS sort_order
    UNION ALL SELECT 'bali', 'Etiquette', 'Temple dress and offerings', 'A sarong and sash are required at temples and are usually available at the entrance. Step around the small palm-leaf canang sari offerings on the pavement rather than over them.', 2
    UNION ALL SELECT 'bali', 'Money', 'Cash, cards and the tourist levy', 'Cards work in hotels and larger restaurants; warungs and markets are cash only. Indonesia charges a tourist levy on arrival in Bali which is easiest to pay online before you fly.', 3
    UNION ALL SELECT 'maldives', 'Getting around', 'Speedboat versus seaplane', 'Your transfer is set by which atoll your resort sits in. Seaplanes only fly in daylight, so a late arrival can mean an unplanned night in Male. Check transfer times and cost before booking a resort, as they are rarely included.', 1
    UNION ALL SELECT 'maldives', 'Planning', 'Resort islands and local islands', 'Resort islands are private and permit alcohol; inhabited local islands follow local law, so dress modestly and expect no alcohol. Guesthouses on local islands are a fraction of the price.', 2
    UNION ALL SELECT 'dubai', 'Weather', 'When to go, and when not to', 'November to March is comfortable. June to September regularly exceeds 45C and outdoor plans become impractical, though hotel rates drop sharply to compensate.', 1
    UNION ALL SELECT 'dubai', 'Etiquette', 'Dress and public behaviour', 'Dress is relaxed in hotels and malls but cover shoulders and knees in older districts and at mosques. Public displays of affection and drinking outside licensed venues are not permitted.', 2
    UNION ALL SELECT 'agra', 'Planning', 'Timing your Taj visit', 'Enter at sunrise for the best light and the smallest crowds. The monument closes on Fridays. Tickets are cheaper booked online, and the ticket includes shoe covers and a bottle of water.', 1
    UNION ALL SELECT 'agra', 'Getting there', 'The train from Delhi', 'The Gatimaan Express reaches Agra in about 100 minutes and is far more comfortable than driving. Book well ahead in peak season.', 2
    UNION ALL SELECT 'jaipur', 'Shopping', 'Buying well in the bazaars', 'Johari Bazaar for gems, Bapu Bazaar for textiles and juttis. Bargaining is expected; settle at roughly half the opening price. Government emporiums are fixed-price if you would rather not haggle.', 1
    UNION ALL SELECT 'tokyo', 'Getting around', 'IC cards beat rail passes', 'For a city-only trip a Suica or Pasmo card is far better value than a Japan Rail Pass. Trains stop around midnight and taxis after that are expensive.', 1
    UNION ALL SELECT 'tokyo', 'Etiquette', 'Small rules that matter', 'No eating while walking, no phone calls on trains, and cash is still king in older restaurants. Tipping is not practised and can cause confusion.', 2
    UNION ALL SELECT 'singapore', 'Food', 'Hawker centres', 'Maxwell, Lau Pa Sat and Tiong Bahru are the classics. Reserve a table by leaving a packet of tissues on it, which is a genuine local convention rather than a joke.', 1
    UNION ALL SELECT 'venice', 'Planning', 'Beating the day-trip crowd', 'Cruise arrivals dominate 10am to 4pm around San Marco. Stay overnight and you get the city at dawn and after dinner nearly to yourself. A day-visitor access fee applies on peak dates.', 1
    UNION ALL SELECT 'swiss-alps', 'Money', 'Travel passes', 'Mountain railways are expensive at full fare. A Swiss Travel Pass or a regional Berner Oberland pass usually pays for itself within three days of active sightseeing.', 1
    UNION ALL SELECT 'banff', 'Planning', 'Park passes and shuttles', 'A national park pass is required for every vehicle. Moraine Lake is closed to private cars, so book the shuttle or a licensed operator in advance during summer.', 1
    UNION ALL SELECT 'london', 'Getting around', 'Contactless and zones', 'Tap in and out with a contactless card or phone; it automatically caps at the best daily fare, so a paper travelcard is rarely worth buying.', 1
    UNION ALL SELECT 'cape-town', 'Safety', 'Sensible precautions', 'Cape Town is straightforward by day. Use ride-hailing after dark, avoid displaying phones and cameras on the street, and hike Table Mountain in a group on the marked routes.', 1
    UNION ALL SELECT 'phuket', 'Getting around', 'Transport costs', 'Metered taxis are rare and tuk-tuk fares are negotiated. Ride-hailing apps work in most of the island and cost a fraction of the tourist rate. Rent a scooter only with the correct licence and a helmet.', 1
    UNION ALL SELECT 'paris', 'Planning', 'Museums and queues', 'Most national museums close on either Monday or Tuesday, so check before you go. Timed online tickets are effectively mandatory for the Louvre and the Eiffel Tower.', 1
) v ON v.slug = d.slug;
