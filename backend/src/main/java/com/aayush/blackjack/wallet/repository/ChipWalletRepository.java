package com.aayush.blackjack.wallet.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ChipWalletRepository extends JpaRepository<ChipWallet, UUID> {
    Optional<ChipWallet> findByUser_Id(UUID userId);

    boolean existsByUser(User user);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM ChipWallet w WHERE w.user.id = :userId")
    Optional<ChipWallet> findLockedByUserId(@Param("userId") UUID userId);
}
