import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ContractReviewList } from "@/components/contracts/contract-review-list";
import { ContractUploadForm } from "@/components/contracts/contract-upload-form";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { contractReviews, profiles } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect("/login");

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});

	const reviews = profile
		? await db.query.contractReviews.findMany({
				where: eq(contractReviews.profileId, profile.id),
				columns: { rawText: false, analysisJson: false },
				orderBy: [desc(contractReviews.createdAt)],
			})
		: [];

	return (
		<div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
			<div>
				<h1 className="text-2xl font-bold">Contract Guard</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Upload an NIL contract to get an AI-powered risk analysis. Not legal advice.
				</p>
			</div>
			<ContractUploadForm />
			{reviews.length > 0 && <ContractReviewList reviews={reviews} />}
		</div>
	);
}
