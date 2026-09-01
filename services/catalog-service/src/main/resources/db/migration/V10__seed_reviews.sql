-- Approved sample reviews so the destination and package pages are not empty
-- on a fresh install. user_id 2 is the seeded demo customer.
INSERT INTO reviews (user_id, user_name, target_type, target_slug, rating, title, comment,
                     status, helpful_count, moderated_at,
                     created_at, updated_at, created_by, updated_by, version)
VALUES
(2, 'Ananya Sharma', 'DESTINATION', 'bali', 5,
 'Exceeded every expectation',
 'We split our week between Ubud and Seminyak and the contrast made the trip. The rice terraces at sunrise were genuinely worth the early alarm, and Uluwatu at sunset is as good as the photographs suggest. Give yourself more time than you think you need for the drives.',
 'APPROVED', 34, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

(3, 'Rahul Mehta', 'DESTINATION', 'maldives', 5,
 'Worth every rupee for a honeymoon',
 'The seaplane transfer is genuinely part of the experience, so do not begrudge the cost. Our villa had a ladder straight into the lagoon and we snorkelled every morning before breakfast. Check what your resort charges for transfers before you book.',
 'APPROVED', 28, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

(4, 'Priya Nair', 'DESTINATION', 'dubai', 4,
 'Brilliant with kids, but mind the season',
 'We went in early March and the weather was perfect. The desert camp was the highlight for our two children, more so than the Burj Khalifa. Would avoid the summer entirely; friends went in July and barely left the hotel.',
 'APPROVED', 19, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

(5, 'Vikram Desai', 'PACKAGE', 'golden-triangle-heritage', 5,
 'Well paced and genuinely well guided',
 'Six days is right for this circuit. The Gatimaan Express beats sitting in a car for four hours, and getting to the Taj at opening time meant we had maybe twenty minutes before it filled up. Our guide in Jaipur was excellent.',
 'APPROVED', 41, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

(6, 'Sneha Kulkarni', 'PACKAGE', 'bali-honeymoon-escape', 5,
 'The floating breakfast is not just for the photos',
 'Booked this for our honeymoon and the villa in Ubud was the best part. The spa ritual was two and a half hours and we came out barely able to speak. The catamaran on the last evening was a lovely way to finish.',
 'APPROVED', 26, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

(7, 'Arjun Reddy', 'PACKAGE', 'swiss-alps-rail-journey', 5,
 'The rail pass alone justifies the price',
 'Jungfraujoch was clear the day we went, which is luck, but the Glacier Express would have been worth it regardless. Everything ran exactly on time, which after travelling in a few other countries felt almost unsettling.',
 'APPROVED', 22, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

(8, 'Meera Iyer', 'HOTEL', 'ubud-canopy-retreat', 5,
 'The valley view is the whole point',
 'Villa 12 looks straight down the ridge and we ate every breakfast on the deck watching the mist burn off. The shuttle into Ubud runs hourly and is reliable. Only note is that there are a lot of steps.',
 'APPROVED', 15, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

(9, 'Karan Malhotra', 'HOTEL', 'atoll-water-villas', 5,
 'House reef is genuinely excellent',
 'We had booked two dive days and ended up cancelling one because the house reef was so good we did not want to leave it. Full board is the right call here as there is nowhere else to eat.',
 'APPROVED', 18, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

(10, 'Divya Menon', 'HOTEL', 'andaman-shores-resort', 4,
 'Quiet, which is exactly what we wanted',
 'Mai Khao is a long way from the Patong noise and that suited us. The beach genuinely does run for kilometres. Twenty minutes from the airport is accurate. Half a star off only because the restaurant options get repetitive after four nights.',
 'APPROVED', 11, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0),

(11, 'Aditya Joshi', 'DESTINATION', 'tokyo', 5,
 'The food alone is worth the flight',
 'Ten days and we barely scratched it. Get a Suica card rather than the rail pass if you are staying in the city. Golden Gai is tiny and brilliant. Book anything with a Michelin star months ahead or do not bother.',
 'APPROVED', 31, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), UTC_TIMESTAMP(6), 'system', 'system', 0);
