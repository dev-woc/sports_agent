export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getMatchedCampaigns } from "@/lib/ai/matching-agent";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { athleteProfiles, profiles } from "@/lib/db/schema";
import { matchRateLimiter } from "@/lib/rate-limit";

export async function GET(request: Request) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = matchRateLimiter.check(ip);
	if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

	const { data: session } = await auth.getSession();
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});
	if (!profile) {
		return NextResponse.json({ campaigns: [], athleteOnboarded: false });
	}

	const athleteProfile = await db.query.athleteProfiles.findFirst({
		where: eq(athleteProfiles.profileId, profile.id),
	});
	if (!athleteProfile) {
		return NextResponse.json({
			campaigns: [],
			athleteOnboarded: false,
			message: "Complete onboarding to see matches",
		});
	}

	const campaigns = await getMatchedCampaigns(profile.id, athleteProfile);

	return NextResponse.json({ campaigns, athleteOnboarded: true });
}
