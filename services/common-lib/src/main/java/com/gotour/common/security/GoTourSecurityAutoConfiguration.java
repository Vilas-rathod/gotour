package com.gotour.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Turns every GoTour service into a stateless JWT resource server.
 *
 * <p>Provides the shared building blocks — {@link JwtService}, the
 * {@link JwtAuthenticationFilter}, and JSON 401/403 handlers — and a safe
 * default {@link SecurityFilterChain} (authenticate everything except infra and
 * docs endpoints; {@code /api/v1/admin/**} requires {@code ROLE_ADMIN}). A
 * service with a public surface (identity's auth endpoints, catalog's browse
 * endpoints) defines its own {@code SecurityFilterChain} bean, which replaces
 * the default via {@link ConditionalOnMissingBean}.
 */
@AutoConfiguration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties(JwtProperties.class)
public class GoTourSecurityAutoConfiguration {

    /** Paths open to everyone on every service. */
    public static final String[] PUBLIC_INFRA_PATHS = {
            "/actuator/**",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/error"
    };

    @Bean
    @ConditionalOnMissingBean
    public JwtService jwtService(JwtProperties properties) {
        return new JwtService(properties);
    }

    @Bean
    @ConditionalOnMissingBean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService) {
        return new JwtAuthenticationFilter(jwtService);
    }

    @Bean
    @ConditionalOnMissingBean
    public RestAuthenticationEntryPoint restAuthenticationEntryPoint(ObjectMapper objectMapper) {
        return new RestAuthenticationEntryPoint(objectMapper);
    }

    @Bean
    @ConditionalOnMissingBean
    public RestAccessDeniedHandler restAccessDeniedHandler(ObjectMapper objectMapper) {
        return new RestAccessDeniedHandler(objectMapper);
    }

    /**
     * Applies the settings every GoTour chain shares: stateless sessions, no CSRF
     * (the API is token-based and CORS is handled at the gateway), the JWT filter,
     * and JSON error handlers. Services call this, then add their own
     * authorization rules.
     */
    public static HttpSecurity applyBaseline(HttpSecurity http,
                                             JwtAuthenticationFilter jwtFilter,
                                             RestAuthenticationEntryPoint entryPoint,
                                             RestAccessDeniedHandler deniedHandler) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(deniedHandler))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http,
                                                          JwtAuthenticationFilter jwtFilter,
                                                          RestAuthenticationEntryPoint entryPoint,
                                                          RestAccessDeniedHandler deniedHandler) throws Exception {
        applyBaseline(http, jwtFilter, entryPoint, deniedHandler)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_INFRA_PATHS).permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated());
        return http.build();
    }
}
