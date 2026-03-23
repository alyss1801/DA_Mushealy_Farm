import type { User } from "@/types";

export type AuthProviderMode = "local" | "supabase";

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthLoginContext {
  users: User[];
  userPasswords: Record<string, string>;
  demoCredentials?: Record<string, { password: string }>;
}

export interface AuthLoginResult {
  ok: boolean;
  user?: User;
  reason?: "invalid_credentials" | "inactive" | "provider_not_configured";
}

export function getAuthProviderMode(): AuthProviderMode {
  const mode = process.env.NEXT_PUBLIC_AUTH_PROVIDER;
  if (mode === "supabase") return "supabase";
  return "local";
}

function authenticateLocal(input: AuthLoginInput, context: AuthLoginContext): AuthLoginResult {
  const normalizedEmail = input.email.toLowerCase().trim();
  const user = context.users.find((candidate) => candidate.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return { ok: false, reason: "invalid_credentials" };
  }

  if (user.status === "inactive") {
    return { ok: false, reason: "inactive", user };
  }

  const expectedPassword =
    context.userPasswords[user.id]
    ?? context.demoCredentials?.[normalizedEmail]?.password
    ?? "123456";

  if (expectedPassword !== input.password) {
    return { ok: false, reason: "invalid_credentials" };
  }

  return { ok: true, user };
}

export async function authenticateUser(input: AuthLoginInput, context: AuthLoginContext): Promise<AuthLoginResult> {
  const mode = getAuthProviderMode();

  if (mode === "local") {
    return authenticateLocal(input, context);
  }

  // Stub for future backend auth integration; fallback behavior is explicit.
  return {
    ok: false,
    reason: "provider_not_configured",
  };
}
