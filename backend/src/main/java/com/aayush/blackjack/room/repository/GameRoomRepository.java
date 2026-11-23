package com.aayush.blackjack.room.repository;

import com.aayush.blackjack.room.entity.GameRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GameRoomRepository extends JpaRepository<GameRoom, UUID> {
    List<GameRoom> findAllByActiveTrueOrderByDisplayOrderAsc();

    Optional<GameRoom> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<GameRoom> findAllByOrderByDisplayOrderAscNameAsc();
}
