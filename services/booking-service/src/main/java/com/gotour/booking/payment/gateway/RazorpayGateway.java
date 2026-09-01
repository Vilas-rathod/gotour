package com.gotour.booking.payment.gateway;

import com.fasterxml.jackson.databind.JsonNode;
import com.gotour.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * Razorpay integration.
 *
 * <p>Razorpay works in the smallest currency unit, so rupee amounts are
 * multiplied by 100 before being sent and divided back on the way out.
 *
 * <p>Activated by setting {@code gotour.payment.provider=RAZORPAY} together
 * with a key id and secret.
 */
@Slf4j
@Component
public class RazorpayGateway implements PaymentGateway {

    private static final BigDecimal SUBUNIT_FACTOR = BigDecimal.valueOf(100);

    private final PaymentProperties properties;
    private final RestClient restClient;

    public RazorpayGateway(PaymentProperties properties, RestClient.Builder builder) {
        this.properties = properties;
        this.restClient = builder.baseUrl(properties.getRazorpay().getApiUrl()).build();
    }

    @Override
    public String provider() {
        return "RAZORPAY";
    }

    @Override
    public GatewayOrder createOrder(OrderRequest request) {
        requireCredentials();

        long amountInSubunits = request.amount()
                .multiply(SUBUNIT_FACTOR)
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        JsonNode response = restClient.post()
                .uri("/orders")
                .header(HttpHeaders.AUTHORIZATION, basicAuthHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "amount", amountInSubunits,
                        "currency", request.currency(),
                        "receipt", request.paymentReference(),
                        "notes", Map.of(
                                "bookingReference", request.bookingReference(),
                                "customerEmail", request.customerEmail())))
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.hasNonNull("id")) {
            throw new BadRequestException("Razorpay did not return an order id");
        }

        String orderId = response.get("id").asText();
        log.info("Razorpay order {} created for booking {}", orderId, request.bookingReference());

        return new GatewayOrder(
                orderId,
                request.amount(),
                request.currency(),
                properties.getRazorpay().getKeyId(),
                null);
    }

    /**
     * Razorpay signs {@code order_id|payment_id} with the account secret using
     * HMAC-SHA256. Recomputing it locally is the documented way to confirm a
     * checkout callback was not forged by the browser.
     */
    @Override
    public boolean verifyPayment(VerificationRequest request) {
        requireCredentials();

        String expected = HmacSigner.hmacSha256Hex(
                request.providerOrderId() + "|" + request.providerPaymentId(),
                properties.getRazorpay().getKeySecret());

        boolean valid = HmacSigner.matches(expected, request.signature());
        if (!valid) {
            log.warn("Razorpay signature mismatch for order {}", request.providerOrderId());
        }
        return valid;
    }

    @Override
    public GatewayRefund refund(RefundRequest request) {
        requireCredentials();

        long amountInSubunits = request.amount()
                .multiply(SUBUNIT_FACTOR)
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        JsonNode response = restClient.post()
                .uri("/payments/{paymentId}/refund", request.providerPaymentId())
                .header(HttpHeaders.AUTHORIZATION, basicAuthHeader())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "amount", amountInSubunits,
                        "notes", Map.of("reason", request.reason() == null ? "" : request.reason())))
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.hasNonNull("id")) {
            throw new BadRequestException("Razorpay did not return a refund id");
        }

        return new GatewayRefund(
                response.get("id").asText(),
                request.amount(),
                "processed".equals(response.path("status").asText()));
    }

    private String basicAuthHeader() {
        String credentials = properties.getRazorpay().getKeyId() + ":"
                + properties.getRazorpay().getKeySecret();
        return "Basic " + Base64.getEncoder()
                .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }

    private void requireCredentials() {
        PaymentProperties.Razorpay config = properties.getRazorpay();
        if (config.getKeyId().isBlank() || config.getKeySecret().isBlank()) {
            throw new BadRequestException(
                    "Razorpay is not configured. Set gotour.payment.razorpay.key-id and key-secret.");
        }
    }
}
