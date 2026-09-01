package com.gotour.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Booking service — the transactional core: bookings, payments and trip
 * itineraries. Consolidates booking-, payment- and itinerary-service.
 *
 * <p>Feign is used to read authoritative catalogue prices from catalog-service.
 * Payment↔booking confirmation is now an in-process call.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class BookingServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookingServiceApplication.class, args);
    }
}
