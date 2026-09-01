package com.gotour.identity.auth.security;

import com.gotour.common.security.GoTourSecurityAutoConfiguration;
import com.gotour.common.security.JwtAuthenticationFilter;
import com.gotour.common.security.RestAccessDeniedHandler;
import com.gotour.common.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Identity is both the token issuer and a resource server.
 *
 * <p>It wires the real Spring Security authentication stack the platform relies
 * on — a {@link PasswordEncoder}, the custom {@link GoTourUserDetailsService}
 * behind a {@link DaoAuthenticationProvider}, and an {@link AuthenticationManager}
 * that {@code AuthService.login} authenticates against — and opens only the
 * public auth endpoints (login, register, refresh, password reset).
 */
@Configuration
public class IdentitySecurityConfig {

    private static final String[] PUBLIC_AUTH_POST = {
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Seeded accounts are BCrypt; new hashes use the same algorithm.
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(UserDetailsService userDetailsService,
                                                               PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        // Keep the default hideUserNotFoundExceptions=true: unknown emails and wrong
        // passwords both surface as BadCredentials, so the API can't be used to
        // discover which addresses are registered.
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(DaoAuthenticationProvider provider) {
        return new ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain identitySecurityFilterChain(HttpSecurity http,
                                                           JwtAuthenticationFilter jwtFilter,
                                                           RestAuthenticationEntryPoint entryPoint,
                                                           RestAccessDeniedHandler deniedHandler) throws Exception {
        GoTourSecurityAutoConfiguration.applyBaseline(http, jwtFilter, entryPoint, deniedHandler)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(GoTourSecurityAutoConfiguration.PUBLIC_INFRA_PATHS).permitAll()
                        .requestMatchers(HttpMethod.POST, PUBLIC_AUTH_POST).permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated());
        return http.build();
    }
}
