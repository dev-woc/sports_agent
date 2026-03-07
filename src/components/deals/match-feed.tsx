"use client";

import Link from "next/link";
import { CampaignCard } from "@/components/deals/campaign-card";
import type { BrandCampaign } from "@/types";

type ScoredCampaign = BrandCampaign & {
	matchScore: number;
	matchReasons: string[];
	complianceStatus: string;
	alreadyApplied: boolean;
};

export function MatchFeed({
	campaigns,
	athleteOnboarded,
}: {
	campaigns: ScoredCampaign[];
	athleteOnboarded: boolean;
}) {
	if (!athleteOnboarded) {
		return (
			<div className="rounded-xl border bg-card p-8 text-center">
				<h2 className="text-lg font-semibold">Complete your athlete profile</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					Finish onboarding so we can match you with brand campaigns suited to your sport, school,
					and state.
				</p>
				<Link
					href="/onboarding"
					className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
				>
					Complete Profile
				</Link>
			</div>
		);
	}

	if (campaigns.length === 0) {
		return (
			<div className="rounded-xl border bg-card p-8 text-center">
				<h2 className="text-lg font-semibold">No matches yet</h2>
				<p className="mt-2 text-sm text-muted-foreground">
					No campaigns matched your profile right now. Check back soon as new brands join the
					platform.
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{campaigns.map((campaign) => (
				<CampaignCard key={campaign.id} campaign={campaign} />
			))}
		</div>
	);
}
