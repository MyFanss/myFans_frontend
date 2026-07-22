"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, CheckCircle2, XCircle, Copy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import {
  getPayoutWallet,
  savePayoutWallet,
  disconnectPayoutWallet,
} from "@/lib/api/payouts";
import type { PayoutWallet } from "@/types/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

function maskAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const WALLET_PROVIDERS = [
  { id: "metamask", label: "MetaMask", icon: "🦊" },
  { id: "walletconnect", label: "WalletConnect", icon: "🔗" },
  { id: "coinbase", label: "Coinbase Wallet", icon: "🔵" },
] as const;

// ─── Settings row ───────────────────────────────────────────────────────────

function SettingsRow({
  label,
  description,
  children,
  divider = true,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4 md:gap-10 py-6",
        divider && "border-b border-zinc-800"
      )}
    >
      <div className="pt-0.5">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        {description && (
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── WalletConnectCard ──────────────────────────────────────────────────────

export function WalletConnectCard() {
  const [wallet, setWallet] = useState<PayoutWallet | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "connecting" | "disconnecting">("loading");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Connection form state
  const [selectedProvider, setSelectedProvider] = useState<string>("metamask");
  const [addressInput, setAddressInput] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);

  // Disconnect confirmation
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Load wallet ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);

    getPayoutWallet()
      .then((w) => {
        if (!cancelled) {
          setWallet(w);
          if (w) setAddressInput(w.address);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load wallet information.");
      })
      .finally(() => {
        if (!cancelled) setStatus("idle");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Copy handler ───────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    if (!wallet?.address) return;
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [wallet?.address]);

  // ── Connect handler ────────────────────────────────────────────────────
  const handleConnect = useCallback(async () => {
    // Validate address
    const trimmed = addressInput.trim();
    if (!trimmed) {
      setAddressError("Wallet address is required.");
      return;
    }
    if (!trimmed.startsWith("0x") || trimmed.length < 10) {
      setAddressError("Please enter a valid wallet address starting with 0x.");
      return;
    }
    setAddressError(null);
    setError(null);
    setSuccessMsg(null);
    setStatus("connecting");

    try {
      const provider = WALLET_PROVIDERS.find((p) => p.id === selectedProvider)?.label ?? selectedProvider;
      const result = await savePayoutWallet(trimmed, provider);
      setWallet(result);
      setSuccessMsg(
        `Wallet connected · ${maskAddress(result.address)}`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet.");
    } finally {
      setStatus("idle");
    }
  }, [addressInput, selectedProvider]);

  // ── Disconnect handler ─────────────────────────────────────────────────
  const handleDisconnect = useCallback(async () => {
    setShowDisconnectConfirm(false);
    setError(null);
    setSuccessMsg(null);
    setStatus("disconnecting");

    try {
      await disconnectPayoutWallet();
      setWallet(null);
      setSuccessMsg("Wallet disconnected successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to disconnect wallet.");
    } finally {
      setStatus("idle");
    }
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 flex items-center justify-center">
        <LoadingSpinner size="md" label="Loading wallet…" />
      </div>
    );
  }

  // ── Connected state ────────────────────────────────────────────────────
  if (wallet) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Payout Wallet</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Your earnings will be sent to this wallet address.
          </p>
        </div>

        <div className="px-6">
          {/* Provider */}
          <SettingsRow label="Provider" description="The wallet service you connected with.">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">
                {WALLET_PROVIDERS.find((p) => p.label === wallet.provider)?.icon ?? "💳"}
              </span>
              <span className="text-sm font-medium text-zinc-100">{wallet.provider}</span>
            </div>
          </SettingsRow>

          {/* Address */}
          <SettingsRow label="Wallet address" description="Your connected payout address.">
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono text-zinc-200 bg-zinc-800 rounded-md px-3 py-2 flex-1 break-all">
                {wallet.address}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 p-2 rounded-md border border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <CheckCircle2 className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </SettingsRow>

          {/* Connected since */}
          <SettingsRow label="Connected at" description="When this wallet was linked to your account." divider={false}>
            <p className="text-sm text-zinc-400">
              {new Date(wallet.connectedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </SettingsRow>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="size-4" />
              <span>Connected</span>
            </div>
          </div>

          {!showDisconnectConfirm ? (
            <Button
              type="button"
              variant="failure"
              size="sm"
              onClick={() => setShowDisconnectConfirm(true)}
              disabled={status === "disconnecting"}
            >
              {status === "disconnecting" ? (
                <>
                  <LoadingSpinner size="sm" />
                  Disconnecting…
                </>
              ) : (
                "Disconnect wallet"
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5" />
                Are you sure?
              </span>
              <Button
                type="button"
                variant="failure"
                size="sm"
                onClick={handleDisconnect}
                disabled={status === "disconnecting"}
              >
                {status === "disconnecting" ? "Disconnecting…" : "Yes, disconnect"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDisconnectConfirm(false)}
                disabled={status === "disconnecting"}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Status messages */}
        {successMsg && (
          <div className="px-6 py-3 border-t border-zinc-800 bg-emerald-500/5">
            <p role="status" className="text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="size-3.5" />
              {successMsg}
            </p>
          </div>
        )}
        {error && (
          <div className="px-6 py-3 border-t border-zinc-800 bg-red-500/5">
            <p role="alert" className="text-sm text-red-400 flex items-center gap-2">
              <XCircle className="size-3.5" />
              {error}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Disconnected state ─────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Card header */}
      <div className="px-6 py-5 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-100">Payout Wallet</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Connect a wallet to receive payouts. Currently this is a mock
          integration — paste a test address to preview the experience.
        </p>
      </div>

      <div className="px-6">
        {/* Provider selector — mock */}
        <SettingsRow
          label="Wallet provider"
          description="Choose your preferred wallet service to connect."
        >
          <div className="flex flex-wrap gap-2">
            {WALLET_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => setSelectedProvider(provider.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all",
                  selectedProvider === provider.id
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20"
                    : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
                )}
              >
                <span className="text-base">{provider.icon}</span>
                {provider.label}
              </button>
            ))}
          </div>
        </SettingsRow>

        {/* Address input */}
        <SettingsRow
          label="Wallet address"
          description="Paste your wallet address. For testing, use any valid 0x address."
          divider={false}
        >
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                if (addressError) setAddressError(null);
              }}
              disabled={status === "connecting"}
              className={cn(
                "bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/25 h-10 font-mono text-sm",
                addressError && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/25"
              )}
            />
            {addressError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5" role="alert">
                <XCircle className="size-3" />
                {addressError}
              </p>
            )}
          </div>
        </SettingsRow>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Wallet className="size-4" />
          <span>No wallet connected</span>
        </div>
        <Button
          type="button"
          onClick={handleConnect}
          disabled={status === "connecting"}
          className="bg-white text-zinc-900 hover:bg-zinc-200 font-medium h-9 px-5 disabled:opacity-40 transition-colors"
        >
          {status === "connecting" ? (
            <>
              <LoadingSpinner size="sm" />
              Connecting…
            </>
          ) : (
            "Connect wallet"
          )}
        </Button>
      </div>

      {/* Status messages */}
      {successMsg && (
        <div className="px-6 py-3 border-t border-zinc-800 bg-emerald-500/5">
          <p role="status" className="text-sm text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="size-3.5" />
            {successMsg}
          </p>
        </div>
      )}
      {error && (
        <div className="px-6 py-3 border-t border-zinc-800 bg-red-500/5">
          <p role="alert" className="text-sm text-red-400 flex items-center gap-2">
            <XCircle className="size-3.5" />
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
