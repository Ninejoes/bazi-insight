type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  )
    .split(",")[0]
    .trim()
    .slice(0, 80);
}

export function checkRateLimit(
  request: Request,
  scope: string,
  limit = 10,
  windowMs = 15 * 60 * 1000,
): { allowed: boolean; waitSeconds?: number } {
  const ip = getClientIp(request);
  const now = Date.now();
  const key = `${scope}:${ip}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const waitSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return { allowed: false, waitSeconds };
  }

  return { allowed: true };
}
