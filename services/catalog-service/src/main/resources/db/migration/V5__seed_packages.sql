-- ===========================================================================
-- Seed catalogue: 12 tour packages across the destination set.
-- Prices are in INR. Hero imagery matches the destination it belongs to.
-- ===========================================================================

INSERT INTO tour_packages (title, slug, destination_slug, destination_name, destination_country, summary,
                           description, duration_days, duration_nights, price, discount_price, currency,
                           package_type, travel_style, rating, review_count, booking_count, max_group_size,
                           hero_image_url, featured, trending, active,
                           created_at, updated_at, created_by, updated_by, version)
VALUES
('Bali Honeymoon Escape', 'bali-honeymoon-escape', 'bali', 'Bali', 'Indonesia',
 'Seven nights across Ubud and Seminyak with a private pool villa, spa rituals and a sunset cruise.',
 'A honeymoon itinerary built around slowing down. Four nights in a jungle villa above the Ayung river in Ubud, with a private breakfast floated into your pool, then three nights on the coast at Seminyak for sunsets and beach clubs. Includes a couples spa ritual, a guided water temple morning, and a catamaran cruise off Benoa on your final evening.',
 8, 7, 145000.00, 118000.00, 'INR', 'HONEYMOON', 'LUXURY', 4.90, 218, 486, 2,
 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80',
 b'1', b'1', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Bali Explorer', 'bali-explorer', 'bali', 'Bali', 'Indonesia',
 'Volcano sunrise, rice terraces and the Uluwatu cliffs in six well-paced days.',
 'The island without the resort bubble. Trek Mount Batur before dawn, cycle down through the Tegallalang terraces, chase waterfalls in the Gitgit valley, and finish on the Bukit peninsula with a kecak performance at Uluwatu as the sun drops. Small group, local guides, and enough free time to actually enjoy it.',
 6, 5, 68000.00, NULL, 'INR', 'GROUP', 'ADVENTURE', 4.60, 164, 372, 14,
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80',
 b'0', b'1', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Maldives Overwater Retreat', 'maldives-overwater-retreat', 'maldives', 'Maldives', 'Maldives',
 'Five nights in an overwater villa with seaplane transfers, all meals and two dive days.',
 'The classic Maldives week, properly organised. A private overwater villa with a glass floor and a ladder straight into the lagoon, full board including a beach dinner, and two guided dive days on the atoll reef walls. Seaplane transfers are included in both directions and timed so you never lose a day waiting in Male.',
 6, 5, 285000.00, 249000.00, 'INR', 'HONEYMOON', 'LUXURY', 4.90, 142, 298, 2,
 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1600&q=80',
 b'1', b'1', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Dubai City and Desert', 'dubai-city-and-desert', 'dubai', 'Dubai', 'United Arab Emirates',
 'Burj Khalifa, an old-town abra crossing and an overnight desert camp in five days.',
 'Dubai at both ends of its range. Two days in the city for the Burj Khalifa observation deck, the Dubai Mall aquarium and a walk through Al Fahidi''s wind-tower district, then out to the Al Marmoom reserve for dune driving, falconry at golden hour and a night under canvas. Returns via the gold and spice souks of Deira.',
 5, 4, 92000.00, 79000.00, 'INR', 'FAMILY', 'CITY_BREAK', 4.70, 287, 541, 16,
 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
 b'1', b'1', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Golden Triangle Heritage', 'golden-triangle-heritage', 'agra', 'Agra', 'India',
 'Delhi, Agra and Jaipur across six days, travelling by express train and private car.',
 'India''s most famous circuit, done without the rush. Old Delhi by rickshaw, the Gatimaan Express to Agra for a sunrise Taj Mahal and an unhurried Agra Fort, then west to Jaipur for Amber Fort, Hawa Mahal and an afternoon in the bazaars. Heritage hotels throughout and a guide in each city.',
 6, 5, 42000.00, 34500.00, 'INR', 'GROUP', 'CULTURAL', 4.70, 412, 892, 18,
 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80',
 b'1', b'1', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Royal Rajasthan', 'royal-rajasthan', 'jaipur', 'Jaipur', 'India',
 'Jaipur, Jodhpur and Udaipur in eight days of forts, stepwells and lake palaces.',
 'Rajasthan beyond the Pink City. Begin in Jaipur with Amber Fort and Jantar Mantar, drive west to Jodhpur for the vast Mehrangarh and the blue houses beneath it, then south to Udaipur for the lakes at sunset. Includes the Chand Baori stepwell, a village dinner and one night in a converted fort.',
 8, 7, 76000.00, NULL, 'INR', 'PRIVATE', 'CULTURAL', 4.80, 196, 328, 8,
 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1600&q=80',
 b'0', b'0', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Tokyo and Beyond', 'tokyo-and-beyond', 'tokyo', 'Tokyo', 'Japan',
 'Seven days of Tokyo neighbourhoods, a Hakone hot spring night and Mount Fuji views.',
 'Tokyo takes most of this trip and earns it: Senso-ji at opening time, a Tsukiji breakfast, Shibuya from above, and an evening in the six-seat bars of Golden Gai. Midway you head out to Hakone for a night in a ryokan with an onsen, returning past Lake Ashi with Fuji on the skyline when the weather cooperates.',
 7, 6, 168000.00, 152000.00, 'INR', 'GROUP', 'CITY_BREAK', 4.90, 178, 264, 12,
 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80',
 b'1', b'1', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Singapore Family Break', 'singapore-family-break', 'singapore', 'Singapore', 'Singapore',
 'Four days built for families: Gardens by the Bay, Sentosa and the Night Safari.',
 'Compact, easy to navigate and genuinely fun with children. Gardens by the Bay and the Cloud Forest dome, a full day on Sentosa, the Night Safari tram after dark, and a hawker-centre food walk that everyone will remember longer than the theme parks. All transfers included and hotels within walking distance of an MRT stop.',
 4, 3, 88000.00, 74000.00, 'INR', 'FAMILY', 'CITY_BREAK', 4.60, 231, 417, 20,
 'https://images.unsplash.com/photo-1555217851-6141535bd771?auto=format&fit=crop&w=1600&q=80',
 b'0', b'1', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Venice and the Italian Lakes', 'venice-and-italian-lakes', 'venice', 'Venice', 'Italy',
 'Six days from the Venetian lagoon to Lake Como, by train and private boat.',
 'Three nights in Venice staying in Cannaregio, away from the day-trip crowds, with a dawn vaporetto, a cicchetti crawl and a morning on Burano. Then the train west to Lake Como for two nights in Varenna, a private boat around the villas of Bellagio, and the funicular up to Brunate for the view back down the lake.',
 6, 5, 158000.00, NULL, 'INR', 'PRIVATE', 'LUXURY', 4.80, 124, 186, 10,
 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1600&q=80',
 b'1', b'0', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Swiss Alps Rail Journey', 'swiss-alps-rail-journey', 'swiss-alps', 'Swiss Alps', 'Switzerland',
 'Seven days of panoramic rail through the Bernese Oberland, including Jungfraujoch.',
 'Switzerland by train, which is the way it was designed to be seen. Base nights in Interlaken and Zermatt, the cog railway to Jungfraujoch at 3,454m, the Glacier Express between Zermatt and Chur, and a day in the Lauterbrunnen valley among its seventy-two waterfalls. A regional travel pass is included throughout.',
 7, 6, 232000.00, 208000.00, 'INR', 'GROUP', 'MOUNTAIN', 4.90, 156, 212, 14,
 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80',
 b'1', b'1', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Canadian Rockies Discovery', 'canadian-rockies-discovery', 'banff', 'Banff', 'Canada',
 'Eight days through Banff and Jasper along the Icefields Parkway.',
 'The Rockies at their most photogenic. Lake Louise and Moraine Lake at first light, the Johnston Canyon catwalks, a glacier walk on the Columbia Icefield, and the full length of the Icefields Parkway to Jasper. Wildlife is genuinely likely here: elk, bighorn sheep and, with luck, a black bear from a safe distance.',
 8, 7, 246000.00, NULL, 'INR', 'GROUP', 'MOUNTAIN', 4.80, 98, 143, 16,
 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80',
 b'0', b'0', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

('Phuket Island Weekender', 'phuket-island-weekender', 'phuket', 'Phuket', 'Thailand',
 'A four-day Andaman break with Phang Nga Bay by longtail and two beach days.',
 'Short, cheap and surprisingly complete. A full day out to Phang Nga Bay''s limestone stacks by longtail with kayaking through the sea caves, a morning at Wat Chalong and the Big Buddha, and two unstructured days on the quieter beaches of the north coast. Ideal as a long weekend from most Indian cities.',
 4, 3, 38000.00, 31000.00, 'INR', 'WEEKEND', 'BEACH', 4.50, 342, 688, 20,
 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1600&q=80',
 b'0', b'1', b'1', UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0);
