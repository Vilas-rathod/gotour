package com.gotour.booking.itinerary.service;

import com.gotour.common.api.PageResponse;
import com.gotour.common.exception.BadRequestException;
import com.gotour.common.exception.ResourceNotFoundException;
import com.gotour.booking.itinerary.domain.Itinerary;
import com.gotour.booking.itinerary.domain.ItineraryActivity;
import com.gotour.booking.itinerary.domain.ItineraryDay;
import com.gotour.booking.itinerary.dto.ItineraryDtos.ActivityResponse;
import com.gotour.booking.itinerary.dto.ItineraryDtos.DayResponse;
import com.gotour.booking.itinerary.dto.ItineraryDtos.ItineraryDetail;
import com.gotour.booking.itinerary.dto.ItineraryDtos.ItinerarySummary;
import com.gotour.booking.itinerary.dto.ItineraryDtos.SaveActivityRequest;
import com.gotour.booking.itinerary.dto.ItineraryDtos.SaveDayRequest;
import com.gotour.booking.itinerary.dto.ItineraryDtos.SaveItineraryRequest;
import com.gotour.booking.itinerary.repository.ItineraryActivityRepository;
import com.gotour.booking.itinerary.repository.ItineraryDayRepository;
import com.gotour.booking.itinerary.repository.ItineraryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Trip planning.
 *
 * <p>Every lookup is scoped by {@code userId}, so one traveller can never read
 * or modify another's itinerary even with a guessed id.
 */
