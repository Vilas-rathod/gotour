package com.gotour.booking.payment.gateway;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Payment configuration.
 *
 * <p>Two methods are offered: <b>Razorpay</b> (online — UPI / BHIM) and
 * <b>Cash</b> (pay at the hotel on arrival, hotel bookings only). The method is
 * chosen per transaction at checkout; {@code gotour.payment.provider} is only
 * the default used when the client does not name one.
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "gotour.payment")
public class PaymentProperties {

    /** Default provider when the checkout request does not name one: RAZORPAY or CASH. */
    private String provider = "RAZORPAY";

    private final Razorpay razorpay = new Razorpay();

    @Getter
    @Setter
    public static class Razorpay {
        /** Left empty on purpose — supply via RAZORPAY_KEY_ID at deploy time. */
        private String keyId = "";
        /** Left empty on purpose — supply via RAZORPAY_KEY_SECRET at deploy time. */
        private String keySecret = "";
        private String apiUrl = "https://api.razorpay.com/v1";
    }
}
