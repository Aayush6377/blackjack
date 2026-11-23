package com.aayush.blackjack.game.repository;

import com.aayush.blackjack.game.entity.GameShoe;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface GameShoeRepository extends JpaRepository<GameShoe, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT s FROM GameShoe s
            WHERE s.user.id = :userId
              AND s.room.id = :roomId
              AND s.status = com.aayush.blackjack.game.enums.ShoeStatus.ACTIVE
            """)
    Optional<GameShoe> findLockedActiveShoe(
            @Param("userId") UUID userId,
            @Param("roomId") UUID roomId
    );

    void deleteAllByRoom_Id(UUID roomId);
}
