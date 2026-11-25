package com.aayush.blackjack.wallet.repository;

import com.aayush.blackjack.wallet.entity.ChipTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChipTransactionRepository extends JpaRepository<ChipTransaction, UUID> {

    Optional<ChipTransaction> findByReferenceKey(String referenceKey);

    Page<ChipTransaction> findByUser_IdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Modifying
    @Query("UPDATE ChipTransaction t SET t.dailyRewardClaim = null WHERE t.dailyRewardClaim.id IN :claimIds")
    void clearDailyRewardClaimReferences(@Param("claimIds") Collection<UUID> claimIds);

    @Modifying
    @Query("UPDATE ChipTransaction ct SET ct.gameRound = null WHERE ct.gameRound.id IN :roundIds")
    void clearGameRoundByRoundIds(@Param("roundIds") List<UUID> roundIds);

    boolean existsByReferenceKey(String referenceKey);

    void deleteByUser_Id(UUID userId);
}
