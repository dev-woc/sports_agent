import { describe, expect, it, vi } from "vitest";

vi.mock("@anthropic-ai/sdk", () => {
	const mockCreate = vi.fn().mockResolvedValue({
		parsed_output: {
			overallRisk: "critical",
			attorneyRecommended: true,
			summary: "This contract contains severe predatory clauses.",
			flags: [
				{
					category: "perpetuity",
					severity: "critical",
					clauseText: "in perpetuity throughout the universe",
					explanation: "This grants rights forever with no end date.",
					recommendation: "reject_seek_attorney",
				},
			],
			disclaimer: "Not legal advice.",
		},
	});
	return {
		default: class {
			messages = { create: mockCreate };
		},
	};
});

import { analyzeContract } from "../ai/contract-agent";

describe("analyzeContract", () => {
	it("returns structured analysis from text input", async () => {
		const result = await analyzeContract({
			fileName: "test.txt",
			rawText: "in perpetuity throughout the universe",
		});
		expect(result.overallRisk).toBe("critical");
		expect(result.flags).toHaveLength(1);
		expect(result.flags[0].category).toBe("perpetuity");
		expect(result.attorneyRecommended).toBe(true);
	});

	it("throws when no text or pdf provided", async () => {
		await expect(analyzeContract({ fileName: "" })).rejects.toThrow("Must provide");
	});
});
