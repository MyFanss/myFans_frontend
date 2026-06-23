"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useWatch } from "react-hook-form";
import { useProfileForm } from "@/hooks/useProfileForm";
import { useCurrentUser } from "@/hooks/queries/useCurrentUser";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Settings row ────────────────────────────────────────────────────────────
// Label + description on the left, control on the right. Standard professional
// settings-page pattern (Vercel / Linear / GitHub style).
function SettingsRow({
  label,
  description,
  children,
  divider = true,
}: {
  label: string;
  description?: string;
  children: ReactNode;
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
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── ProfileForm ─────────────────────────────────────────────────────────────
export function ProfileForm() {
  const { form, status, onSave, onCancel } = useProfileForm();
  const { data: currentUser } = useCurrentUser();

  const avatarUrl  = useWatch({ control: form.control, name: "avatarUrl" });
  const displayName = useWatch({ control: form.control, name: "displayName" });
  const bio        = useWatch({ control: form.control, name: "bio" });

  const hasAvatarError = !!form.formState.errors.avatarUrl;
  const isDirty   = form.formState.isDirty;
  const isLoading = status === "loading";

  const initial = displayName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="space-y-6">

      {/* ── Live profile preview ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        {/* Banner */}
        <div className="h-[72px] bg-gradient-to-r from-zinc-800 via-zinc-700/60 to-zinc-800" />

        {/* Avatar + meta */}
        <div className="px-6 pb-5 -mt-9">
          <div className="w-fit mb-3">
            {avatarUrl && !hasAvatarError ? (
              <Image
                src={avatarUrl}
                alt="Avatar preview"
                width={72}
                height={72}
                className="rounded-full object-cover ring-4 ring-zinc-900"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full ring-4 ring-zinc-900 bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center select-none">
                <span className="text-2xl font-semibold text-white">{initial}</span>
              </div>
            )}
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-semibold text-zinc-100 leading-tight">
                {displayName || <span className="text-zinc-600">Your Name</span>}
              </p>
              <p className="text-sm text-zinc-500 mt-0.5">
                {currentUser?.email ?? "—"}
              </p>
            </div>
            <span className="text-[11px] font-medium text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full mt-1">
              Preview
            </span>
          </div>

          {bio && (
            <p className="text-sm text-zinc-400 mt-2.5 max-w-sm leading-relaxed">{bio}</p>
          )}
        </div>
      </div>

      {/* ── Form card ────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-5 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Profile</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            This information will be displayed publicly on your profile.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} aria-label="Edit profile form">
            <div className="px-6">

              {/* Display name */}
              <SettingsRow
                label="Display name"
                description="Your public name shown to other users across the platform."
              >
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormControl>
                        <Input
                          placeholder="Your display name"
                          disabled={isLoading}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/25 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </SettingsRow>

              {/* Email */}
              <SettingsRow
                label="Email address"
                description="Used for login and notifications. Contact support to update your email."
              >
                <div className="relative">
                  <Input
                    id="profile-email"
                    type="email"
                    value={currentUser?.email ?? ""}
                    readOnly
                    disabled
                    aria-describedby="email-hint"
                    className="bg-zinc-800/40 border-zinc-700 text-zinc-500 cursor-default h-10 pr-24"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                    <span className="text-[11px] font-medium text-zinc-600 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded-md">
                      Read-only
                    </span>
                  </span>
                </div>
              </SettingsRow>

              {/* Bio */}
              <SettingsRow
                label="Bio"
                description="A short description about you, visible on your public profile."
              >
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormControl>
                        <Textarea
                          placeholder="Tell people a little about yourself…"
                          disabled={isLoading}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/25 resize-none min-h-[88px]"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex items-center justify-between">
                        <FormMessage className="text-red-400 text-xs" />
                        <p
                          className={cn(
                            "text-xs ml-auto tabular-nums",
                            (bio ?? "").length > 270
                              ? "text-amber-400"
                              : "text-zinc-600"
                          )}
                          aria-live="polite"
                        >
                          {(bio ?? "").length} / 300
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </SettingsRow>

              {/* Avatar URL */}
              <SettingsRow
                label="Avatar URL"
                description="Paste a public image URL. The preview card above updates in real time."
                divider={false}
              >
                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormControl>
                        <Input
                          placeholder="https://example.com/avatar.jpg"
                          type="url"
                          disabled={isLoading}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/25 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </SettingsRow>
            </div>

            {/* ── Card footer — actions ────────────────────────────────────── */}
            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || !isDirty}
                  className="bg-white text-zinc-900 hover:bg-zinc-200 font-medium h-9 px-5 disabled:opacity-40 transition-colors"
                >
                  {isLoading ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isLoading || !isDirty}
                  className="text-zinc-400 hover:text-zinc-100 border-zinc-700 h-9 disabled:opacity-40"
                >
                  Cancel
                </Button>

                {isDirty && status === "idle" && (
                  <p className="text-xs text-zinc-600 hidden sm:block">
                    Unsaved changes
                  </p>
                )}
              </div>

              {status === "success" && (
                <p role="status" className="text-sm text-emerald-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  Saved successfully
                </p>
              )}
              {status === "error" && (
                <p role="alert" className="text-sm text-red-400">
                  Failed to save — please try again.
                </p>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
