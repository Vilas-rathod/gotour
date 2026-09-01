package com.gotour.booking.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Propagates the caller's {@code Authorization} header onto outbound Feign calls
 * (booking → catalog).
 *
 * <p>Downstream endpoints such as {@code POST /api/v1/hotels/{slug}/reserve} are
 * now secured, so an internal call made on behalf of a signed-in user must carry
 * that user's access token; otherwise catalog-service rejects it with 401.
 */
@Configuration
public class FeignAuthForwardingConfig {

    @Bean
    public RequestInterceptor authForwardingInterceptor() {
        return template -> {
            if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
                String authorization = attributes.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
                if (authorization != null && !authorization.isBlank()
                        && !template.headers().containsKey(HttpHeaders.AUTHORIZATION)) {
                    template.header(HttpHeaders.AUTHORIZATION, authorization);
                }
            }
        };
    }
}
