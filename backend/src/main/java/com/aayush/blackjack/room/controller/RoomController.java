package com.aayush.blackjack.room.controller;

import com.aayush.blackjack.room.dto.RoomSummaryResponse;
import com.aayush.blackjack.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomSummaryResponse>> getRooms() {
        return ResponseEntity.ok(roomService.getAllRoomsForCurrentUser());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<RoomSummaryResponse> getRoomBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(roomService.getRoomBySlugForCurrentUser(slug));
    }
}
