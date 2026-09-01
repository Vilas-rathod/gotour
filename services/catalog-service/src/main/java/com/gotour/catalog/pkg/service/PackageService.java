package com.gotour.catalog.pkg.service;

import com.gotour.common.api.PageRequestFactory;
import com.gotour.common.api.PageResponse;
import com.gotour.common.exception.BadRequestException;
import com.gotour.common.exception.ConflictException;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.catalog.pkg.domain.PackageAvailability;
import com.gotour.catalog.pkg.domain.PackageDetailItem;
import com.gotour.catalog.pkg.domain.PackageType;
import com.gotour.catalog.pkg.domain.TourPackage;
import com.gotour.catalog.pkg.domain.TravelStyle;
import com.gotour.catalog.pkg.dto.PackageDtos.AvailabilityResponse;
import com.gotour.catalog.pkg.dto.PackageDtos.FilterOptions;
import com.gotour.catalog.pkg.dto.PackageDtos.ItineraryDayResponse;
import com.gotour.catalog.pkg.dto.PackageDtos.PackageDetail;
import com.gotour.catalog.pkg.dto.PackageDtos.PackageSummary;
import com.gotour.catalog.pkg.dto.PackageDtos.ReserveSeatsRequest;
import com.gotour.catalog.pkg.dto.PackageDtos.SavePackageRequest;
import com.gotour.catalog.pkg.repository.PackageAvailabilityRepository;
import com.gotour.catalog.pkg.repository.TourPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class PackageService {

    /**
     * Whitelisted sort properties. "popularity" is exposed to clients but maps
     * onto bookingCount, which is the column that actually exists.
     */
    private static final Set<String> SORTABLE =
            Set.of("bookingCount", "price", "rating", "createdAt", "durationDays", "title");

    private final TourPackageRepository packageRepository;
    private final PackageAvailabilityRepository availabilityRepository;

    @Transactional(readOnly = true)
    public PageResponse<PackageSummary> search(String search, String destinationSlug,
                                               PackageType packageType, TravelStyle travelStyle,
                                               BigDecimal minPrice, BigDecimal maxPrice,
                                               Integer minDuration, Integer maxDuration,
                                               BigDecimal minRating,
                                               Integer page, Integer size, String sortBy, String direction) {

        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Minimum price cannot be greater than maximum price");
        }

        Pageable pageable = PageRequestFactory.of(
                page, size, resolveSort(sortBy), direction, SORTABLE, "bookingCount");

        return PageResponse.from(
                packageRepository.search(
                        normalize(search), normalize(destinationSlug), packageType, travelStyle,
                        minPrice, maxPrice, minDuration, maxDuration, minRating, pageable),
                this::toSummary);
    }

    /** Maps client-facing sort names onto entity properties. */
    private String resolveSort(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "bookingCount";
        }
        return switch (sortBy) {
            case "popularity" -> "bookingCount";
            case "newest" -> "createdAt";
            case "duration" -> "durationDays";
            default -> sortBy;
        };
    }

    @Transactional(readOnly = true)
    public List<PackageSummary> featured() {
        return packageRepository.findTop8ByActiveTrueAndFeaturedTrueOrderByBookingCountDesc()
                .stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public List<PackageSummary> trending() {
        return packageRepository.findTop8ByActiveTrueAndTrendingTrueOrderByBookingCountDesc()
                .stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public PackageDetail getBySlug(String slug) {
        return toDetail(packageRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Package", slug)));
    }

    @Transactional(readOnly = true)
    public List<PackageSummary> related(String slug) {
        TourPackage tourPackage = packageRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Package", slug));

        return packageRepository
                .findTop4ByActiveTrueAndDestinationSlugAndIdNotOrderByBookingCountDesc(
                        tourPackage.getDestinationSlug(), tourPackage.getId())
                .stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public List<AvailabilityResponse> availability(String slug) {
        TourPackage tourPackage = packageRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Package", slug));

        return availabilityRepository
                .findByTourPackageIdAndDepartureDateGreaterThanEqualOrderByDepartureDateAsc(
                        tourPackage.getId(), LocalDate.now())
                .stream()
                .map(entry -> toAvailability(entry, tourPackage))
                .toList();
    }

    @Transactional(readOnly = true)
    public FilterOptions filterOptions() {
        return new FilterOptions(
                packageRepository.findMinPrice(),
                packageRepository.findMaxPrice(),
                Arrays.stream(PackageType.values()).map(Enum::name).toList(),
                Arrays.stream(TravelStyle.values()).map(Enum::name).toList(),
                packageRepository.countActive());
    }

    /**
     * Reserves seats for a confirmed booking.
     *
     * @throws ConflictException when the departure no longer has enough seats
     */
    @Transactional
    public void reserveSeats(String slug, ReserveSeatsRequest request) {
        TourPackage tourPackage = packageRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Package", slug));

        PackageAvailability availability = availabilityRepository
                .findByTourPackageIdAndDepartureDate(tourPackage.getId(), request.departureDate())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Departure on " + request.departureDate() + " for package", slug));

        int updated = availabilityRepository.reserveSeats(availability.getId(), request.seats());
        if (updated == 0) {
            throw new ConflictException("Only %d seat(s) remain for this departure"
                    .formatted(availability.seatsAvailable()));
        }

        tourPackage.setBookingCount(tourPackage.getBookingCount() + request.seats());
        packageRepository.save(tourPackage);
    }

    @Transactional
    public void releaseSeats(String slug, ReserveSeatsRequest request) {
        TourPackage tourPackage = packageRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Package", slug));

        availabilityRepository
                .findByTourPackageIdAndDepartureDate(tourPackage.getId(), request.departureDate())
                .ifPresent(availability ->
                        availabilityRepository.releaseSeats(availability.getId(), request.seats()));
    }

    // ------------------------------------------------------------------ admin

    @Transactional
    public PackageDetail create(SavePackageRequest request) {
        if (packageRepository.existsBySlug(request.slug())) {
            throw new ConflictException("A package with slug '" + request.slug() + "' already exists");
        }
        TourPackage tourPackage = new TourPackage();
        apply(tourPackage, request);
        return toDetail(packageRepository.save(tourPackage));
    }

    @Transactional
    public PackageDetail update(Long id, SavePackageRequest request) {
        TourPackage tourPackage = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", id));

        if (!tourPackage.getSlug().equals(request.slug()) && packageRepository.existsBySlug(request.slug())) {
            throw new ConflictException("A package with slug '" + request.slug() + "' already exists");
        }
        apply(tourPackage, request);
        return toDetail(packageRepository.save(tourPackage));
    }

    @Transactional
    public void setActive(Long id, boolean active) {
        TourPackage tourPackage = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", id));
        tourPackage.setActive(active);
        packageRepository.save(tourPackage);
    }

    @Transactional
    public void delete(Long id) {
        TourPackage tourPackage = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", id));
        packageRepository.delete(tourPackage);
    }

    @Transactional(readOnly = true)
    public PageResponse<PackageSummary> adminList(String search, Integer page, Integer size,
                                                   String sortBy, String direction) {
        Pageable pageable = PageRequestFactory.of(
                page, size, resolveSort(sortBy), direction, SORTABLE, "createdAt");
        return PageResponse.from(
                packageRepository.search(normalize(search), null, null, null,
                        null, null, null, null, null, pageable),
                this::toSummary);
    }

    // ---------------------------------------------------------------- mapping

    private void apply(TourPackage tourPackage, SavePackageRequest request) {
        if (request.discountPrice() != null
                && request.discountPrice().compareTo(request.price()) >= 0) {
            throw new BadRequestException("Discount price must be lower than the regular price");
        }

        tourPackage.setTitle(request.title().trim());
        tourPackage.setSlug(request.slug().trim());
        tourPackage.setDestinationSlug(request.destinationSlug().trim());
        tourPackage.setDestinationName(request.destinationName().trim());
        tourPackage.setDestinationCountry(request.destinationCountry());
        tourPackage.setSummary(request.summary().trim());
        tourPackage.setDescription(request.description());
        tourPackage.setDurationDays(request.durationDays());
        tourPackage.setDurationNights(request.durationNights());
        tourPackage.setPrice(request.price());
        tourPackage.setDiscountPrice(request.discountPrice());
        tourPackage.setCurrency(request.currency() == null || request.currency().isBlank()
                ? "INR" : request.currency());
        tourPackage.setPackageType(request.packageType());
        tourPackage.setTravelStyle(request.travelStyle());
        tourPackage.setMaxGroupSize(request.maxGroupSize());
        tourPackage.setHeroImageUrl(request.heroImageUrl().trim());
        tourPackage.setFeatured(request.featured());
        tourPackage.setTrending(request.trending());
        tourPackage.setActive(request.active());
    }

    private PackageSummary toSummary(TourPackage p) {
        return new PackageSummary(
                p.getId(), p.getTitle(), p.getSlug(), p.getDestinationName(), p.getDestinationSlug(),
                p.getDestinationCountry(), p.getSummary(), p.getDurationDays(), p.getDurationNights(),
                p.getPrice(), p.getDiscountPrice(), p.effectivePrice(), discountPercent(p),
                p.getCurrency(), p.getPackageType(), p.getTravelStyle(), p.getRating(),
                p.getReviewCount(), p.getHeroImageUrl(), p.isFeatured(), p.isTrending());
    }

    private PackageDetail toDetail(TourPackage p) {
        return new PackageDetail(
                p.getId(), p.getTitle(), p.getSlug(), p.getDestinationName(), p.getDestinationSlug(),
                p.getDestinationCountry(), p.getSummary(), p.getDescription(),
                p.getDurationDays(), p.getDurationNights(), p.getPrice(), p.getDiscountPrice(),
                p.effectivePrice(), discountPercent(p), p.getCurrency(), p.getPackageType(),
                p.getTravelStyle(), p.getRating(), p.getReviewCount(), p.getMaxGroupSize(),
                p.getHeroImageUrl(), p.isFeatured(), p.isTrending(),
                p.getImages().stream().map(image -> image.getImageUrl()).toList(),
                itemsOfType(p, PackageDetailItem.ItemType.HIGHLIGHT),
                itemsOfType(p, PackageDetailItem.ItemType.INCLUSION),
                itemsOfType(p, PackageDetailItem.ItemType.EXCLUSION),
                p.getItinerary().stream()
                        .map(day -> new ItineraryDayResponse(day.getDayNumber(), day.getTitle(),
                                day.getDescription(), day.getMeals(), day.getAccommodation()))
                        .toList(),
                p.getAvailability().stream()
                        .filter(entry -> !entry.getDepartureDate().isBefore(LocalDate.now()))
                        .map(entry -> toAvailability(entry, p))
                        .toList());
    }

    private List<String> itemsOfType(TourPackage p, PackageDetailItem.ItemType type) {
        return p.getDetailItems().stream()
                .filter(item -> item.getItemType() == type)
                .map(PackageDetailItem::getText)
                .toList();
    }

    private AvailabilityResponse toAvailability(PackageAvailability entry, TourPackage tourPackage) {
        return new AvailabilityResponse(
                entry.getId(),
                entry.getDepartureDate(),
                entry.getSeatsTotal(),
                entry.getSeatsBooked(),
                entry.seatsAvailable(),
                entry.getPriceOverride() != null ? entry.getPriceOverride() : tourPackage.effectivePrice());
    }

    private Integer discountPercent(TourPackage p) {
        if (p.getDiscountPrice() == null || p.getPrice() == null
                || p.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        BigDecimal saved = p.getPrice().subtract(p.getDiscountPrice());
        return saved.multiply(BigDecimal.valueOf(100))
                .divide(p.getPrice(), 0, RoundingMode.HALF_UP)
                .intValue();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
