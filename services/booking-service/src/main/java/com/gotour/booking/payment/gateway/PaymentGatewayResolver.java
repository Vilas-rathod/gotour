package com.gotour.booking.payment.gateway;

import com.gotour.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Selects the active gateway from configuration.
 *
 * <p>Every implementation is registered, so a provider can be switched with a
 * property change and a restart, and a refund can still be routed to whichever
 * provider originally took the payment.
 */
@Slf4j
@Component
public class PaymentGatewayResolver {

    private final Map<String, PaymentGateway> gateways;
    private final PaymentProperties properties;

    public PaymentGatewayResolver(List<PaymentGateway> gateways, PaymentProperties properties) {
        this.gateways = gateways.stream()
                .collect(Collectors.toMap(
                        gateway -> gateway.provider().toUpperCase(Locale.ROOT),
                        Function.identity()));
        this.properties = properties;

        log.info("Payment gateways registered: {}; active provider: {}",
                this.gateways.keySet(), properties.getProvider());
    }

    /** The gateway new payments should be created with. */
    public PaymentGateway active() {
        return byName(properties.getProvider());
    }

    /** The gateway a historical payment was taken through. */
    public PaymentGateway byName(String provider) {
        PaymentGateway gateway = gateways.get(
                provider == null ? "" : provider.toUpperCase(Locale.ROOT));

        if (gateway == null) {
            throw new BadRequestException("Unknown payment provider '%s'. Available: %s"
                    .formatted(provider, String.join(", ", gateways.keySet())));
        }
        return gateway;
    }
}
