package com.gotour.common.config;

import com.gotour.common.exception.GlobalExceptionHandler;
import com.gotour.common.security.SecurityUtils;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

/**
 * Shared web/persistence wiring: the global exception handler and the auditor
 * that stamps {@code created_by} / {@code updated_by} from the current caller.
 */
@AutoConfiguration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class GoTourWebAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public GlobalExceptionHandler globalExceptionHandler() {
        return new GlobalExceptionHandler();
    }

    @Bean
    @ConditionalOnMissingBean(name = "auditorAware")
    public AuditorAware<String> auditorAware() {
        return () -> Optional.of(SecurityUtils.currentPrincipal()
                .map(principal -> principal.email() == null
                        ? String.valueOf(principal.userId())
                        : principal.email())
                .orElse("system"));
    }
}
