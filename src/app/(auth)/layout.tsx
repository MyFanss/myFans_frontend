import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - MyFans",
  description: "Sign in or create a new account",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
