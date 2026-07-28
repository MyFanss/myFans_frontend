"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateTipIntent, useConfirmTip } from "@/hooks/mutations/useCreateTip";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import { calculateFee } from "@/lib/api/tips";
import type { Creator } from "@/types/api";

type TipStep = "amount" | "confirm" | "processing" | "success" | "failed" | "cancelled";

const PRESET_AMOUNTS = [5, 10, 25, 50];
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 10000;
const PLATFORM_FEE_PERCENTAGE = 5;

interface TipCreatorModalProps {
  creator: Creator;
  isOpen: boolean;
  onClose: () => void;
}

export function TipCreatorModal({
  creator,
  isOpen,
  onClose,
}: TipCreatorModalProps) {
  const { data: user } = useCurrentUser();
  const [step, setStep] = useState<TipStep>("amount");
  const [amount, setAmount] = useState<string>("");
  const [customAmount, setCustomAmount] = useState(false);
  const [message, setMessage] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");
  const [intentId, setIntentId] = useState<string>("");
  const [tip, setTip] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const { mutate: createIntent, isPending: isCreatingIntent } = useCreateTipIntent({
    creatorId: creator.id,
    idempotencyKey,
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to create tip intent");
      setStep("failed");
    },
  });

  const { mutate: confirmTip, isPending: isConfirming } = useConfirmTip({
    creatorId: creator.id,
    onSuccess: (newTip) => {
      setTip(newTip);
      setStep("success");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to confirm tip");
      setStep("failed");
    },
  });

  // Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setStep("amount");
      setAmount("");
      setCustomAmount(false);
      setMessage("");
      setError("");
      setIdempotencyKey(crypto.randomUUID());
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    // Focus first interactive element
    const firstInput = dialogRef.current?.querySelector("input, button");
    (firstInput as HTMLElement)?.focus();

    return () => {
      triggerRef.current?.focus();
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  const isOwnProfile = user?.id === creator.id;
  const amountNum = parseFloat(amount) || 0;
  const isValidAmount = amountNum >= MIN_AMOUNT && amountNum <= MAX_AMOUNT;
  const fee = calculateFee({ amount: amountNum, platformFeePercentage: PLATFORM_FEE_PERCENTAGE });
  const isProcessing = step === "processing" || isCreatingIntent || isConfirming;

  const handleAmountSelect = (preset: number) => {
    setAmount(preset.toString());
    setCustomAmount(false);
  };

  const handleCustomAmount = () => {
    setCustomAmount(true);
    setAmount("");
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow numbers and single decimal point
    if (/^\d*\.?\d{0,2}$/.test(val) || val === "") {
      setAmount(val);
    }
  };

  const handleProceedToConfirm = () => {
    if (!isValidAmount) {
      setError(
        `Amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT}`
      );
      return;
    }
    setError("");
    setStep("confirm");
  };

  const handleConfirmTip = async () => {
    if (!isValidAmount) return;

    setStep("processing");
    setError("");

    try {
      // Step 1: Create intent (stub—no real payment)
      createIntent(
        {
          amount: amountNum,
          currency: "USD",
          message: message || undefined,
        },
        {
          onSuccess: (intent) => {
            setIntentId(intent.id);

            // Step 2: Confirm intent (stub—no real payment)
            confirmTip({
              intentId: intent.id,
              idempotencyKey,
            });
          },
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process tip");
      setStep("failed");
    }
  };

  const handleClose = () => {
    if (isProcessing) return; // Prevent close while processing
    if (step === "success") {
      onClose();
      return;
    }
    setStep("cancelled");
    onClose();
  };

  // Step 1: Amount selection
  if (step === "amount") {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-labelledby="tip-modal-title"
          aria-describedby="tip-modal-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 id="tip-modal-title" className="font-semibold text-lg">
              Tip {creator.name}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {isOwnProfile && (
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                You cannot tip your own profile.
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex gap-2">
                <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Presets */}
            <div>
              <p className="text-sm font-medium mb-3">Select amount or enter custom</p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === preset.toString() && !customAmount ? "default" : "outline"}
                    onClick={() => handleAmountSelect(preset)}
                    disabled={isOwnProfile}
                  >
                    ${preset.toFixed(2)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCustomAmount}
                disabled={isOwnProfile}
              >
                {customAmount ? "Enter custom amount" : "Custom amount"}
              </Button>

              {customAmount && (
                <div className="mt-2">
                  <label className="text-sm font-medium">
                    Amount (${MIN_AMOUNT} - ${MAX_AMOUNT})
                  </label>
                  <div className="flex gap-2 mt-2">
                    <span className="text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={MIN_AMOUNT}
                      max={MAX_AMOUNT}
                      value={amount}
                      onChange={handleAmountInput}
                      placeholder="0.00"
                      className="flex-1 px-2 py-1 border rounded text-sm"
                      disabled={isOwnProfile}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Message (optional) */}
            {amountNum > 0 && (
              <div>
                <label className="text-sm font-medium block mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                  placeholder="Leave a message for the creator..."
                  maxLength={200}
                  className="w-full px-3 py-2 border rounded text-sm"
                  rows={3}
                  disabled={isOwnProfile}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {message.length}/200
                </p>
              </div>
            )}

            {/* Fee preview */}
            {isValidAmount && (
              <div className="rounded-md bg-muted p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tip amount</span>
                  <span>${fee.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform fee ({PLATFORM_FEE_PERCENTAGE}%)</span>
                  <span>${fee.platformFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Creator receives</span>
                  <span>${fee.creatorReceives.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isOwnProfile}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleProceedToConfirm}
              disabled={!isValidAmount || isOwnProfile}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Confirm
  if (step === "confirm") {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="bg-background rounded-lg shadow-lg max-w-md w-full"
          role="dialog"
          aria-labelledby="tip-confirm-title"
        >
          <div className="flex items-center justify-between border-b p-4">
            <h2 id="tip-confirm-title" className="font-semibold text-lg">
              Confirm tip to {creator.name}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              aria-label="Close"
              disabled={isProcessing}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total to tip</span>
                <span>${fee.total.toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Platform fee ({PLATFORM_FEE_PERCENTAGE}%)</span>
                  <span>${fee.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-foreground">
                  <span>{creator.name} receives</span>
                  <span>${fee.creatorReceives.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {message && (
              <div className="bg-muted p-3 rounded text-sm">
                <p className="font-medium mb-1">Your message:</p>
                <p className="text-muted-foreground">{message}</p>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="border-t p-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("amount")}
              disabled={isProcessing}
            >
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmTip}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Confirm & Pay"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Processing
  if (step === "processing") {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="bg-background rounded-lg shadow-lg max-w-md w-full"
          role="dialog"
          aria-labelledby="tip-processing-title"
        >
          <div className="p-6 text-center space-y-4">
            <Loader2 className="size-8 animate-spin mx-auto text-blue-500" />
            <h2 id="tip-processing-title" className="font-semibold text-lg">
              Processing your tip...
            </h2>
            <p className="text-sm text-muted-foreground">
              Please don't close this window
            </p>
            <Button variant="outline" size="sm" disabled>
              Check status
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Success
  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="bg-background rounded-lg shadow-lg max-w-md w-full"
          role="dialog"
          aria-labelledby="tip-success-title"
        >
          <div className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <Check className="size-12 text-green-500 bg-green-50 rounded-full p-2" />
            </div>
            <h2 id="tip-success-title" className="font-semibold text-lg">
              Tip sent!
            </h2>
            <div className="bg-muted p-4 rounded text-sm space-y-2 text-left">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>${fee.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>To:</span>
                <span>{creator.name}</span>
              </div>
              {tip?.message && (
                <div className="mt-2 pt-2 border-t">
                  <p className="font-medium mb-1">Your message:</p>
                  <p className="text-muted-foreground">{tip.message}</p>
                </div>
              )}
            </div>
            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              View activity
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Failed
  if (step === "failed") {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="bg-background rounded-lg shadow-lg max-w-md w-full"
          role="dialog"
          aria-labelledby="tip-failed-title"
        >
          <div className="p-6 text-center space-y-4">
            <AlertCircle className="size-12 text-red-500 mx-auto" />
            <h2 id="tip-failed-title" className="font-semibold text-lg">
              Tip failed
            </h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="bg-muted p-3 rounded text-sm text-left">
              <p className="font-medium mb-1">Your amount:</p>
              <p>${fee.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t p-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep("amount")}
            >
              Try again
            </Button>
            <Button
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
