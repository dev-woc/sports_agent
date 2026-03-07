import { describe, expect, it, vi } from "vitest";

vi.mock("@anthropic-ai/sdk", () => {
	const mockCreate = vi.fn().mockResolvedValue({
		parsed_output: {
			score: 85,
			reasons: [
				"Sport alignment: Football matches campaign preferences",
				"National campaign — no geo restriction",
			],
			complianceStatus: "compliant",
		},
	});
	return {
		default: class {
			messages = { create: mockCreate };
		},
	};
});

// Mock drizzle db to avoid real DB calls in unit tests
vi.mock("@/lib/db", () => ({
	db: {
		query: {
			brandCampaigns: { findMany: vi.fn().mockResolvedValue([]) },
			dealApplications: { findMany: vi.fn().mockResolvedValue([]) },
		},
	},
}));

import type { AthleteProfile, BrandCampaign } from "@/types";
import { passesHardFilters, scoreCampaignMatch } from "../ai/matching-agent";

const mockAthlete: AthleteProfile = {
	id: "athlete-1",
	profileId: "profile-1",
	sport: "Football",
	position: "QB",
	school: "State University",
	division: "D1",
	state: "CA",
	gradYear: 2026,
	eligibilityStatus: "Junior",
	nilEligible: true,
	socialInstagram: "@athlete",
	socialTiktok: "",
	socialTwitter: "",
	createdAt: new Date(),
	updatedAt: new Date(),
};

const mockCampaign: BrandCampaign = {
	id: "campaign-1",
	brandName: "TestBrand",
	campaignTitle: "Test Campaign",
	description: "Test description",
	productCategory: "apparel",
	budgetRange: "$500-$1,000",
	geographyStates: "ALL",
	sportPreferences: "Football",
	divisionPreferences: "D1,D2",
	isActive: true,
	createdAt: new Date(),
};

describe("passesHardFilters", () => {
	it("returns true when athlete is eligible and campaign matches", () => {
		expect(passesHardFilters(mockAthlete, mockCampaign)).toBe(true);
	});

	it("returns false when athlete is not nil_eligible", () => {
		expect(passesHardFilters({ ...mockAthlete, nilEligible: false }, mockCampaign)).toBe(false);
	});

	it("returns false when athlete state not in campaign geography", () => {
		const campaign = { ...mockCampaign, geographyStates: "TX,FL" };
		expect(passesHardFilters(mockAthlete, campaign)).toBe(false);
	});

	it("returns false when athlete sport not in campaign sport preferences", () => {
		const campaign = { ...mockCampaign, sportPreferences: "Swimming,Volleyball" };
		expect(passesHardFilters(mockAthlete, campaign)).toBe(false);
	});

	it("returns false when athlete division not in campaign division preferences", () => {
		const campaign = { ...mockCampaign, divisionPreferences: "D3,NAIA" };
		expect(passesHardFilters(mockAthlete, campaign)).toBe(false);
	});

	it("returns true for ALL geography/sport/division", () => {
		const campaign = {
			...mockCampaign,
			geographyStates: "ALL",
			sportPreferences: "ALL",
			divisionPreferences: "ALL",
		};
		expect(passesHardFilters(mockAthlete, campaign)).toBe(true);
	});

	it("returns true when athlete state is in multi-state geography", () => {
		const campaign = { ...mockCampaign, geographyStates: "CA,TX,FL", sportPreferences: "ALL" };
		expect(passesHardFilters(mockAthlete, campaign)).toBe(true);
	});
});

describe("scoreCampaignMatch", () => {
	it("returns score, reasons, and complianceStatus from Claude", async () => {
		const result = await scoreCampaignMatch(mockAthlete, mockCampaign);
		expect(result.score).toBe(85);
		expect(result.reasons).toHaveLength(2);
		expect(result.complianceStatus).toBe("compliant");
	});
});
