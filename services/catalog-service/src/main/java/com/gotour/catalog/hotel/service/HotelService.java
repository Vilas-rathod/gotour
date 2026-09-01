package com.gotour.catalog.hotel.service;

import com.gotour.common.api.PageRequestFactory;
import com.gotour.common.api.PageResponse;
import com.gotour.common.exception.BadRequestException;
import com.gotour.common.exception.ConflictException;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.catalog.hotel.domain.Hotel;
import com.gotour.catalog.hotel.domain.HotelRoom;
import com.gotour.catalog.hotel.dto.HotelDtos.FilterOptions;
import com.gotour.catalog.hotel.dto.HotelDtos.HotelDetail;
import com.gotour.catalog.hotel.dto.HotelDtos.HotelSummary;
import com.gotour.catalog.hotel.dto.HotelDtos.ReserveRoomsRequest;
import com.gotour.catalog.hotel.dto.HotelDtos.RoomResponse;
import com.gotour.catalog.hotel.dto.HotelDtos.SaveHotelRequest;
import com.gotour.catalog.hotel.repository.HotelRepository;
import com.gotour.catalog.hotel.repository.HotelRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class HotelService {

    private static final Set<String> SORTABLE =
            Set.of("rating", "pricePerNight", "starRating", "createdAt", "name");

    private final HotelRepository hotelRepository;
    private final HotelRoomRepository roomRepository;

    @Transactional(readOnly = true)
    public PageResponse<HotelSummary> search(String search, String destinationSlug,
                                             BigDecimal minPrice, BigDecimal maxPrice,
                                             Integer starRating, BigDecimal minRating, String amenity,
                                             Integer page, Integer size, String sortBy, String direction) {

        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Minimum price cannot be greater than maximum price");
        }

        Pageable pageable = PageRequestFactory.of(
                page, size, resolveSort(sortBy), direction, SORTABLE, "rating");

        return PageResponse.from(
                hotelRepository.search(normalize(search), normalize(destinationSlug),
                        minPrice, maxPrice, starRating, minRating, normalize(amenity), pageable),
                this::toSummary);
    }

    private String resolveSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "rating";
        }
        return switch (sortBy) {
            case "price" -> "pricePerNight";
            case "popularity" -> "rating";
            case "newest" -> "createdAt";
            default -> sortBy;
        };
    }

    @Transactional(readOnly = true)
    public List<HotelSummary> featured() {
        return hotelRepository.findTop8ByActiveTrueAndFeaturedTrueOrderByRatingDesc()
                .stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public HotelDetail getBySlug(String slug) {
        return toDetail(hotelRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", slug)));
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> rooms(String slug) {
        Hotel hotel = hotelRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", slug));

        return roomRepository.findByHotelIdOrderByPricePerNightAsc(hotel.getId())
                .stream().map(this::toRoom).toList();
    }

    @Transactional(readOnly = true)
    public FilterOptions filterOptions() {
        Set<String> amenities = new LinkedHashSet<>();
        hotelRepository.findAll().stream()
                .filter(Hotel::isActive)
                .map(Hotel::getAmenities)
                .filter(value -> value != null && !value.isBlank())
                .flatMap(value -> Arrays.stream(value.split(",")))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .sorted()
                .forEach(amenities::add);

        return new FilterOptions(
                hotelRepository.findMinPrice(),
                hotelRepository.findMaxPrice(),
                List.copyOf(amenities));
    }

    @Transactional
    public void reserveRooms(String slug, ReserveRoomsRequest request) {
        Hotel hotel = hotelRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", slug));

        HotelRoom room = roomRepository.findByIdAndHotelId(request.roomId(), hotel.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", request.roomId()));

        if (roomRepository.reserveRooms(room.getId(), request.rooms()) == 0) {
            throw new ConflictException("Only %d room(s) of this type remain".formatted(room.roomsAvailable()));
        }
    }

    @Transactional
    public void releaseRooms(String slug, ReserveRoomsRequest request) {
        Hotel hotel = hotelRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", slug));

        roomRepository.findByIdAndHotelId(request.roomId(), hotel.getId())
                .ifPresent(room -> roomRepository.releaseRooms(room.getId(), request.rooms()));
    }

    // ------------------------------------------------------------------ admin

    @Transactional
    public HotelDetail create(SaveHotelRequest request) {
        if (hotelRepository.existsBySlug(request.slug())) {
            throw new ConflictException("A hotel with slug '" + request.slug() + "' already exists");
        }
        Hotel hotel = new Hotel();
        apply(hotel, request);
        return toDetail(hotelRepository.save(hotel));
    }

    @Transactional
    public HotelDetail update(Long id, SaveHotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", id));

        if (!hotel.getSlug().equals(request.slug()) && hotelRepository.existsBySlug(request.slug())) {
            throw new ConflictException("A hotel with slug '" + request.slug() + "' already exists");
        }
        apply(hotel, request);
        return toDetail(hotelRepository.save(hotel));
    }

    @Transactional
    public void setActive(Long id, boolean active) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", id));
        hotel.setActive(active);
        hotelRepository.save(hotel);
    }

    @Transactional
    public void delete(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel", id));
        hotelRepository.delete(hotel);
    }

    @Transactional(readOnly = true)
    public PageResponse<HotelSummary> adminList(String search, Integer page, Integer size,
                                                 String sortBy, String direction) {
        Pageable pageable = PageRequestFactory.of(
                page, size, resolveSort(sortBy), direction, SORTABLE, "createdAt");
        return PageResponse.from(
                hotelRepository.search(normalize(search), null, null, null, null, null, null, pageable),
                this::toSummary);
    }

    // ---------------------------------------------------------------- mapping

    private void apply(Hotel hotel, SaveHotelRequest request) {
        hotel.setName(request.name().trim());
        hotel.setSlug(request.slug().trim());
        hotel.setDestinationSlug(request.destinationSlug().trim());
        hotel.setDestinationName(request.destinationName().trim());
        hotel.setCity(request.city().trim());
        hotel.setCountry(request.country().trim());
        hotel.setAddress(request.address().trim());
        hotel.setShortDescription(request.shortDescription().trim());
        hotel.setDescription(request.description());
        hotel.setStarRating(request.starRating());
        hotel.setPricePerNight(request.pricePerNight());
        hotel.setCurrency(request.currency() == null || request.currency().isBlank()
                ? "INR" : request.currency());
        hotel.setHeroImageUrl(request.heroImageUrl().trim());
        hotel.setAmenities(request.amenities());
        hotel.setCheckInTime(request.checkInTime());
        hotel.setCheckOutTime(request.checkOutTime());
        hotel.setLatitude(request.latitude());
        hotel.setLongitude(request.longitude());
        hotel.setFeatured(request.featured());
        hotel.setActive(request.active());
    }

    private HotelSummary toSummary(Hotel h) {
        return new HotelSummary(
                h.getId(), h.getName(), h.getSlug(), h.getDestinationName(), h.getDestinationSlug(),
                h.getCity(), h.getCountry(), h.getShortDescription(), h.getStarRating(), h.getRating(),
                h.getReviewCount(), h.getPricePerNight(), h.getCurrency(), h.getHeroImageUrl(),
                splitAmenities(h.getAmenities()), h.isFeatured());
    }

    private HotelDetail toDetail(Hotel h) {
        return new HotelDetail(
                h.getId(), h.getName(), h.getSlug(), h.getDestinationName(), h.getDestinationSlug(),
                h.getCity(), h.getCountry(), h.getAddress(), h.getShortDescription(), h.getDescription(),
                h.getStarRating(), h.getRating(), h.getReviewCount(), h.getPricePerNight(), h.getCurrency(),
                h.getHeroImageUrl(), splitAmenities(h.getAmenities()), h.getCheckInTime(), h.getCheckOutTime(),
                h.getLatitude(), h.getLongitude(), h.isFeatured(),
                h.getImages().stream().map(image -> image.getImageUrl()).toList(),
                h.getRooms().stream().map(this::toRoom).toList());
    }

    private RoomResponse toRoom(HotelRoom room) {
        return new RoomResponse(room.getId(), room.getRoomType(), room.getDescription(),
                room.getPricePerNight(), room.getCapacity(), room.getBedType(), room.getSizeSqm(),
                room.roomsAvailable(), room.getImageUrl());
    }

    private List<String> splitAmenities(String amenities) {
        if (amenities == null || amenities.isBlank()) {
            return List.of();
        }
        return Arrays.stream(amenities.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
