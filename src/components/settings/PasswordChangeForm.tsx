"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordChangeForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    // Stub: backend not yet available
    setTimeout(() => setStatus("success"), 800);
  }

  return (
    <section aria-labelledby="password-heading">
      <h2 id="password-heading" className="text-lg font-semibold mb-4">
        Change Password
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md"
        aria-label="Change password form"
      >
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            disabled={status === "loading"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={status === "loading"}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={status === "loading"}
          />
        </div>
        {status === "success" && (
          <p role="status" className="text-sm text-green-600 dark:text-green-400">
            Password updated successfully.
          </p>
        )}
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Updating…" : "Update password"}
        </Button>
      </form>
    </section>
  );
}
