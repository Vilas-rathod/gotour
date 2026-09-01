package com.gotour.common.api;

import com.gotour.common.exception.BadRequestException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

/**
 * Builds a {@link Pageable} from untrusted query parameters.
 *
 * <p>Sort fields are checked against an allow-list because Spring Data passes
 * property names straight into the generated query; accepting arbitrary input
 * would expose the internal schema and allow sorting by unindexed columns.
 */
public final class PageRequestFactory {

    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 12;

    private PageRequestFactory() {
    }

    public static Pageable of(Integer page, Integer size, String sortBy, String direction,
                              Set<String> allowedSortFields, String defaultSortField) {

        int safePage = (page == null || page < 0) ? 0 : page;
        int safeSize = (size == null || size < 1) ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);

        String field = (sortBy == null || sortBy.isBlank()) ? defaultSortField : sortBy.trim();
        if (!allowedSortFields.contains(field)) {
            throw new BadRequestException(
                    "Invalid sort field '%s'. Allowed values: %s".formatted(field, String.join(", ", allowedSortFields)));
        }

        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(safePage, safeSize, Sort.by(sortDirection, field));
    }
}
