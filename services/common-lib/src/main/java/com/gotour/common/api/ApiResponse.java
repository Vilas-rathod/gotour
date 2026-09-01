package com.gotour.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

/**
 * Envelope returned by every GoTour endpoint so clients can rely on one shape.
 *
 * @param success  false when the request failed
 * @param message  human readable summary
 * @param data     payload, null on failure
 * @param errors   field-level validation errors, null when there are none
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(name = "ApiResponse", description = "Standard GoTour response envelope")
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        Object errors,
        Instant timestamp
) {

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Request successful", data, null, Instant.now());
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, Instant.now());
    }

    public static ApiResponse<Void> message(String message) {
        return new ApiResponse<>(true, message, null, null, Instant.now());
    }

    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(false, message, null, null, Instant.now());
    }

    public static <T> ApiResponse<T> failure(String message, Object errors) {
        return new ApiResponse<>(false, message, null, errors, Instant.now());
    }
}