@Service
@RequiredArgsConstructor
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final ItineraryDayRepository dayRepository;
    private final ItineraryActivityRepository activityRepository;

    @Transactional(readOnly = true)
    public PageResponse<ItinerarySummary> list(Long userId, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(
                page == null || page < 0 ? 0 : page,
                size == null || size < 1 ? 10 : Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "startDate"));

        return PageResponse.from(
                itineraryRepository.findByUserIdOrderByStartDateDesc(userId, pageable), this::toSummary);
    }

    @Transactional(readOnly = true)
    public List<ItinerarySummary> upcoming(Long userId) {
        return itineraryRepository
                .findTop5ByUserIdAndEndDateGreaterThanEqualOrderByStartDateAsc(userId, LocalDate.now())
                .stream().map(this::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public ItineraryDetail get(Long userId, Long itineraryId) {
        return toDetail(requireItinerary(userId, itineraryId));
    }

    @Transactional
    public ItineraryDetail create(Long userId, SaveItineraryRequest request) {
        validateDates(request);

        Itinerary itinerary = Itinerary.builder()
                .userId(userId)
                .bookingReference(request.bookingReference())
                .title(request.title().trim())
                .destinationName(request.destinationName())
                .coverImageUrl(request.coverImageUrl())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .notes(request.notes())
                .build();

        return toDetail(itineraryRepository.save(itinerary));
    }

    @Transactional
    public ItineraryDetail update(Long userId, Long itineraryId, SaveItineraryRequest request) {
        validateDates(request);

        Itinerary itinerary = requireItinerary(userId, itineraryId);
        itinerary.setBookingReference(request.bookingReference());
        itinerary.setTitle(request.title().trim());
        itinerary.setDestinationName(request.destinationName());
        itinerary.setCoverImageUrl(request.coverImageUrl());
        itinerary.setStartDate(request.startDate());
        itinerary.setEndDate(request.endDate());
        itinerary.setNotes(request.notes());

        return toDetail(itineraryRepository.save(itinerary));
    }

    @Transactional
    public void delete(Long userId, Long itineraryId) {
        itineraryRepository.delete(requireItinerary(userId, itineraryId));
    }

    // ------------------------------------------------------------------ days

    @Transactional
    public ItineraryDetail addDay(Long userId, Long itineraryId, SaveDayRequest request) {
        Itinerary itinerary = requireItinerary(userId, itineraryId);

        boolean duplicate = itinerary.getDays().stream()
                .anyMatch(day -> day.getDayNumber().equals(request.dayNumber()));
        if (duplicate) {
            throw new BadRequestException("Day " + request.dayNumber() + " already exists in this itinerary");
        }

        itinerary.getDays().add(ItineraryDay.builder()
                .itinerary(itinerary)
                .dayNumber(request.dayNumber())
                .date(request.date())
                .title(request.title().trim())
                .description(request.description())
                .build());

        return toDetail(itineraryRepository.save(itinerary));
    }

    @Transactional
    public ItineraryDetail updateDay(Long userId, Long itineraryId, Long dayId, SaveDayRequest request) {
        Itinerary itinerary = requireItinerary(userId, itineraryId);
        ItineraryDay day = requireDay(itinerary, dayId);

        day.setDayNumber(request.dayNumber());
        day.setDate(request.date());
        day.setTitle(request.title().trim());
        day.setDescription(request.description());
        dayRepository.save(day);

        return toDetail(itinerary);
    }

    @Transactional
    public ItineraryDetail deleteDay(Long userId, Long itineraryId, Long dayId) {
        Itinerary itinerary = requireItinerary(userId, itineraryId);
        ItineraryDay day = requireDay(itinerary, dayId);

        itinerary.getDays().remove(day);
        return toDetail(itineraryRepository.save(itinerary));
    }

    // ------------------------------------------------------------ activities

    @Transactional
    public ItineraryDetail addActivity(Long userId, Long itineraryId, Long dayId,
                                       SaveActivityRequest request) {
        Itinerary itinerary = requireItinerary(userId, itineraryId);
        ItineraryDay day = requireDay(itinerary, dayId);

        day.getActivities().add(ItineraryActivity.builder()
                .day(day)
                .startTime(request.startTime())
                .title(request.title().trim())
                .description(request.description())
                .location(request.location())
                .category(request.category())
                .completed(false)
                .build());

        dayRepository.save(day);
        return toDetail(itinerary);
    }

    @Transactional
    public ItineraryDetail updateActivity(Long userId, Long itineraryId, Long dayId, Long activityId,
                                          SaveActivityRequest request) {
        Itinerary itinerary = requireItinerary(userId, itineraryId);
        ItineraryDay day = requireDay(itinerary, dayId);
        ItineraryActivity activity = requireActivity(day, activityId);

        activity.setStartTime(request.startTime());
        activity.setTitle(request.title().trim());
        activity.setDescription(request.description());
        activity.setLocation(request.location());
        activity.setCategory(request.category());
        activityRepository.save(activity);

        return toDetail(itinerary);
    }

    @Transactional
    public ItineraryDetail toggleActivity(Long userId, Long itineraryId, Long dayId, Long activityId) {
        Itinerary itinerary = requireItinerary(userId, itineraryId);
        ItineraryDay day = requireDay(itinerary, dayId);
        ItineraryActivity activity = requireActivity(day, activityId);

        activity.setCompleted(!activity.isCompleted());
        activityRepository.save(activity);

        return toDetail(itinerary);
    }

    @Transactional
    public ItineraryDetail deleteActivity(Long userId, Long itineraryId, Long dayId, Long activityId) {
        Itinerary itinerary = requireItinerary(userId, itineraryId);
        ItineraryDay day = requireDay(itinerary, dayId);
        ItineraryActivity activity = requireActivity(day, activityId);

        day.getActivities().remove(activity);
        dayRepository.save(day);

        return toDetail(itinerary);
    }

    // --------------------------------------------------------------- helpers

    private void validateDates(SaveItineraryRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("End date cannot be before the start date");
        }
    }

    private Itinerary requireItinerary(Long userId, Long itineraryId) {
        return itineraryRepository.findByIdAndUserId(itineraryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary", itineraryId));
    }

    private ItineraryDay requireDay(Itinerary itinerary, Long dayId) {
        return itinerary.getDays().stream()
                .filter(day -> day.getId().equals(dayId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary day", dayId));
    }

    private ItineraryActivity requireActivity(ItineraryDay day, Long activityId) {
        return day.getActivities().stream()
                .filter(activity -> activity.getId().equals(activityId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Activity", activityId));
    }

    private ItinerarySummary toSummary(Itinerary i) {
        return new ItinerarySummary(i.getId(), i.getBookingReference(), i.getTitle(),
                i.getDestinationName(), i.getCoverImageUrl(), i.getStartDate(), i.getEndDate(),
                duration(i), i.getDays().size());
    }

    private ItineraryDetail toDetail(Itinerary i) {
        return new ItineraryDetail(i.getId(), i.getBookingReference(), i.getTitle(),
                i.getDestinationName(), i.getCoverImageUrl(), i.getStartDate(), i.getEndDate(),
                duration(i), i.getNotes(),
                i.getDays().stream()
                        .map(day -> new DayResponse(day.getId(), day.getDayNumber(), day.getDate(),
                                day.getTitle(), day.getDescription(),
                                day.getActivities().stream()
                                        .map(activity -> new ActivityResponse(activity.getId(),
                                                activity.getStartTime(), activity.getTitle(),
                                                activity.getDescription(), activity.getLocation(),
                                                activity.getCategory(), activity.isCompleted()))
                                        .toList()))
                        .toList());
    }

    private long duration(Itinerary i) {
        return ChronoUnit.DAYS.between(i.getStartDate(), i.getEndDate()) + 1;
    }
}
