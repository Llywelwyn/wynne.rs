const requests = new Map<string, number[]>();

export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = requests.get(key) ?? [];
  const recent = timestamps.filter(t => now - t < windowMs);

  if (recent.length >= maxRequests) {
    return true;
  }

  recent.push(now);
  requests.set(key, recent);
  return false;
}
