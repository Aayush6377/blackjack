package com.aayush.blackjack.room.controller;

import com.aayush.blackjack.room.dto.AdminGameRoomResponse;
import com.aayush.blackjack.room.dto.CreateGameRoomRequest;
import com.aayush.blackjack.room.dto.UpdateGameRoomActiveRequest;
import com.aayush.blackjack.room.dto.UpdateGameRoomRequest;
import com.aayush.blackjack.room.service.AdminGameRoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/rooms")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminGameRoomController {

    private final AdminGameRoomService adminGameRoomService;

    @GetMapping
    public ResponseEntity<List<AdminGameRoomResponse>> getAllRooms() {
        return ResponseEntity.ok(adminGameRoomService.listAllRooms());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<AdminGameRoomResponse> getRoomById(@PathVariable UUID roomId) {
        return ResponseEntity.ok(adminGameRoomService.getRoomById(roomId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdminGameRoomResponse> createRoom(
            @Valid @ModelAttribute CreateGameRoomRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminGameRoomService.createRoom(request));
    }

    @PutMapping(value = "/{roomId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdminGameRoomResponse> updateRoom(
            @PathVariable UUID roomId,
            @Valid @ModelAttribute UpdateGameRoomRequest request
    ) {
        return ResponseEntity.ok(adminGameRoomService.updateRoom(roomId, request));
    }

    @PatchMapping("/{roomId}/active")
    public ResponseEntity<AdminGameRoomResponse> updateRoomActive(
            @PathVariable UUID roomId,
            @Valid @RequestBody UpdateGameRoomActiveRequest request
    ) {
        return ResponseEntity.ok(adminGameRoomService.updateRoomActive(roomId, request));
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable UUID roomId) {
        adminGameRoomService.deleteRoom(roomId);
        return ResponseEntity.noContent().build();
    }
}