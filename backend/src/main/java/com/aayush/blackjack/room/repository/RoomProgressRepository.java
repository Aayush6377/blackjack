package com.aayush.blackjack.room.repository;

import com.aayush.blackjack.room.entity.RoomProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface RoomProgressRepository extends JpaRepository<RoomProgress, UUID> {

    Collection<RoomProgress> findAllByUser_Id(UUID userId);

    Optional<RoomProgress> findByUser_IdAndRoom_Id(UUID userId, UUID roomId);

    @Modifying
    @Query("DELETE FROM RoomProgress rp WHERE rp.room.id = :roomId")
    void deleteAllByRoomId(@Param("roomId") UUID roomId);

    void deleteByUser_Id(UUID userId);
}
