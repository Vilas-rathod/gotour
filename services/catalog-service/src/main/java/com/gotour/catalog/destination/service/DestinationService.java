package com.gotour.catalog.destination.service;

import com.gotour.common.api.PageRequestFactory;
import com.gotour.common.api.PageResponse;
import com.gotour.common.exception.ConflictException;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.catalog.destination.domain.Destination;
import com.gotour.catalog.destination.dto.DestinationDtos.AttractionResponse;
import com.gotour.catalog.destination.dto.DestinationDtos.DestinationDetail;
import com.gotour.catalog.destination.dto.DestinationDtos.DestinationSummary;
import com.gotour.catalog.destination.dto.DestinationDtos.FacetsResponse;
import com.gotour.catalog.destination.dto.DestinationDtos.GuideResponse;
import com.gotour.catalog.destination.dto.DestinationDtos.ImageResponse;
import com.gotour.catalog.destination.dto.DestinationDtos.SaveDestinationRequest;
import com.gotour.catalog.destination.repository.DestinationRepository;
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
public class DestinationService {

    private static final Set<String> SORTABLE =
            Set.of("popularityScore", "rating", "name", "createdAt", "averageBudget");

    private final DestinationRepository destinationRepository;

    @Transactional(readOnly = true)
    public PageResponse<DestinationSummary> search(String search, String country, String continent,
                                                   String tag, BigDecimal minRating, Boolean featured,
                                                   Integer page, Integer size, String sortBy, String direction) {

        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, SORTABLE, "popularityScore");

        return PageResponse.from(
                destinationRepository.search(
                        normalize(search), normalize(country), normalize(continent),
                        normalize(tag), minRating, featured, pageable),
                this::toSummary);
    }

    @Transactional(readOnly = true)
    public List<DestinationSummary> featured() {
        return destinationRepository.findTop8ByActiveTrueAndFeaturedTrueOrderByPopularityScoreDesc()
                .stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public List<DestinationSummary> popular() {
        return destinationRepository.findTop8ByActiveTrueOrderByPopularityScoreDesc()
                .stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public DestinationDetail getBySlug(String slug) {
        Destination destination = destinationRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Destination", slug));
        return toDetail(destination);
    }

    @Transactional(readOnly = true)
    public List<DestinationSummary> related(String slug) {
        Destination destination = destinationRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Destination", slug));

        return destinationRepository
                .findTop4ByActiveTrueAndCountryAndIdNotOrderByPopularityScoreDesc(
                        destination.getCountry(), destination.getId())
                .stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public FacetsResponse facets() {
        Set<String> tags = new LinkedHashSet<>();
        destinationRepository.findAll().stream()
                .filter(Destination::isActive)
                .map(Destination::getTags)
                .filter(value -> value != null && !value.isBlank())
                .flatMap(value -> Arrays.stream(value.split(",")))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .sorted()
                .forEach(tags::add);

        return new FacetsResponse(
                destinationRepository.findDistinctCountries(),
                destinationRepository.findDistinctContinents(),
                List.copyOf(tags));
    }

    // ------------------------------------------------------------------ admin

    @Transactional
    public DestinationDetail create(SaveDestinationRequest request) {
        if (destinationRepository.existsBySlug(request.slug())) {
            throw new ConflictException("A destination with slug '" + request.slug() + "' already exists");
        }

        Destination destination = new Destination();
        apply(destination, request);
        return toDetail(destinationRepository.save(destination));
    }

    @Transactional
    public DestinationDetail update(Long id, SaveDestinationRequest request) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination", id));

        if (!destination.getSlug().equals(request.slug()) && destinationRepository.existsBySlug(request.slug())) {
            throw new ConflictException("A destination with slug '" + request.slug() + "' already exists");
        }

        apply(destination, request);
        return toDetail(destinationRepository.save(destination));
    }

    @Transactional
    public void setActive(Long id, boolean active) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination", id));
        destination.setActive(active);
        destinationRepository.save(destination);
    }

    @Transactional
    public void delete(Long id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Destination", id));
        destinationRepository.delete(destination);
    }

    @Transactional(readOnly = true)
    public PageResponse<DestinationSummary> adminList(String search, Integer page, Integer size,
                                                      String sortBy, String direction) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, SORTABLE, "createdAt");
        return PageResponse.from(
                destinationRepository.search(normalize(search), null, null, null, null, null, pageable),
                this::toSummary);
    }

    // ---------------------------------------------------------------- mapping

    private void apply(Destination destination, SaveDestinationRequest request) {
        destination.setName(request.name().trim());
        destination.setSlug(request.slug().trim());
        destination.setCountry(request.country().trim());
        destination.setCity(request.city());
        destination.setRegion(request.region());
        destination.setContinent(request.continent());
        destination.setShortDescription(request.shortDescription().trim());
        destination.setDescription(request.description());
        destination.setHeroImageUrl(request.heroImageUrl().trim());
        destination.setThumbnailUrl(request.thumbnailUrl());
        destination.setRating(request.rating() == null ? BigDecimal.ZERO : request.rating());
        destination.setPopularityScore(request.popularityScore() == null ? 0 : request.popularityScore());
        destination.setBestTimeToVisit(request.bestTimeToVisit());
        destination.setAverageBudget(request.averageBudget());
        destination.setCurrency(request.currency() == null || request.currency().isBlank()
                ? "INR" : request.currency());
        destination.setLatitude(request.latitude());
        destination.setLongitude(request.longitude());
        destination.setTags(request.tags());
        destination.setFeatured(request.featured());
        destination.setActive(request.active());
    }

    private DestinationSummary toSummary(Destination destination) {
        return new DestinationSummary(
                destination.getId(),
                destination.getName(),
                destination.getSlug(),
                destination.getCountry(),
                destination.getCity(),
                destination.getContinent(),
                destination.getShortDescription(),
                destination.getHeroImageUrl(),
                destination.getThumbnailUrl(),
                destination.getRating(),
                destination.getReviewCount(),
                destination.getAverageBudget(),
                destination.getCurrency(),
                splitTags(destination.getTags()),
                destination.isFeatured());
    }

    private DestinationDetail toDetail(Destination destination) {
        return new DestinationDetail(
                destination.getId(),
                destination.getName(),
                destination.getSlug(),
                destination.getCountry(),
                destination.getCity(),
                destination.getRegion(),
                destination.getContinent(),
                destination.getShortDescription(),
                destination.getDescription(),
                destination.getHeroImageUrl(),
                destination.getRating(),
                destination.getReviewCount(),
                destination.getBestTimeToVisit(),
                destination.getAverageBudget(),
                destination.getCurrency(),
                destination.getLatitude(),
                destination.getLongitude(),
                splitTags(destination.getTags()),
                destination.isFeatured(),
                destination.getImages().stream()
                        .map(image -> new ImageResponse(image.getId(), image.getImageUrl(),
                                image.getCaption(), image.getSortOrder()))
                        .toList(),
                destination.getAttractions().stream()
                        .map(attraction -> new AttractionResponse(attraction.getId(), attraction.getName(),
                                attraction.getDescription(), attraction.getImageUrl(),
                                attraction.getCategory(), attraction.getDistanceKm()))
                        .toList(),
                destination.getGuides().stream()
                        .map(guide -> new GuideResponse(guide.getId(), guide.getCategory(),
                                guide.getTitle(), guide.getContent()))
                        .toList());
    }

    private List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
