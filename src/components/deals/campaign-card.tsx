"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BrandCampaign } from "@/types";

type ScoredCampaign = BrandCampaign & {
	matchScore: number;
	matchReasons: string[];
	complianceStatus: string;
	alreadyApplied: boolean;
};

const SCORE_COLOR: (score: number) => string = (score) => {
	if (score >= 80) return "text-green-600";
	if (score >= 60) return "text-yellow-600";
	return "text-orange-600";
};

const CATEGORY_LABELS: Record<string, string> = {
	nutrition: "Nutrition",
	apparel: "Apparel",
	equipment: "Equipment",
	fitness: "Fitness",
	health_wellness: "Health & Wellness",
	food_beverage: "Food & Beverage",
	local_business: "Local Business",
	media: "Media",
};

export function CampaignCard({ campaign }: { campaign: ScoredCampaign }) {
	const [applied, setApplied] = useState(campaign.alreadyApplied);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleApply() {
		setLoading(true);
		setError(null);
		const res = await fetch(`/api/deals/${campaign.id}/apply`, { method: "POST" });
		if (res.ok) {
			setApplied(true);
		} else {
			const data = await res.json().catch(() => ({}));
			setError(data.error ?? "Something went wrong.");
		}
		setLoading(false);
	}

	const description =
		campaign.description.length > 120
			? `${campaign.description.slice(0, 120)}...`
			: campaign.description;

	return (
		<div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
			<div className="flex items-start justify-between gap-2">
				<div>
					<p className="text-xs font-medium text-muted-foreground">{campaign.brandName}</p>
					<h3 className="font-semibold leading-tight">{campaign.campaignTitle}</h3>
				</div>
				<div className="flex flex-col items-end gap-1 shrink-0">
					<span className={`text-lg font-bold ${SCORE_COLOR(campaign.matchScore)}`}>
						{campaign.matchScore}
						<span className="text-xs font-normal text-muted-foreground">/100</span>
					</span>
					<span className="text-xs text-muted-foreground">match</span>
				</div>
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				<span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
					{CATEGORY_LABELS[campaign.productCategory] ?? campaign.productCategory}
				</span>
				<span className="text-xs text-muted-foreground">{campaign.budgetRange}</span>
			</div>

			<p className="text-sm text-muted-foreground">{description}</p>

			{campaign.matchReasons.length > 0 && (
				<ul className="space-y-1">
					{campaign.matchReasons.slice(0, 3).map((reason, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static list
						<li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
							<span className="mt-0.5 text-green-500">&#10003;</span>
							{reason}
						</li>
					))}
				</ul>
			)}

			{error && <p className="text-xs text-red-600">{error}</p>}

			<Button
				onClick={handleApply}
				disabled={applied || loading}
				variant={applied ? "secondary" : "default"}
				className="w-full"
			>
				{applied ? "Applied" : loading ? "Applying..." : "Apply"}
			</Button>
		</div>
	);
}
