package com.gotour.identity.user.repository;

import com.gotour.identity.user.domain.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @Query("""
            select p from UserProfile p
            where :search is null or :search = ''
               or lower(p.fullName) like lower(concat('%', :search, '%'))
               or lower(p.email) like lower(concat('%', :search, '%'))
            """)
    Page<UserProfile> search(@Param("search") String search, Pageable pageable);

    @Query("select count(p) from UserProfile p where p.createdAt >= :since")
    long countCreatedSince(@Param("since") java.time.Instant since);
}
