import { describe, expect, test } from "vitest";
import { athleteProfileSchema, profileSchema, slugSchema } from "../validations";

describe("slugSchema", () => {
	test("valid slugs pass", () => {
		expect(slugSchema.safeParse("my-slug").success).toBe(true);
		expect(slugSchema.safeParse("abc").success).toBe(true);
		expect(slugSchema.safeParse("user123").success).toBe(true);
		expect(slugSchema.safeParse("a-b-c").success).toBe(true);
	});

	test("too short fails", () => {
		expect(slugSchema.safeParse("ab").success).toBe(false);
	});

	test("too long fails", () => {
		expect(slugSchema.safeParse("a".repeat(31)).success).toBe(false);
	});

	test("reserved slugs fail", () => {
		expect(slugSchema.safeParse("login").success).toBe(false);
		expect(slugSchema.safeParse("admin").success).toBe(false);
		expect(slugSchema.safeParse("api").success).toBe(false);
	});

	test("uppercase fails", () => {
		expect(slugSchema.safeParse("MySlug").success).toBe(false);
	});

	test("special characters fail", () => {
		expect(slugSchema.safeParse("my_slug").success).toBe(false);
		expect(slugSchema.safeParse("my slug").success).toBe(false);
		expect(slugSchema.safeParse("my@slug").success).toBe(false);
	});

	test("cannot start or end with hyphen", () => {
		expect(slugSchema.safeParse("-slug").success).toBe(false);
		expect(slugSchema.safeParse("slug-").success).toBe(false);
	});
});

describe("profileSchema", () => {
	test("valid profile passes", () => {
		const result = profileSchema.safeParse({
			displayName: "John Doe",
			bio: "Hello world",
			avatarUrl: "https://example.com/avatar.jpg",
		});
		expect(result.success).toBe(true);
	});

	test("bio over 160 chars fails", () => {
		const result = profileSchema.safeParse({
			displayName: "John",
			bio: "a".repeat(161),
			avatarUrl: "",
		});
		expect(result.success).toBe(false);
	});

	test("bio at exactly 160 chars passes", () => {
		const result = profileSchema.safeParse({
			displayName: "John",
			bio: "a".repeat(160),
			avatarUrl: "",
		});
		expect(result.success).toBe(true);
	});

	test("invalid avatar URL fails", () => {
		const result = profileSchema.safeParse({
			displayName: "John",
			bio: "",
			avatarUrl: "not-a-url",
		});
		expect(result.success).toBe(false);
	});

	test("empty avatar URL passes", () => {
		const result = profileSchema.safeParse({
			displayName: "John",
			bio: "",
			avatarUrl: "",
		});
		expect(result.success).toBe(true);
	});

	test("name over 50 chars fails", () => {
		const result = profileSchema.safeParse({
			displayName: "a".repeat(51),
			bio: "",
			avatarUrl: "",
		});
		expect(result.success).toBe(false);
	});
});

describe("athleteProfileSchema", () => {
	const valid = {
		sport: "Football",
		position: "QB",
		school: "University of Michigan",
		division: "D1",
		state: "MI",
		gradYear: 2026,
		eligibilityStatus: "Junior",
		socialInstagram: "@johndoe",
		socialTiktok: "",
		socialTwitter: "",
	};

	test("accepts valid athlete profile", () => {
		expect(athleteProfileSchema.safeParse(valid).success).toBe(true);
	});

	test("rejects empty sport", () => {
		expect(athleteProfileSchema.safeParse({ ...valid, sport: "" }).success).toBe(false);
	});

	test("rejects empty school", () => {
		expect(athleteProfileSchema.safeParse({ ...valid, school: "" }).success).toBe(false);
	});

	test("rejects invalid division", () => {
		expect(athleteProfileSchema.safeParse({ ...valid, division: "D5" }).success).toBe(false);
	});

	test("rejects state code longer than 2 chars", () => {
		expect(athleteProfileSchema.safeParse({ ...valid, state: "CAL" }).success).toBe(false);
	});

	test("rejects state code shorter than 2 chars", () => {
		expect(athleteProfileSchema.safeParse({ ...valid, state: "C" }).success).toBe(false);
	});

	test("rejects grad year below 2025", () => {
		expect(athleteProfileSchema.safeParse({ ...valid, gradYear: 2020 }).success).toBe(false);
	});

	test("rejects grad year above 2032", () => {
		expect(athleteProfileSchema.safeParse({ ...valid, gradYear: 2040 }).success).toBe(false);
	});

	test("accepts High School division", () => {
		expect(athleteProfileSchema.safeParse({ ...valid, division: "High School" }).success).toBe(
			true,
		);
	});

	test("accepts NAIA and NJCAA divisions", () => {
		expect(athleteProfileSchema.safeParse({ ...valid, division: "NAIA" }).success).toBe(true);
		expect(athleteProfileSchema.safeParse({ ...valid, division: "NJCAA" }).success).toBe(true);
	});

	test("accepts empty optional social fields", () => {
		const result = athleteProfileSchema.safeParse({
			...valid,
			socialInstagram: "",
			socialTiktok: "",
			socialTwitter: "",
		});
		expect(result.success).toBe(true);
	});

	test("position is optional", () => {
		const { position: _, ...withoutPosition } = valid;
		expect(athleteProfileSchema.safeParse(withoutPosition).success).toBe(true);
	});
});
