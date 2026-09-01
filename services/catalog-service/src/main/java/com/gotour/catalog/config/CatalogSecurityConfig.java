package com.gotour.catalog.config;

import com.gotour.common.security.GoTourSecurityAutoConfiguration;
import com.gotour.common.security.JwtAuthenticationFilter;
import com.gotour.common.security.RestAccessDeniedHandler;
import com.gotour.common.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Catalogue is public to read and restricted to write.
 *
 * <p>Anyone can browse destinations, packages, hotels and reviews (GET);
 * creating a review requires a signed-in user; and everything under
 * {@code /api/v1/admin/**} requires an administrator.
 */
@Configuration
public class CatalogSecurityConfig {

    private static final String[] PUBLIC_GET = {
            "/api/v1/destinations/**",
            "/api/v1/packages/**",
            "/api/v1/hotels/**",
            "/api/v1/reviews/**"
    };

    @Bean
    public SecurityFilterChain catalogSecurityFilterChain(HttpSecurity http,
                                                          JwtAuthenticationFilter jwtFilter,
                                                          RestAuthenticationEntryPoint entryPoint,
                                                          RestAccessDeniedHandler deniedHandler) throws Exception {
        GoTourSecurityAutoConfiguration.applyBaseline(http, jwtFilter, entryPoint, deniedHandler)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(GoTourSecurityAutoConfiguration.PUBLIC_INFRA_PATHS).permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, PUBLIC_GET).permitAll()
                        .anyRequest().authenticated());
        return http.build();
    }
}
