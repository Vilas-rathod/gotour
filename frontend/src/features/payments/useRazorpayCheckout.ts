import { useCallback } from 'react';
import { useInitiatePaymentMutation, useVerifyPaymentMutation } from './paymentsApi';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

// Razorpay Checkout is injected on the window by its script; typed loosely
// because the SDK ships no first-party types.
interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}
interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}
declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

/** Loads the Razorpay Checkout script once and resolves when it is ready. */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface PayArgs {
  bookingReference: string;
  prefill?: { name?: string; email?: string; contact?: string };
  /** Called after the payment is verified and the booking is confirmed. */
  onSuccess: () => void;
  /** Called on any failure (initiate, script load, verify, or a failed payment). */
  onError: (error: unknown) => void;
  /** Called when the customer closes the checkout without paying. */
  onDismiss?: () => void;
}

/**
 * Drives an online UPI / BHIM payment through Razorpay Checkout:
 * initiate the order server-side, open the hosted widget, then verify the
 * signed callback so the booking is only confirmed once the signature checks out.
 *
 * Razorpay credentials are supplied at deploy time; until then `initiate`
 * returns a "not configured" error which surfaces through {@link PayArgs.onError}.
 */
export function useRazorpayCheckout() {
  const [initiatePayment] = useInitiatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  return useCallback(
    async ({ bookingReference, prefill, onSuccess, onError, onDismiss }: PayArgs) => {
      try {
        const order = await initiatePayment({ bookingReference, method: 'RAZORPAY' }).unwrap();

        // A hosted-page provider would hand off via a URL instead of a widget.
        if (order.checkoutUrl) {
          window.location.assign(order.checkoutUrl);
          return;
        }

        const loaded = await loadRazorpayScript();
        if (!loaded || !window.Razorpay) {
          throw new Error('Could not load the secure checkout. Check your connection and try again.');
        }

        const razorpay = new window.Razorpay({
          key: order.publicKey,
          order_id: order.providerOrderId,
          amount: Math.round(order.amount * 100), // Razorpay works in paise.
          currency: order.currency,
          name: 'GoTour',
          description: `Booking ${order.bookingReference}`,
          prefill,
          theme: { color: '#0d9488' },
          // Surface UPI / BHIM first while still allowing the other methods.
          config: {
            display: {
              blocks: {
                upi: { name: 'Pay via UPI / BHIM', instruments: [{ method: 'upi' }] },
              },
              sequence: ['block.upi'],
              preferences: { show_default_blocks: true },
            },
          },
          handler: async (response: unknown) => {
            const result = response as {
              razorpay_payment_id: string;
              razorpay_signature: string;
            };
            try {
              await verifyPayment({
                paymentReference: order.paymentReference,
                providerPaymentId: result.razorpay_payment_id,
                signature: result.razorpay_signature,
              }).unwrap();
              onSuccess();
            } catch (error) {
              onError(error);
            }
          },
          modal: { ondismiss: () => onDismiss?.() },
        });

        razorpay.on('payment.failed', (response: unknown) => {
          const failure = response as { error?: { description?: string } };
          onError(new Error(failure.error?.description ?? 'The payment could not be completed.'));
        });

        razorpay.open();
      } catch (error) {
        onError(error);
      }
    },
    [initiatePayment, verifyPayment],
  );
}
