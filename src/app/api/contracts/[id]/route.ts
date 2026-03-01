export const dynamic = "force-dynamic";

import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { contractReviews, profiles } from "@/lib/db/schema";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
	const { data: session } = await auth.getSession();
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await context.params;

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});
	if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

	const review = await db.query.contractReviews.findFirst({
		where: and(eq(contractReviews.id, id), eq(contractReviews.profileId, profile.id)),
	});
	if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

	const analysis = JSON.parse(review.analysisJson);
	return NextResponse.json({ review: { ...review, analysis } });
}
