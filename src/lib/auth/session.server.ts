import { cookies } from "next/headers";
import { AUTH_TOKEN_COOKIE } from "./constants";

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE)?.value ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return Boolean(token);
}
