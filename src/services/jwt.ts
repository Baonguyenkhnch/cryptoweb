export type JwtPayload = {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
};

function decodeBase64UrlToString(input: string): string {
  // base64url -> base64
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // pad to length % 4 === 0
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  // Browser first
  if (typeof globalThis.atob === "function") {
    return globalThis.atob(padded);
  }

  // Fallback (shouldn't happen in Vite browser builds, but keeps this safe in tests)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyGlobal: any = globalThis as any;
  if (anyGlobal?.Buffer) {
    return anyGlobal.Buffer.from(padded, "base64").toString("binary");
  }

  throw new Error("No base64 decoder available");
}

export function isLikelyJwt(token: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every(p => p.length > 0);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  if (!isLikelyJwt(token)) return null;

  try {
    const [, payloadB64] = token.split(".");
    const payloadJson = decodeBase64UrlToString(payloadB64);
    const payload = JSON.parse(payloadJson) as JwtPayload;
    if (!payload || typeof payload !== "object") return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Returns the token expiry as epoch milliseconds, if the token looks like a JWT and contains `exp`.
 */
export function getJwtExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  const expSeconds = payload?.exp;
  if (typeof expSeconds !== "number" || !Number.isFinite(expSeconds)) return null;
  return expSeconds * 1000;
}

/**
 * Returns true/false when expiry exists; null when token has no readable expiry.
 */
export function isJwtExpired(token: string, skewMs: number = 0): boolean | null {
  const expMs = getJwtExpiryMs(token);
  if (expMs === null) return null;
  return Date.now() + skewMs >= expMs;
}
