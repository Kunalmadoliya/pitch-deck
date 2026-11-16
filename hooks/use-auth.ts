"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

type SocialProvider = "google" | "github";

export function useSession() {
  return authClient.useSession();
}

export function useSignIn() {
  return async (provider: SocialProvider, callbackURL = "/") =>
    authClient.signIn.social({
      provider,
      callbackURL,
    });
}

export function useSignOut() {
  return async () => authClient.signOut();
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data, error } = await authClient.getSession();

      if (error) {
        throw error;
      }

      return data?.user ?? null;
    },
  });
}
