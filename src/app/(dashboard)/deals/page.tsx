export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { MatchFeed } from "@/components/deals/match-feed";
import type { ScoredCampaign } from "@/lib/ai/matching-agent";
import { getMatchedCampaigns } from "@/lib/ai/matching-agent";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { athleteProfiles, profiles } from "@/lib/db/schema";

export default async function DealsPage() {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect("/login");

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});

	const athleteProfile = profile
		? await db.query.athleteProfiles.findFirst({
				where: eq(athleteProfiles.profileId, profile.id),
			})
		: null;

	let campaigns: ScoredCampaign[] = [];
	if (profile && athleteProfile) {
		campaigns = await getMatchedCampaigns(profile.id, athleteProfile);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
			<div>
				<h1 className="text-2xl font-bold">NIL Matchmaker</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Brand campaigns matched to your sport and profile.
				</p>
			</div>
			<MatchFeed campaigns={campaigns} athleteOnboarded={!!athleteProfile} />
		</div>
	);
}
