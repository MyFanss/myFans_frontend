import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export const metadata = {
  title: "Log in | MyFans",
  description: "Log in to your MyFans account",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-center text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Signup Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </Suspense>
  );
}
