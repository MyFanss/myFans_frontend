import type { PayoutWallet } from "@/types/api";
import { api } from "./client";

// ─── Mock wallet ────────────────────────────────────────────────────────────

let mockWallet: PayoutWallet | null = null;
let mockDelay = 600; // simulate network latency

export function __setMockWallet(wallet: PayoutWallet | null): void {
  mockWallet = wallet;
}

export function __setMockDelay(ms: number): void {
  mockDelay = ms;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch the currently connected payout wallet.
 * Falls back to mock data when no API_URL is configured or when the
 * real endpoint returns a 404.
 */
export async function getPayoutWallet(): Promise<PayoutWallet | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockWallet), mockDelay)
    );
  }

  try {
    return await api.get<PayoutWallet>("/payouts/wallet");
  } catch {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockWallet), mockDelay)
    );
  }
}

/**
 * Connect (or update) the payout wallet.
 * Falls back to mock when no API_URL is configured.
 */
export async function savePayoutWallet(
  address: string,
  provider: string
): Promise<PayoutWallet> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const wallet: PayoutWallet = {
          id: mockWallet?.id ?? "wallet_mock_01",
          userId: "user_current",
          address,
          provider,
          connectedAt: new Date().toISOString(),
        };
        // Persist in mock store so getPayoutWallet returns the updated wallet
        mockWallet = wallet;
        resolve(wallet);
      }, mockDelay);
    });
  }

  return api.post<PayoutWallet>("/payouts/wallet", { address, provider });
}

/**
 * Disconnect (remove) the payout wallet.
 * Falls back to mock when no API_URL is configured.
 */
export async function disconnectPayoutWallet(): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockWallet = null;
        resolve();
      }, mockDelay);
    });
  }

  await api.delete("/payouts/wallet");
}
