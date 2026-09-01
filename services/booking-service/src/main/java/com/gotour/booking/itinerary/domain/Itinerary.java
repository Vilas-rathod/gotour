package com.gotour.booking.itinerary.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** A traveller's personal trip plan, optionally attached to a booking. */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "itineraries",
        indexes = {
                @Index(name = "idx_itineraries_user", columnList = "user_id"),
                @Index(name = "idx_itineraries_booking", columnList = "booking_reference")
        })
public class Itinerary extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "booking_reference", length = 20)
    private String bookingReference;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(name = "destination_name", length = 120)
    private String destinationName;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(length = 1000)
    private String notes;

    @Builder.Default
    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    private List<ItineraryDay> days = new ArrayList<>();
}
