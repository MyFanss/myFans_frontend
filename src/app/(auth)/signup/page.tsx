import { Suspense } from "react";
import Link from "next/link";
import { SignupForm } from "./signup-form";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export const metadata = {
  title: "Sign up | MyFans",
  description: "Create a new MyFans account",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
            <p className="text-center text-sm text-muted-foreground">
              Join MyFans to support creators or build your fanbase
            </p>
          </div>

          {/* Form */}
          <SignupForm />

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </Suspense>
  );
}
