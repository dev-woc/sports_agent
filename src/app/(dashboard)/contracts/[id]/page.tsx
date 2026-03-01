import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import type { ContractAnalysis } from "@/lib/ai/contract-agent";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { contractReviews, profiles } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const SEVERITY_BADGE: Record<string, string> = {
	critical: "bg-red-100 text-red-800 border-red-200",
	high: "bg-orange-100 text-orange-800 border-orange-200",
	medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
	low: "bg-green-100 text-green-800 border-green-200",
};

export default async function ContractReviewPage({ params }: { params: Promise<{ id: string }> }) {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect("/login");

	const { id } = await params;

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});
	if (!profile) notFound();

	const review = await db.query.contractReviews.findFirst({
		where: and(eq(contractReviews.id, id), eq(contractReviews.profileId, profile.id)),
	});
	if (!review) notFound();

	const analysis: ContractAnalysis = JSON.parse(review.analysisJson);

	return (
		<div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
			<div>
				<h1 className="text-2xl font-bold">{review.fileName || "Contract Review"}</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Overall risk: <span className="font-semibold capitalize">{review.overallRisk}</span>
					{analysis.attorneyRecommended && (
						<span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
							Attorney review recommended
						</span>
					)}
				</p>
			</div>

			<div className="rounded-lg border bg-card p-4">
				<p className="text-sm leading-relaxed">{analysis.summary}</p>
			</div>

			<div className="space-y-3">
				<h2 className="text-lg font-semibold">Risk Flags ({analysis.flags.length})</h2>
				{analysis.flags.length === 0 && (
					<p className="text-sm text-muted-foreground">No significant risk flags detected.</p>
				)}
				{analysis.flags.map((flag, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: flags have no stable id
					<div key={i} className={`rounded-lg border p-4 ${SEVERITY_BADGE[flag.severity] ?? ""}`}>
						<div className="mb-2 flex items-center justify-between">
							<span className="text-xs font-semibold uppercase tracking-wide">
								{flag.category.replace(/_/g, " ")}
							</span>
							<span className="text-xs font-semibold uppercase">{flag.severity}</span>
						</div>
						<blockquote className="mb-2 border-l-2 border-current pl-2 text-xs italic opacity-70">
							&ldquo;{flag.clauseText.slice(0, 200)}
							{flag.clauseText.length > 200 ? "..." : ""}&rdquo;
						</blockquote>
						<p className="text-sm">{flag.explanation}</p>
						<p className="mt-2 text-xs font-medium">
							Recommendation: {flag.recommendation.replace(/_/g, " ")}
						</p>
					</div>
				))}
			</div>

			<p className="border-t pt-4 text-xs text-muted-foreground">{analysis.disclaimer}</p>
		</div>
	);
}
