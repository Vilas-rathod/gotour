package com.gotour.booking.booking.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Pricing rules for a booking.
 *
 * <p>Amounts are always computed server-side from the catalogue price. The
 * client never supplies a total, so a tampered request cannot change what is
 * charged.
 */
public final class BookingPricing {

    /** GST on tour packages in India. */
    private static final BigDecimal PACKAGE_TAX_RATE = new BigDecimal("0.05");

    /** GST on hotel room nights. */
    private static final BigDecimal HOTEL_TAX_RATE = new BigDecimal("0.12");

    private BookingPricing() {
    }

    public record Line(String label, BigDecimal unitPrice, int quantity, BigDecimal amount) {
    }

    public record Quote(List<Line> lines, BigDecimal subtotal, BigDecimal taxes, BigDecimal total) {
    }

    public static Quote forPackage(String packageTitle, BigDecimal pricePerTraveller, int travellers) {
        BigDecimal subtotal = scale(pricePerTraveller.multiply(BigDecimal.valueOf(travellers)));
        BigDecimal taxes = scale(subtotal.multiply(PACKAGE_TAX_RATE));

        List<Line> lines = List.of(
                new Line(packageTitle + " (per traveller)", scale(pricePerTraveller), travellers, subtotal),
                new Line("Taxes and service fees (5% GST)", taxes, 1, taxes));

        return new Quote(lines, subtotal, taxes, scale(subtotal.add(taxes)));
    }

    public static Quote forHotel(String roomType, BigDecimal pricePerNight, long nights, int rooms) {
        int roomNights = Math.toIntExact(nights * rooms);
        BigDecimal subtotal = scale(pricePerNight.multiply(BigDecimal.valueOf(roomNights)));
        BigDecimal taxes = scale(subtotal.multiply(HOTEL_TAX_RATE));

        String label = "%s (%d night%s x %d room%s)"
                .formatted(roomType, nights, nights == 1 ? "" : "s", rooms, rooms == 1 ? "" : "s");

        List<Line> lines = List.of(
                new Line(label, scale(pricePerNight), roomNights, subtotal),
                new Line("Taxes and service fees (12% GST)", taxes, 1, taxes));

        return new Quote(lines, subtotal, taxes, scale(subtotal.add(taxes)));
    }

    /**
     * Refund due when a booking is cancelled.
     *
     * <p>Full refund more than 15 days out, half between 7 and 15 days, nothing
     * inside 7 days.
     */
    public static BigDecimal refundFor(BigDecimal paidAmount, long daysUntilTravel) {
        if (daysUntilTravel > 15) {
            return scale(paidAmount);
        }
        if (daysUntilTravel >= 7) {
            return scale(paidAmount.multiply(new BigDecimal("0.5")));
        }
        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal scale(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
