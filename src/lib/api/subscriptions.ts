import { api } from "./client";
import type { Subscription } from "@/types/api";

export async function listSubscriptions(): Promise<Subscription[]> {
  return api.get<Subscription[]>("/subscriptions");
}

export async function subscribeToCreator(creatorId: string): Promise<Subscription> {
  return api.post<Subscription>("/subscriptions", { creatorId });
}

export async function unsubscribeFromCreator(subscriptionId: string): Promise<void> {
  return api.delete(`/subscriptions/${subscriptionId}`);
}
