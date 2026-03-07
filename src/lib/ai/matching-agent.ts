import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { brandCampaigns, dealApplications } from "@/lib/db/schema";
import type { AthleteProfile, BrandCampaign } from "@/types";

const client = new Anthropic();

const MatchScoreSchema = z.object({
	score: z.number().int().min(0).max(100),
	reasons: z.array(z.string()),
	complianceStatus: z.enum(["compliant", "review_required"]),
	complianceNote: z.string().optional(),
});

export type MatchScore = z.infer<typeof MatchScoreSchema>;

export type ScoredCampaign = BrandCampaign & {
	matchScore: number;
	matchReasons: string[];
	complianceStatus: string;
	alreadyApplied: boolean;
};

const SYSTEM_PROMPT = `You are an NIL matching expert. Given an athlete profile and a brand campaign, score the match from 0-100 and explain why. Consider: sport/product relevance, audience fit, geographic alignment, and brand-athlete value alignment. Be honest — a 60 is a decent match, 80+ is excellent.`;

/** Hard-filter: returns false if this campaign is ineligible for the athlete */
export function passesHardFilters(athlete: AthleteProfile, campaign: BrandCampaign): boolean {
	if (!athlete.nilEligible) return false;

	if (campaign.geographyStates !== "ALL") {
		const states = campaign.geographyStates.split(",").map((s) => s.trim());
		if (!states.includes(athlete.state)) return false;
	}

	if (campaign.sportPreferences !== "ALL") {
		const sports = campaign.sportPreferences.split(",").map((s) => s.trim());
		if (!sports.includes(athlete.sport)) return false;
	}

	if (campaign.divisionPreferences !== "ALL") {
		const divisions = campaign.divisionPreferences.split(",").map((s) => s.trim());
		if (!divisions.includes(athlete.division)) return false;
	}

	return true;
}

export async function scoreCampaignMatch(
	athlete: AthleteProfile,
	campaign: BrandCampaign,
): Promise<MatchScore> {
	const athleteDesc = `Sport: ${athlete.sport}, Division: ${athlete.division}, School: ${athlete.school}, State: ${athlete.state}, Eligibility: ${athlete.eligibilityStatus}. Social: Instagram=${athlete.socialInstagram || "none"}, TikTok=${athlete.socialTiktok || "none"}.`;
	const campaignDesc = `Brand: ${campaign.brandName}. Campaign: ${campaign.campaignTitle}. Category: ${campaign.productCategory}. Budget: ${campaign.budgetRange}. Description: ${campaign.description}`;

	const response = await client.messages.create({
		model: "claude-sonnet-4-6",
		max_tokens: 512,
		system: SYSTEM_PROMPT,
		output_config: { format: zodOutputFormat(MatchScoreSchema) },
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: `Athlete: ${athleteDesc}\n\nCampaign: ${campaignDesc}\n\nScore this match.`,
					},
				],
			},
		],
	});

	const parsed = (response as { parsed_output?: MatchScore }).parsed_output;
	if (!parsed) throw new Error("Claude returned no structured output");
	return parsed;
}

/**
 * Fetch all active campaigns, apply hard filters for the athlete, score each with Claude,
 * and return sorted by score descending. Used by both the SSR page and the API route.
 */
export async function getMatchedCampaigns(
	profileId: string,
	athlete: AthleteProfile,
): Promise<ScoredCampaign[]> {
	const [allCampaigns, existingApplications] = await Promise.all([
		db.query.brandCampaigns.findMany({
			where: eq(brandCampaigns.isActive, true),
		}),
		db.query.dealApplications.findMany({
			where: eq(dealApplications.profileId, profileId),
			columns: { campaignId: true },
		}),
	]);

	const appliedCampaignIds = new Set(existingApplications.map((a) => a.campaignId));
	const eligible = allCampaigns.filter((c) => passesHardFilters(athlete, c));

	// Score all eligible campaigns in parallel; fall back gracefully on error
	const results = await Promise.allSettled(
		eligible.map((campaign) => scoreCampaignMatch(athlete, campaign)),
	);

	const scored: ScoredCampaign[] = eligible.map((campaign, i) => {
		const result = results[i];
		const matchData =
			result.status === "fulfilled"
				? result.value
				: {
						score: 50,
						reasons: ["Match score unavailable"],
						complianceStatus: "compliant" as const,
					};

		return {
			...campaign,
			matchScore: matchData.score,
			matchReasons: matchData.reasons,
			complianceStatus: matchData.complianceStatus,
			alreadyApplied: appliedCampaignIds.has(campaign.id),
		};
	});

	return scored.sort((a, b) => b.matchScore - a.matchScore);
}
