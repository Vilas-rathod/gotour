package com.gotour.identity.auth.service;

import com.gotour.identity.auth.domain.PasswordResetToken;
import com.gotour.identity.auth.domain.RefreshToken;
import com.gotour.identity.auth.domain.User;
import com.gotour.identity.auth.dto.AuthDtos.AuthResponse;
import com.gotour.identity.auth.dto.AuthDtos.ChangePasswordRequest;
import com.gotour.identity.auth.dto.AuthDtos.ForgotPasswordRequest;
import com.gotour.identity.auth.dto.AuthDtos.LoginRequest;
import com.gotour.identity.auth.dto.AuthDtos.RefreshTokenRequest;
import com.gotour.identity.auth.dto.AuthDtos.RegisterRequest;
import com.gotour.identity.auth.dto.AuthDtos.ResetPasswordRequest;
import com.gotour.identity.auth.dto.AuthDtos.UserSummary;
import com.gotour.identity.auth.repository.PasswordResetTokenRepository;
import com.gotour.identity.auth.repository.RefreshTokenRepository;
import com.gotour.identity.auth.repository.UserRepository;
import com.gotour.common.domain.RoleName;
import com.gotour.common.exception.BadRequestException;
import com.gotour.common.exception.ConflictException;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Authentication and credential lifecycle.
 *
 * <p>Security choices worth noting:
 * <ul>
 *   <li>Login failures always report the same message so the API cannot be used
 *       to discover which email addresses are registered.</li>
 *   <li>Repeated failures lock the account for a cooling-off period.</li>
 *   <li>Refresh tokens rotate: using one revokes it and issues a replacement.</li>
 *   <li>Changing or resetting a password revokes every outstanding session.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);
    private static final Duration RESET_TOKEN_TTL = Duration.ofMinutes(30);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenIssuer tokenIssuer;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .phone(request.phone() == null || request.phone().isBlank() ? null : request.phone().trim())
                .enabled(true)
                .roles(EnumSet.of(RoleName.CUSTOMER))
                .build();

        User saved = userRepository.save(user);
        log.info("Registered new user id={}", saved.getId());

        return issueTokens(saved);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

        // Credentials are verified by the AuthenticationManager, which runs the
        // custom UserDetailsService through a DaoAuthenticationProvider. It also
        // enforces the enabled/locked flags and, with hideUserNotFoundExceptions,
        // hashes a dummy password for unknown emails so timing cannot reveal which
        // addresses are registered.
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (LockedException ex) {
            throw new UnauthorizedException(
                    "Account temporarily locked due to repeated failed logins. Try again later.");
        } catch (DisabledException ex) {
            throw new UnauthorizedException("This account has been deactivated");
        } catch (BadCredentialsException ex) {
            userRepository.findByEmailIgnoreCase(email).ifPresent(this::registerFailedAttempt);
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String hash = tokenIssuer.hash(request.refreshToken());

        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));

        if (!stored.isUsable()) {
            // A revoked token being replayed suggests theft; drop every session for that user.
            refreshTokenRepository.revokeAllForUser(stored.getUser().getId(), Instant.now());
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        stored.setRevoked(true);
        stored.setRevokedAt(Instant.now());
        refreshTokenRepository.save(stored);

        User user = stored.getUser();
        if (!user.isEnabled()) {
            throw new UnauthorizedException("This account has been deactivated");
        }

        return issueTokens(user);
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.findByTokenHash(tokenIssuer.hash(request.refreshToken()))
                .ifPresent(token -> {
                    token.setRevoked(true);
                    token.setRevokedAt(Instant.now());
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void logoutAllSessions(Long userId) {
        refreshTokenRepository.revokeAllForUser(userId, Instant.now());
    }

    /**
     * Starts the reset flow. Always succeeds from the caller's point of view so
     * the endpoint cannot be used to enumerate registered addresses.
     *
     * @return the raw reset token when the account exists, otherwise empty.
     *         In production this is emailed rather than returned.
     */
    @Transactional
    public java.util.Optional<String> forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.email());

        return userRepository.findByEmailIgnoreCase(email).map(user -> {
            passwordResetTokenRepository.invalidateAllForUser(user.getId());

            String rawToken = tokenIssuer.createOpaqueToken();
            PasswordResetToken token = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(tokenIssuer.hash(rawToken))
                    .expiresAt(Instant.now().plus(RESET_TOKEN_TTL))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(token);

            log.info("Password reset requested for user id={}", user.getId());
            return rawToken;
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String hash = tokenIssuer.hash(request.token());

        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (!token.isUsable()) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        User user = token.getUser();
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from the current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        refreshTokenRepository.revokeAllForUser(user.getId(), Instant.now());
        log.info("Password reset completed for user id={}", user.getId());
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password must be different from the current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        refreshTokenRepository.revokeAllForUser(user.getId(), Instant.now());
        log.info("Password changed for user id={}", user.getId());
    }

    @Transactional(readOnly = true)
    public UserSummary currentUser(Long userId) {
        return userRepository.findById(userId)
                .map(this::toSummary)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    private void registerFailedAttempt(User user) {
        int attempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(attempts);

        if (attempts >= MAX_FAILED_ATTEMPTS) {
            user.setLockedUntil(Instant.now().plus(LOCK_DURATION));
            user.setFailedLoginAttempts(0);
            log.warn("Locked account id={} after {} failed attempts", user.getId(), MAX_FAILED_ATTEMPTS);
        }
        userRepository.save(user);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = tokenIssuer.createAccessToken(user);
        String rawRefreshToken = tokenIssuer.createOpaqueToken();

        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenHash(tokenIssuer.hash(rawRefreshToken))
                .expiresAt(tokenIssuer.refreshTokenExpiry())
                .revoked(false)
                .build());

        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                "Bearer",
                tokenIssuer.accessTokenTtlSeconds(),
                toSummary(user));
    }

    private UserSummary toSummary(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));

        return new UserSummary(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                roles,
                user.getCreatedAt());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(java.util.Locale.ROOT);
    }
}
