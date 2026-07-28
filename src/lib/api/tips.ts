import { api } from "@/lib/api/client";
import type { TipIntent, TipConfirmation, Tip, FeeBreakdown } from "@/types/api";

export interface CreateTipIntentParams {
  creatorId: string;
  amount: number;
  currency?: string;
  message?: string;
  idempotencyKey: string;
}

export interface ConfirmTipIntentParams {
  intentId: string;
  idempotencyKey: string;
  paymentMethodId?: string;
  nonce?: string;
}

export interface GetTipsParams {
  creatorId?: string;
  cursor?: string;
  limit?: number;
}

export interface CalculateFeeParams {
  amount: number;
  platformFeePercentage?: number;
}

// Tip Intent API
export async function createTipIntent({
  creatorId,
  amount,
  currency = "USD",
  message,
  idempotencyKey,
}: CreateTipIntentParams): Promise<TipIntent> {
  return api.post("/tips/intents", {
    creatorId,
    amount,
    currency,
    ...(message && { message }),
    idempotencyKey,
  });
}

export async function confirmTipIntent({
  intentId,
  idempotencyKey,
  paymentMethodId,
  nonce,
}: ConfirmTipIntentParams): Promise<Tip> {
  return api.post(`/tips/intents/${intentId}/confirm`, {
    idempotencyKey,
    ...(paymentMethodId && { paymentMethodId }),
    ...(nonce && { nonce }),
  });
}

export async function getTipIntent(intentId: string): Promise<TipIntent> {
  return api.get(`/tips/intents/${intentId}`);
}

// Tips List
export async function getTips({
  creatorId,
  cursor,
  limit = 20,
}: GetTipsParams): Promise<{ tips: Tip[]; cursor?: string; hasMore?: boolean }> {
  return api.get("/tips", {
    params: {
      ...(creatorId && { creatorId }),
      ...(cursor && { cursor }),
      limit,
    },
  });
}

// Fee Calculation (client-side stub, server should validate)
export function calculateFee({
  amount,
  platformFeePercentage = 5,
}: CalculateFeeParams): FeeBreakdown {
  const platformFee = Math.round(amount * (platformFeePercentage / 100) * 100) / 100;
  const creatorReceives = amount - platformFee;

  return {
    platformFee,
    creatorReceives,
    total: amount,
    platformFeePercentage,
  };
}
