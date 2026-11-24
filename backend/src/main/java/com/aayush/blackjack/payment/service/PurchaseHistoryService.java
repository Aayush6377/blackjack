package com.aayush.blackjack.payment.service;

import com.aayush.blackjack.common.dto.PageResponse;
import com.aayush.blackjack.payment.dto.PurchaseHistoryResponse;
import com.aayush.blackjack.payment.entity.Purchase;
import com.aayush.blackjack.payment.repository.PurchaseRepository;
import com.aayush.blackjack.security.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseHistoryService {

    private final CurrentUserService currentUserService;
    private final PurchaseRepository purchaseRepository;

    @Transactional(readOnly = true)
    public PageResponse<PurchaseHistoryResponse> getMyPurchases(int page, int limit) {
        UUID userId = currentUserService.getCurrentUserId();
        int safePage = Math.max(page, 0);
        int safeLimit = Math.min(Math.max(limit, 1), 50);

        Pageable pageable = PageRequest.of(
                safePage,
                safeLimit,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Purchase> purchasesPage = purchaseRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.from(purchasesPage, PurchaseHistoryResponse::from);
    }
}