import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTipIntent,
  confirmTipIntent,
  getTipIntent,
} from "@/lib/api/tips";
import { queryKeys } from "@/lib/query-keys";
import type { Tip } from "@/types/api";

export interface UseCreateTipParams {
  creatorId: string;
  idempotencyKey: string;
  onSuccess?: (tip: Tip) => void;
  onError?: (error: Error) => void;
}

export function useCreateTipIntent({
  creatorId,
  idempotencyKey,
  onSuccess,
  onError,
}: UseCreateTipParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      amount: number;
      currency: string;
      message?: string;
    }) => {
      return createTipIntent({
        creatorId,
        amount: input.amount,
        currency: input.currency,
        message: input.message,
        idempotencyKey,
      });
    },
    onError: (error) => {
      const statusCode = error instanceof Error && "statusCode" in error ? error.statusCode : null;

      if (statusCode === 409) {
        // Conflict: intent already exists with this idempotency key
        // This is OK—retrieve it instead of failing
        console.info("Tip intent already exists (409 Conflict)");
      }

      onError?.(error);
    },
  });
}

export function useConfirmTip({
  creatorId,
  onSuccess,
  onError,
}: Omit<UseCreateTipParams, "idempotencyKey" | "creatorId"> & {
  creatorId: string;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      intentId: string;
      idempotencyKey: string;
      paymentMethodId?: string;
      nonce?: string;
    }) => {
      return confirmTipIntent({
        intentId: input.intentId,
        idempotencyKey: input.idempotencyKey,
        paymentMethodId: input.paymentMethodId,
        nonce: input.nonce,
      });
    },
    onSuccess: (tip) => {
      // Invalidate creator tips list
      queryClient.invalidateQueries({
        queryKey: queryKeys.tips.byCreator(creatorId),
      });

      // Invalidate creator profile (might have tip count)
      queryClient.invalidateQueries({
        queryKey: queryKeys.creators.detail(creatorId),
      });

      // Invalidate main tips list
      queryClient.invalidateQueries({
        queryKey: queryKeys.tips.all,
      });

      onSuccess?.(tip);
    },
    onError: (error) => {
      const statusCode = error instanceof Error && "statusCode" in error ? error.statusCode : null;

      if (statusCode === 401) {
        // Auto-refresh handled by client middleware
        return;
      }

      onError?.(error);
    },
  });
}
