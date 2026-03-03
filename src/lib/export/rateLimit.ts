const rateMap = new Map<string, number>();

const WINDOW_MS = 15_000;

export function checkExportRateLimit(key: string) {
  const now = Date.now();
  const previous = rateMap.get(key) ?? 0;
  if (now - previous < WINDOW_MS) {
    return {
      allowed: false,
      retryAfterMs: WINDOW_MS - (now - previous),
    };
  }

  rateMap.set(key, now);
  return {
    allowed: true,
    retryAfterMs: 0,
  };
}
