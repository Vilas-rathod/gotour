package com.gotour.booking.itinerary.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "itinerary_activities",
        indexes = @Index(name = "idx_itinerary_activities_day", columnList = "day_id"))
public class ItineraryActivity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "day_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_itinerary_activities_day"))
    private ItineraryDay day;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 600)
    private String description;

    @Column(length = 200)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ActivityCategory category;

    @Builder.Default
    @Column(nullable = false)
    private boolean completed = false;

    public enum ActivityCategory {
        SIGHTSEEING,
        FOOD,
        TRANSPORT,
        ACCOMMODATION,
        ACTIVITY,
        SHOPPING,
        FREE_TIME
    }
}
