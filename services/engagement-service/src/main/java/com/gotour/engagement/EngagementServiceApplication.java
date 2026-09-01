package com.gotour.engagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Engagement service — saved items and notifications.
 * Consolidates wishlist-service and notification-service.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class EngagementServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EngagementServiceApplication.class, args);
    }
}
