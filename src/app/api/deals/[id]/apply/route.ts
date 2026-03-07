export const dynamic = "force-dynamic";

import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { passesHardFilters, scoreCampaignMatch } from "@/lib/ai/matching-agent";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { athleteProfiles, brandCampaigns, dealApplications, profiles } from "@/lib/db/schema";
import { matchRateLimiter } from "@/lib/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = matchRateLimiter.check(ip);
	if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

	const { data: session } = await auth.getSession();
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});
	if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

	const athleteProfile = await db.query.athleteProfiles.findFirst({
		where: eq(athleteProfiles.profileId, profile.id),
	});
	if (!athleteProfile) {
		return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });
	}

	const campaign = await db.query.brandCampaigns.findFirst({
		where: and(eq(brandCampaigns.id, id), eq(brandCampaigns.isActive, true)),
	});
	if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

	if (!passesHardFilters(athleteProfile, campaign)) {
		return NextResponse.json({ error: "Not eligible for this campaign" }, { status: 400 });
	}

	const existing = await db.query.dealApplications.findFirst({
		where: and(eq(dealApplications.campaignId, id), eq(dealApplications.profileId, profile.id)),
	});
	if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 });

	let matchScore = 50;
	let matchReasons: string[] = [];
	try {
		const scored = await scoreCampaignMatch(athleteProfile, campaign);
		matchScore = scored.score;
		matchReasons = scored.reasons;
	} catch {
		matchReasons = ["Match score unavailable"];
	}

	const [application] = await db
		.insert(dealApplications)
		.values({
			campaignId: id,
			profileId: profile.id,
			status: "pending",
			matchScore,
			matchReasons: JSON.stringify(matchReasons),
		})
		.returning();

	return NextResponse.json({ application }, { status: 201 });
}
