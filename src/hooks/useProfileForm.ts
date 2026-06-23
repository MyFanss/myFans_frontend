"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/profile";

const EMPTY_DEFAULTS: ProfileFormValues = {
  displayName: "",
  bio: "",
  avatarUrl: "",
};

export type SaveStatus = "idle" | "loading" | "success" | "error";

export function useProfileForm(initialValues: ProfileFormValues = EMPTY_DEFAULTS) {
  const [savedValues, setSavedValues] = useState<ProfileFormValues>(initialValues);
  const [status, setStatus] = useState<SaveStatus>("idle");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: savedValues,
  });

  async function onSave(values: ProfileFormValues) {
    setStatus("loading");
    try {
      // Mock save — swap for real API call later
      await new Promise<void>((resolve) => setTimeout(resolve, 900));
      setSavedValues(values);
      // Reset defaults so isDirty clears and Cancel snaps to the new saved state
      form.reset(values);
      setStatus("success");
      setTimeout(() => setStatus((s) => (s === "success" ? "idle" : s)), 3000);
    } catch {
      setStatus("error");
    }
  }

  function onCancel() {
    form.reset(savedValues);
    setStatus("idle");
  }

  return { form, status, onSave, onCancel };
}
