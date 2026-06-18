import { Suspense } from "react";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-8">
          <p>Loading...</p>
        </main>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
