interface RateLimitEntry {
	count: number;
	resetTime: number;
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
	const store = new Map<string, RateLimitEntry>();

	return {
		check(key: string): { success: boolean; remaining: number } {
			const now = Date.now();
			const entry = store.get(key);
			if (!entry || now > entry.resetTime) {
				store.set(key, { count: 1, resetTime: now + windowMs });
				return { success: true, remaining: maxRequests - 1 };
			}
			if (entry.count >= maxRequests) {
				return { success: false, remaining: 0 };
			}
			entry.count++;
			return { success: true, remaining: maxRequests - entry.count };
		},
		reset() {
			store.clear();
		},
	};
}

export const apiRateLimiter = createRateLimiter(30, 60_000);
export const slugCheckRateLimiter = createRateLimiter(60, 60_000);
export const contractRateLimiter = createRateLimiter(5, 60_000);
export const matchRateLimiter = createRateLimiter(20, 60_000);
