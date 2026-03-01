export const dynamic = "force-dynamic";

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { athleteProfiles, profiles } from "@/lib/db/schema";
import { apiRateLimiter } from "@/lib/rate-limit";
import { computeNilEligible } from "@/lib/sports-data";
import { athleteProfileSchema } from "@/lib/validations";

export async function GET(request: Request) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = apiRateLimiter.check(ip);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const { data: session } = await auth.getSession();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});

	if (!profile) {
		return NextResponse.json({ athleteProfile: null });
	}

	const athleteProfile = await db.query.athleteProfiles.findFirst({
		where: eq(athleteProfiles.profileId, profile.id),
	});

	return NextResponse.json({ athleteProfile: athleteProfile ?? null });
}

export async function POST(request: Request) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = apiRateLimiter.check(ip);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const { data: session } = await auth.getSession();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});
	if (!profile) {
		return NextResponse.json({ error: "Profile not found" }, { status: 404 });
	}

	const existing = await db.query.athleteProfiles.findFirst({
		where: eq(athleteProfiles.profileId, profile.id),
	});
	if (existing) {
		return NextResponse.json({ error: "Onboarding already complete" }, { status: 409 });
	}

	const body = await request.json();
	const result = athleteProfileSchema.safeParse(body);
	if (!result.success) {
		return NextResponse.json({ error: "Invalid request", details: result.error }, { status: 400 });
	}

	const {
		sport,
		position,
		school,
		division,
		state,
		gradYear,
		eligibilityStatus,
		socialInstagram,
		socialTiktok,
		socialTwitter,
	} = result.data;
	const nilEligible = computeNilEligible(division, state);

	const [athleteProfile] = await db
		.insert(athleteProfiles)
		.values({
			profileId: profile.id,
			sport,
			position: position ?? "",
			school,
			division,
			state,
			gradYear,
			eligibilityStatus,
			nilEligible,
			socialInstagram: socialInstagram ?? "",
			socialTiktok: socialTiktok ?? "",
			socialTwitter: socialTwitter ?? "",
		})
		.returning();

	return NextResponse.json({ athleteProfile }, { status: 201 });
}
