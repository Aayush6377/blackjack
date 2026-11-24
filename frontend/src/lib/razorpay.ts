import type { RazorpayCheckoutOptions, RazorpayInstance } from "../types/payment";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayConstructor = new (
  options: RazorpayCheckoutOptions
) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<RazorpayConstructor> | null = null;

export function loadRazorpayCheckout(): Promise<RazorpayConstructor> {
  if (typeof window !== "undefined" && window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<RazorpayConstructor>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          reject(new Error("Razorpay Checkout loaded without Razorpay global"));
        }
      });
      existingScript.addEventListener("error", () => {
        scriptPromise = null;
        reject(new Error("Failed to load Razorpay Checkout script"));
      });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        scriptPromise = null;
        reject(new Error("Razorpay Checkout unavailable after script load"));
      }
    };

    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Razorpay Checkout script"));
    };

    document.body.appendChild(script);
  });

  return scriptPromise;
}