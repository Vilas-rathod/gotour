package com.gotour.identity.user.service;

import com.gotour.common.api.PageRequestFactory;
import com.gotour.common.api.PageResponse;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.common.security.GoTourPrincipal;
import com.gotour.identity.user.domain.Address;
import com.gotour.identity.user.domain.UserProfile;
import com.gotour.identity.user.dto.UserDtos.AddressRequest;
import com.gotour.identity.user.dto.UserDtos.AddressResponse;
import com.gotour.identity.user.dto.UserDtos.AdminUserResponse;
import com.gotour.identity.user.dto.UserDtos.CustomerGrowthResponse;
import com.gotour.identity.user.dto.UserDtos.ProfileResponse;
import com.gotour.identity.user.dto.UserDtos.UpdateProfileRequest;
import com.gotour.identity.user.mapper.UserMapper;
import com.gotour.identity.user.repository.AddressRepository;
import com.gotour.identity.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private static final Set<String> SORTABLE = Set.of("createdAt", "fullName", "email");

    private final UserProfileRepository profileRepository;
    private final AddressRepository addressRepository;
    private final UserMapper mapper;

    /**
     * Returns the caller's profile, creating it on first use from the verified
     * token claims. This keeps auth-service authoritative for credentials while
     * user-service owns everything else, with no synchronisation between them.
     */
    @Transactional
    public ProfileResponse getOrCreateProfile(GoTourPrincipal principal) {
        UserProfile profile = profileRepository.findByUserId(principal.userId())
                .orElseGet(() -> profileRepository.save(UserProfile.builder()
                        .userId(principal.userId())
                        .email(principal.email())
                        .fullName(deriveName(principal.email()))
                        .preferredCurrency("INR")
                        .build()));

        return mapper.toProfileResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(GoTourPrincipal principal, UpdateProfileRequest request) {
        UserProfile profile = profileRepository.findByUserId(principal.userId())
                .orElseGet(() -> UserProfile.builder()
                        .userId(principal.userId())
                        .email(principal.email())
                        .fullName(deriveName(principal.email()))
                        .build());

        profile.setFullName(request.fullName().trim());
        profile.setPhone(blankToNull(request.phone()));
        profile.setAvatarUrl(blankToNull(request.avatarUrl()));
        profile.setDateOfBirth(request.dateOfBirth());
        profile.setGender(request.gender());
        profile.setNationality(blankToNull(request.nationality()));
        profile.setBio(blankToNull(request.bio()));
        profile.setPreferredCurrency(
                request.preferredCurrency() == null || request.preferredCurrency().isBlank()
                        ? "INR" : request.preferredCurrency());
        profile.setMarketingOptIn(request.marketingOptIn());

        return mapper.toProfileResponse(profileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> listAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByDefaultAddressDescIdAsc(userId).stream()
                .map(mapper::toAddressResponse)
                .toList();
    }

    @Transactional
    public AddressResponse addAddress(Long userId, AddressRequest request) {
        if (request.defaultAddress()) {
            addressRepository.clearDefaultFor(userId);
        }

        Address address = Address.builder()
                .userId(userId)
                .label(blankToNull(request.label()))
                .line1(request.line1().trim())
                .line2(blankToNull(request.line2()))
                .city(request.city().trim())
                .state(blankToNull(request.state()))
                .country(request.country().trim())
                .postalCode(request.postalCode().trim())
                .defaultAddress(request.defaultAddress())
                .build();

        return mapper.toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        // Scoped by userId so one customer can never edit another's address.
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));

        if (request.defaultAddress() && !address.isDefaultAddress()) {
            addressRepository.clearDefaultFor(userId);
        }

        address.setLabel(blankToNull(request.label()));
        address.setLine1(request.line1().trim());
        address.setLine2(blankToNull(request.line2()));
        address.setCity(request.city().trim());
        address.setState(blankToNull(request.state()));
        address.setCountry(request.country().trim());
        address.setPostalCode(request.postalCode().trim());
        address.setDefaultAddress(request.defaultAddress());

        return mapper.toAddressResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", addressId));
        addressRepository.delete(address);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> listUsers(String search, Integer page, Integer size,
                                                     String sortBy, String direction) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, SORTABLE, "createdAt");
        return PageResponse.from(
                profileRepository.search(search == null ? "" : search.trim(), pageable),
                mapper::toAdminResponse);
    }

    @Transactional(readOnly = true)
    public CustomerGrowthResponse customerGrowth() {
        Instant now = Instant.now();
        return new CustomerGrowthResponse(
                profileRepository.count(),
                profileRepository.countCreatedSince(now.minus(7, ChronoUnit.DAYS)),
                profileRepository.countCreatedSince(now.minus(30, ChronoUnit.DAYS)));
    }

    private String deriveName(String email) {
        if (email == null || email.isBlank()) {
            return "GoTour Traveller";
        }
        String localPart = email.split("@")[0].replaceAll("[._-]+", " ").trim();
        if (localPart.isEmpty()) {
            return "GoTour Traveller";
        }
        return Character.toUpperCase(localPart.charAt(0)) + localPart.substring(1);
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
