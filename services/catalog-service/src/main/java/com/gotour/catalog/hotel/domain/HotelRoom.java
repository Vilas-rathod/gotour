package com.gotour.catalog.hotel.domain;

import com.gotour.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "hotel_rooms", indexes = @Index(name = "idx_hotel_rooms_hotel", columnList = "hotel_id"))
public class HotelRoom extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotel_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_hotel_rooms_hotel"))
    private Hotel hotel;

    @Column(name = "room_type", nullable = false, length = 120)
    private String roomType;

    @Column(nullable = false, length = 400)
    private String description;

    @Column(name = "price_per_night", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerNight;

    /** Maximum occupancy for this room type. */
    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "bed_type", length = 60)
    private String bedType;

    @Column(name = "size_sqm")
    private Integer sizeSqm;

    @Column(name = "total_rooms", nullable = false)
    private Integer totalRooms;

    @Builder.Default
    @Column(name = "rooms_booked", nullable = false)
    private Integer roomsBooked = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    public int roomsAvailable() {
        return Math.max(0, totalRooms - roomsBooked);
    }
}
