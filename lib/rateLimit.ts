import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (uses anon key — table has permissive RLS policy)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANON_DAILY_LIMIT = 5;
const USER_DAILY_LIMIT = 20;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

/**
 * Checks and records AI feature usage.
 * - identifier: IP address (for anonymous) or user ID (for logged-in users)
 * - identifierType: "ip" or "user"
 * - feature: "summarize" | "predict" (or any feature key)
 *
 * Returns whether the request is allowed, and remaining quota.
 * If allowed, this function ALSO records the usage (call once per request).
 */
export async function checkAndRecordUsage(
  identifier: string,
  identifierType: "ip" | "user",
  feature: string
): Promise<RateLimitResult> {
  const limit = identifierType === "user" ? USER_DAILY_LIMIT : ANON_DAILY_LIMIT;

  // 24-hour rolling window
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from("ai_usage")
    .select("*", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("identifier_type", identifierType)
    .gte("used_at", since);

  if (error) {
    console.error("Rate limit check error:", error);
    // Fail open (allow request) if the usage table check fails,
    // to avoid blocking users due to infra issues.
    return { allowed: true, remaining: limit, limit };
  }

  const used = count ?? 0;

  if (used >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  // Record this usage
  await supabaseAdmin.from("ai_usage").insert([{
    identifier,
    identifier_type: identifierType,
    feature,
  }]);

  return { allowed: true, remaining: limit - used - 1, limit };
}

/**
 * Extracts a client IP address from a Next.js Request object.
 * Checks common proxy headers (Vercel, Cloudflare, etc.) before falling back.
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
