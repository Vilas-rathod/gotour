package com.gotour.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base for every deliberate, client-facing failure. Carries the HTTP status so
 * the global handler does not need to map exception types to status codes.
 */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
