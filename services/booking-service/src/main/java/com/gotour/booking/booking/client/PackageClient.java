package com.gotour.booking.booking.client;

import com.gotour.booking.booking.client.CatalogueDtos.Envelope;
import com.gotour.booking.booking.client.CatalogueDtos.PackageView;
import com.gotour.booking.booking.client.CatalogueDtos.ReserveSeatsRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "catalog-service", contextId = "packageClient", path = "/api/v1/packages")
public interface PackageClient {

    @GetMapping("/{slug}")
    Envelope<PackageView> getPackage(@PathVariable("slug") String slug);

    @PostMapping("/{slug}/reserve")
    Envelope<Void> reserveSeats(@PathVariable("slug") String slug, @RequestBody ReserveSeatsRequest request);

    @PostMapping("/{slug}/release")
    Envelope<Void> releaseSeats(@PathVariable("slug") String slug, @RequestBody ReserveSeatsRequest request);
}
