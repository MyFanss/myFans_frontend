"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validateSignupForm, getFieldError } from "@/lib/auth/validation";
import type { AuthResponse } from "@/types/api";

export function SignupForm() {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameError = getFieldError(validationErrors, "name");
  const emailError = getFieldError(validationErrors, "email");
  const passwordError = getFieldError(validationErrors, "password");
  const passwordConfirmationError = getFieldError(validationErrors, "passwordConfirmation");

  function clearServerError() {
    setServerError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationErrors([]);
    setServerError(null);

    // Validate form
    const errors = validateSignupForm(name, email, password, passwordConfirmation);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<AuthResponse>("/auth/signup", {
        name,
        email,
        password,
      });
      api.setToken(response.access_token);
      router.replace("/dashboard");
    } catch (error) {
      const errorMessage = 
        error instanceof Error ? error.message : "Signup failed. Please try again.";
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>
              Sign up to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearServerError();
                  }}
                  disabled={isSubmitting}
                  aria-invalid={nameError ? "true" : "false"}
                  aria-describedby={nameError ? "name-error" : undefined}
                  className="transition-all"
                />
                {nameError && (
                  <p id="name-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {nameError}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearServerError();
                  }}
                  disabled={isSubmitting}
                  aria-invalid={emailError ? "true" : "false"}
                  aria-describedby={emailError ? "email-error" : undefined}
                  className="transition-all"
                />
                {emailError && (
                  <p id="email-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearServerError();
                  }}
                  disabled={isSubmitting}
                  aria-invalid={passwordError ? "true" : "false"}
                  aria-describedby={passwordError ? "password-error" : undefined}
                  className="transition-all"
                />
                {passwordError && (
                  <p id="password-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {passwordError}
                  </p>
                )}
                {!passwordError && password && (
                  <p className="text-xs text-muted-foreground">
                    ✓ Password is at least 8 characters
                  </p>
                )}
              </div>

              {/* Password Confirmation Field */}
              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                <Input
                  id="passwordConfirmation"
                  type="password"
                  placeholder="••••••••"
                  value={passwordConfirmation}
                  onChange={(event) => {
                    setPasswordConfirmation(event.target.value);
                    clearServerError();
                  }}
                  disabled={isSubmitting}
                  aria-invalid={passwordConfirmationError ? "true" : "false"}
                  aria-describedby={passwordConfirmationError ? "password-confirmation-error" : undefined}
                  className="transition-all"
                />
                {passwordConfirmationError && (
                  <p id="password-confirmation-error" className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {passwordConfirmationError}
                  </p>
                )}
                {!passwordConfirmationError && password && passwordConfirmation && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ Passwords match
                  </p>
                )}
              </div>

              {/* Server Error Alert */}
              {serverError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3"
                >
                  <p className="text-sm text-red-800 dark:text-red-400">{serverError}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" disabled={isSubmitting} className="w-full mt-6">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Sign up"
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
