import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createRateLimiter } from "../rate-limit";

describe("createRateLimiter", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test("allows requests under the limit", () => {
		const limiter = createRateLimiter(3, 60_000);
		expect(limiter.check("user1").success).toBe(true);
		expect(limiter.check("user1").success).toBe(true);
		expect(limiter.check("user1").success).toBe(true);
	});

	test("blocks requests over the limit", () => {
		const limiter = createRateLimiter(2, 60_000);
		limiter.check("user1");
		limiter.check("user1");
		const result = limiter.check("user1");
		expect(result.success).toBe(false);
		expect(result.remaining).toBe(0);
	});

	test("tracks different keys independently", () => {
		const limiter = createRateLimiter(1, 60_000);
		expect(limiter.check("user1").success).toBe(true);
		expect(limiter.check("user2").success).toBe(true);
		expect(limiter.check("user1").success).toBe(false);
		expect(limiter.check("user2").success).toBe(false);
	});

	test("resets after window expires", () => {
		const limiter = createRateLimiter(1, 60_000);
		expect(limiter.check("user1").success).toBe(true);
		expect(limiter.check("user1").success).toBe(false);

		vi.advanceTimersByTime(60_001);

		expect(limiter.check("user1").success).toBe(true);
	});

	test("remaining count decreases correctly", () => {
		const limiter = createRateLimiter(3, 60_000);
		expect(limiter.check("user1").remaining).toBe(2);
		expect(limiter.check("user1").remaining).toBe(1);
		expect(limiter.check("user1").remaining).toBe(0);
	});
});
