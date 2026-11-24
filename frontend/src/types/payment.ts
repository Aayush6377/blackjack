export interface CreatePaymentOrderRequest {
  planId: string;
}

export interface CreatePaymentOrderResponse {
  purchaseId: string;
  razorpayOrderId: string;
  amountInPaise: number;
  currency: string;
  keyId: string;
  planName: string;
  chipsAwarded: number;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentVerificationResponse {
  purchaseId: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | string;
  chipsAwarded: number;
}

export interface RazorpayCheckoutSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutFailureResponse {
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayCheckoutSuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorpayInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    callback: (response: RazorpayCheckoutFailureResponse) => void
  ) => void;
}

export type PurchaseStatus = "PENDING" | "SUCCESS" | "FAILED" | string;

export interface PurchaseHistoryItem {
  id: string;
  planId: string | null;
  planName: string;
  chipsAwarded: number;
  amountInPaise: number;
  status: PurchaseStatus;
  createdAt: string;
  updatedAt: string;
}