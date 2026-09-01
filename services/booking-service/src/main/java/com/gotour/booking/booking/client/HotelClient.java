package com.gotour.booking.booking.client;

import com.gotour.booking.booking.client.CatalogueDtos.Envelope;
import com.gotour.booking.booking.client.CatalogueDtos.HotelView;
import com.gotour.booking.booking.client.CatalogueDtos.ReserveRoomsRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "catalog-service", contextId = "hotelClient", path = "/api/v1/hotels")
public interface HotelClient {

    @GetMapping("/{slug}")
    Envelope<HotelView> getHotel(@PathVariable("slug") String slug);

    @PostMapping("/{slug}/reserve")
    Envelope<Void> reserveRooms(@PathVariable("slug") String slug, @RequestBody ReserveRoomsRequest request);

    @PostMapping("/{slug}/release")
    Envelope<Void> releaseRooms(@PathVariable("slug") String slug, @RequestBody ReserveRoomsRequest request);
}
