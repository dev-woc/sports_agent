export const dynamic = "force-dynamic";

import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { analyzeContract } from "@/lib/ai/contract-agent";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { contractReviews, profiles } from "@/lib/db/schema";
import { contractRateLimiter } from "@/lib/rate-limit";

export async function GET(request: Request) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = contractRateLimiter.check(ip);
	if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

	const { data: session } = await auth.getSession();
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});
	if (!profile) return NextResponse.json({ reviews: [] });

	const reviews = await db.query.contractReviews.findMany({
		where: eq(contractReviews.profileId, profile.id),
		orderBy: [desc(contractReviews.createdAt)],
		columns: { rawText: false, analysisJson: false },
	});

	return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = contractRateLimiter.check(ip);
	if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

	const { data: session } = await auth.getSession();
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});
	if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

	const contentType = request.headers.get("content-type") ?? "";
	let fileName = "";
	let rawText = "";
	let pdfBase64: string | undefined;

	if (contentType.includes("multipart/form-data")) {
		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const text = formData.get("text") as string | null;
		if (file) {
			fileName = file.name;
			const buffer = Buffer.from(await file.arrayBuffer());
			pdfBase64 = buffer.toString("base64");
		}
		if (text) rawText = text;
	} else {
		const body = await request.json();
		fileName = body.fileName ?? "";
		rawText = body.rawText ?? "";
		pdfBase64 = body.pdfBase64;
	}

	if (!rawText && !pdfBase64) {
		return NextResponse.json({ error: "Must provide file or text" }, { status: 400 });
	}

	let analysis: Awaited<ReturnType<typeof analyzeContract>>;
	try {
		analysis = await analyzeContract({ fileName, rawText, pdfBase64 });
	} catch (err) {
		console.error("[contract-guard] AI analysis failed:", err);
		return NextResponse.json(
			{ error: "Contract analysis failed. Please try again." },
			{ status: 500 },
		);
	}

	const [review] = await db
		.insert(contractReviews)
		.values({
			profileId: profile.id,
			fileName,
			rawText: rawText.slice(0, 100_000),
			analysisJson: JSON.stringify(analysis),
			overallRisk: analysis.overallRisk,
			flagCount: analysis.flags.length,
		})
		.returning();

	return NextResponse.json({ review: { ...review, analysis } }, { status: 201 });
}
