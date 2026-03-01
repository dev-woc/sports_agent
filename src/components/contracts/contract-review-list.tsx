import Link from "next/link";
import type { ContractReview } from "@/types";

const RISK_COLORS: Record<string, string> = {
	low: "text-green-600",
	medium: "text-yellow-600",
	high: "text-orange-600",
	critical: "text-red-600",
};

export function ContractReviewList({
	reviews,
}: {
	reviews: Omit<ContractReview, "rawText" | "analysisJson">[];
}) {
	return (
		<div className="space-y-3">
			<h2 className="text-lg font-semibold">Past Reviews</h2>
			{reviews.map((r) => (
				<Link
					key={r.id}
					href={`/contracts/${r.id}`}
					className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 hover:bg-muted"
				>
					<div>
						<p className="font-medium">{r.fileName || "Pasted contract"}</p>
						<p className="text-xs text-muted-foreground">
							{r.flagCount} flag{r.flagCount !== 1 ? "s" : ""}
						</p>
					</div>
					<span className={`text-sm font-semibold capitalize ${RISK_COLORS[r.overallRisk] ?? ""}`}>
						{r.overallRisk}
					</span>
				</Link>
			))}
		</div>
	);
}
