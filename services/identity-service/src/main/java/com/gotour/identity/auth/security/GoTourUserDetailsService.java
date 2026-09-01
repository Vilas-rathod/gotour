package com.gotour.identity.auth.security;

import com.gotour.identity.auth.domain.User;
import com.gotour.identity.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/**
 * Custom {@link UserDetailsService} that loads GoTour accounts by email for the
 * {@code DaoAuthenticationProvider}. Roles are fetched eagerly with the user, so
 * authorities are available without a second query.
 */
@Service
@RequiredArgsConstructor
public class GoTourUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String email = username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("No account for " + email));
        return new GoTourUserDetails(user);
    }
}
