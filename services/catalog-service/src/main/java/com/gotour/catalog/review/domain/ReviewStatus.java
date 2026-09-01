package com.gotour.catalog.review.domain;

/** Reviews are held for moderation before they appear publicly. */
public enum ReviewStatus {
    PENDING,
    APPROVED,
    REJECTED
}
