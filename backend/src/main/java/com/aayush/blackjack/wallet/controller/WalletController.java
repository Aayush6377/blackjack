package com.aayush.blackjack.wallet.controller;

import com.aayush.blackjack.wallet.dto.ChipTransactionResponse;
import com.aayush.blackjack.wallet.dto.WalletSummaryResponse;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import com.aayush.blackjack.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<WalletSummaryResponse> getMyWallet() {
        ChipWallet wallet = walletService.getOrCreateWallet();
        return ResponseEntity.ok(WalletSummaryResponse.from(wallet));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<ChipTransactionResponse>> getMyTransactions() {
        List<ChipTransactionResponse> history = walletService.getTransactionHistory();
        return ResponseEntity.ok(history);
    }
}
