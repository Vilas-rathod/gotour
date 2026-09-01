package com.gotour.identity.user.mapper;

import com.gotour.identity.user.domain.Address;
import com.gotour.identity.user.domain.UserProfile;
import com.gotour.identity.user.dto.UserDtos.AddressResponse;
import com.gotour.identity.user.dto.UserDtos.AdminUserResponse;
import com.gotour.identity.user.dto.UserDtos.ProfileResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    ProfileResponse toProfileResponse(UserProfile profile);

    AddressResponse toAddressResponse(Address address);

    @Mapping(target = "joinedAt", source = "createdAt")
    AdminUserResponse toAdminResponse(UserProfile profile);
}
