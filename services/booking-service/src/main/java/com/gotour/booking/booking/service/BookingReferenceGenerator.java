package com.gotour.booking.booking.service;

import com.gotour.booking.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * Produces customer-facing booking references such as {@code GT-7QK2M9XD}.
 *
 * <p>Random rather than sequential so a reference cannot be used to infer how
 * many bookings the platform has taken, or to guess a neighbouring booking.
 */
@Component
@RequiredArgsConstructor
public class BookingReferenceGenerator {

    /** Excludes I, O, 0 and 1, which are easily confused when read aloud. */
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int LENGTH = 8;
    private static final int MAX_ATTEMPTS = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final BookingRepository bookingRepository;

    public String generate() {
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String candidate = "GT-" + randomSuffix();
            if (!bookingRepository.existsByBookingReference(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Could not allocate a unique booking reference");
    }

    private String randomSuffix() {
        StringBuilder builder = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            builder.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return builder.toString();
    }
}
