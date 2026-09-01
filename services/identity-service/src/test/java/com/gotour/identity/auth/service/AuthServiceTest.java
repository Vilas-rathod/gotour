package com.gotour.identity.auth.service;

import com.gotour.identity.auth.domain.PasswordResetToken;
import com.gotour.identity.auth.domain.RefreshToken;
import com.gotour.identity.auth.domain.User;
import com.gotour.identity.auth.dto.AuthDtos.ChangePasswordRequest;
import com.gotour.identity.auth.dto.AuthDtos.ForgotPasswordRequest;
import com.gotour.identity.auth.dto.AuthDtos.LoginRequest;
import com.gotour.identity.auth.dto.AuthDtos.RefreshTokenRequest;
import com.gotour.identity.auth.dto.AuthDtos.RegisterRequest;
import com.gotour.identity.auth.dto.AuthDtos.ResetPasswordRequest;
import com.gotour.identity.auth.repository.PasswordResetTokenRepository;
import com.gotour.identity.auth.repository.RefreshTokenRepository;
import com.gotour.identity.auth.repository.UserRepository;
import com.gotour.common.domain.RoleName;
import com.gotour.common.exception.BadRequestException;
import com.gotour.common.exception.ConflictException;
import com.gotour.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private TokenIssuer tokenIssuer;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .email("traveller@gotour.com")
                .passwordHash("hashed-password")
                .fullName("Demo Traveller")
                .enabled(true)
                .roles(EnumSet.of(RoleName.CUSTOMER))
                .build();
        user.setId(42L);
        user.setCreatedAt(Instant.now());
    }

    private void stubTokenIssuance() {
        lenient().when(tokenIssuer.createAccessToken(any())).thenReturn("access-token");
        lenient().when(tokenIssuer.createOpaqueToken()).thenReturn("raw-refresh-token");
        lenient().when(tokenIssuer.hash(anyString())).thenAnswer(inv -> "hash:" + inv.getArgument(0));
        lenient().when(tokenIssuer.refreshTokenExpiry())
                .thenReturn(Instant.now().plus(7, ChronoUnit.DAYS));
        lenient().when(tokenIssuer.accessTokenTtlSeconds()).thenReturn(3600L);
    }

    @Test
    @DisplayName("registers a customer, hashes the password and issues tokens")
    void registersNewCustomer() {
        stubTokenIssuance();
        when(userRepository.existsByEmailIgnoreCase("new@gotour.com")).thenReturn(false);
        when(passwordEncoder.encode("Str0ng@Pass")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(7L);
            return saved;
        });

        var response = authService.register(
                new RegisterRequest("New Traveller", "  New@GoTour.com ", "Str0ng@Pass", null));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();

        assertThat(saved.getEmail()).isEqualTo("new@gotour.com");
        assertThat(saved.getPasswordHash()).isEqualTo("hashed");
        assertThat(saved.getRoles()).containsExactly(RoleName.CUSTOMER);
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("raw-refresh-token");
    }

    @Test
    @DisplayName("rejects registration when the email is already taken")
    void rejectsDuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("taken@gotour.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("Someone", "taken@gotour.com", "Str0ng@Pass", null)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("logs in via the AuthenticationManager and clears the failure counter")
    void logsInSuccessfully() {
        stubTokenIssuance();
        user.setFailedLoginAttempts(3);
        when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken("traveller@gotour.com", null));
        when(userRepository.findByEmailIgnoreCase("traveller@gotour.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = authService.login(new LoginRequest("traveller@gotour.com", "Correct@123"));

        assertThat(response.user().email()).isEqualTo("traveller@gotour.com");
        assertThat(user.getFailedLoginAttempts()).isZero();
        assertThat(user.getLastLoginAt()).isNotNull();
    }

    @Test
    @DisplayName("uses one generic message for unknown emails and wrong passwords")
    void doesNotRevealWhetherAccountExists() {
        // The AuthenticationManager hides "user not found" behind BadCredentials.
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));
        lenient().when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        when(userRepository.findByEmailIgnoreCase("ghost@gotour.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> authService.login(new LoginRequest("ghost@gotour.com", "Whatever@1")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");

        when(userRepository.findByEmailIgnoreCase("traveller@gotour.com")).thenReturn(Optional.of(user));
        assertThatThrownBy(() -> authService.login(new LoginRequest("traveller@gotour.com", "Wrong@123")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    @DisplayName("locks the account after five consecutive failures")
    void locksAccountAfterRepeatedFailures() {
        user.setFailedLoginAttempts(4);
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));
        when(userRepository.findByEmailIgnoreCase("traveller@gotour.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> authService.login(new LoginRequest("traveller@gotour.com", "Wrong@123")))
                .isInstanceOf(UnauthorizedException.class);

        assertThat(user.getLockedUntil()).isNotNull();
        assertThat(user.isLocked()).isTrue();
    }

    @Test
    @DisplayName("refuses login while the account is locked")
    void refusesLoginWhileLocked() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new LockedException("Account locked"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("traveller@gotour.com", "Correct@123")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("locked");
    }

    @Test
    @DisplayName("rotates the refresh token, revoking the one that was used")
    void rotatesRefreshToken() {
        stubTokenIssuance();
        RefreshToken stored = RefreshToken.builder()
                .user(user)
                .tokenHash("hash:old-token")
                .expiresAt(Instant.now().plus(1, ChronoUnit.DAYS))
                .revoked(false)
                .build();
        stored.setId(1L);

        when(refreshTokenRepository.findByTokenHash("hash:old-token")).thenReturn(Optional.of(stored));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = authService.refresh(new RefreshTokenRequest("old-token"));

        assertThat(stored.isRevoked()).isTrue();
        assertThat(response.refreshToken()).isEqualTo("raw-refresh-token");
        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("revokes every session when a already-used refresh token is replayed")
    void revokesAllSessionsOnTokenReplay() {
        when(tokenIssuer.hash("stolen-token")).thenReturn("hash:stolen");
        RefreshToken revoked = RefreshToken.builder()
                .user(user)
                .tokenHash("hash:stolen")
                .expiresAt(Instant.now().plus(1, ChronoUnit.DAYS))
                .revoked(true)
                .build();
        when(refreshTokenRepository.findByTokenHash("hash:stolen")).thenReturn(Optional.of(revoked));

        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("stolen-token")))
                .isInstanceOf(UnauthorizedException.class);

        verify(refreshTokenRepository).revokeAllForUser(eq(42L), any(Instant.class));
    }

    @Test
    @DisplayName("returns no token for an unknown email so accounts cannot be enumerated")
    void forgotPasswordIsSilentForUnknownEmail() {
        when(userRepository.findByEmailIgnoreCase("ghost@gotour.com")).thenReturn(Optional.empty());

        Optional<String> token = authService.forgotPassword(new ForgotPasswordRequest("ghost@gotour.com"));

        assertThat(token).isEmpty();
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("stores only the hash of a reset token")
    void forgotPasswordStoresHashOnly() {
        when(userRepository.findByEmailIgnoreCase("traveller@gotour.com")).thenReturn(Optional.of(user));
        when(tokenIssuer.createOpaqueToken()).thenReturn("raw-reset");
        when(tokenIssuer.hash("raw-reset")).thenReturn("hash:raw-reset");
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Optional<String> token = authService.forgotPassword(new ForgotPasswordRequest("traveller@gotour.com"));

        assertThat(token).contains("raw-reset");

        ArgumentCaptor<PasswordResetToken> captor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(captor.capture());
        assertThat(captor.getValue().getTokenHash()).isEqualTo("hash:raw-reset");
        verify(passwordResetTokenRepository).invalidateAllForUser(42L);
    }

    @Test
    @DisplayName("resets the password, consumes the token and drops existing sessions")
    void resetsPassword() {
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .tokenHash("hash:reset")
                .expiresAt(Instant.now().plus(20, ChronoUnit.MINUTES))
                .used(false)
                .build();

        when(tokenIssuer.hash("reset")).thenReturn("hash:reset");
        when(passwordResetTokenRepository.findByTokenHash("hash:reset")).thenReturn(Optional.of(token));
        when(passwordEncoder.matches("Brand@New1", "hashed-password")).thenReturn(false);
        when(passwordEncoder.encode("Brand@New1")).thenReturn("new-hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        authService.resetPassword(new ResetPasswordRequest("reset", "Brand@New1"));

        assertThat(user.getPasswordHash()).isEqualTo("new-hash");
        assertThat(token.isUsed()).isTrue();
        verify(refreshTokenRepository).revokeAllForUser(eq(42L), any(Instant.class));
    }

    @Test
    @DisplayName("rejects an expired reset token")
    void rejectsExpiredResetToken() {
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .tokenHash("hash:expired")
                .expiresAt(Instant.now().minus(1, ChronoUnit.MINUTES))
                .used(false)
                .build();

        when(tokenIssuer.hash("expired")).thenReturn("hash:expired");
        when(passwordResetTokenRepository.findByTokenHash("hash:expired")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.resetPassword(new ResetPasswordRequest("expired", "Brand@New1")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid or expired");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("requires the correct current password when changing it")
    void rejectsWrongCurrentPassword() {
        when(userRepository.findById(42L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword(42L,
                new ChangePasswordRequest("wrong", "Brand@New1")))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Current password is incorrect");

        verify(refreshTokenRepository, never()).revokeAllForUser(anyLong(), any());
    }

    @Test
    @DisplayName("changing the password revokes every active session")
    void changePasswordRevokesSessions() {
        when(userRepository.findById(42L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Current@1", "hashed-password")).thenReturn(true);
        when(passwordEncoder.matches("Brand@New1", "hashed-password")).thenReturn(false);
        when(passwordEncoder.encode("Brand@New1")).thenReturn("new-hash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.changePassword(42L, new ChangePasswordRequest("Current@1", "Brand@New1"));

        assertThat(user.getPasswordHash()).isEqualTo("new-hash");
        verify(refreshTokenRepository, atLeastOnce()).revokeAllForUser(eq(42L), any(Instant.class));
    }
}
