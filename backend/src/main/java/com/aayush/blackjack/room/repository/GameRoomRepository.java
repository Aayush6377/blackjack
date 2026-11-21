package com.aayush.blackjack.room.repository;

import com.aayush.blackjack.room.entity.GameRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GameRoomRepository extends JpaRepository<GameRoom, UUID> {
    List<GameRoom> findAllByActiveTrueOrderByDisplayOrderAsc();
}
