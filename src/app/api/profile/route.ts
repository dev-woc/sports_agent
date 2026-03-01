export const dynamic = "force-dynamic";

import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { linkItems, profiles } from "@/lib/db/schema";
import { apiRateLimiter } from "@/lib/rate-limit";
import { profileSchema, slugSchema } from "@/lib/validations";

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
		return NextResponse.json({ profile: null, links: [] });
	}

	const links = await db.query.linkItems.findMany({
		where: eq(linkItems.profileId, profile.id),
		orderBy: [asc(linkItems.sortOrder)],
	});

	return NextResponse.json({ profile, links });
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

	const existing = await db.query.profiles.findFirst({
		where: eq(profiles.userId, session.user.id),
	});
	if (existing) {
		return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
	}

	const body = await request.json();
	const slugResult = slugSchema.safeParse(body.slug);
	if (!slugResult.success) {
		return NextResponse.json({ error: slugResult.error.issues[0]?.message }, { status: 400 });
	}

	const slugTaken = await db.query.profiles.findFirst({
		where: eq(profiles.slug, body.slug),
	});
	if (slugTaken) {
		return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
	}

	const [profile] = await db
		.insert(profiles)
		.values({
			userId: session.user.id,
			slug: body.slug,
			displayName: body.displayName ?? "",
		})
		.returning();

	return NextResponse.json({ profile }, { status: 201 });
}

export async function PUT(request: Request) {
	const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
	const { success } = apiRateLimiter.check(ip);
	if (!success) {
		return NextResponse.json({ error: "Too many requests" }, { status: 429 });
	}

	const { data: session } = await auth.getSession();
	if (!session?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const result = profileSchema.safeParse(body);
	if (!result.success) {
		return NextResponse.json({ error: result.error.issues[0]?.message }, { status: 400 });
	}

	const [profile] = await db
		.update(profiles)
		.set({
			displayName: result.data.displayName,
			bio: result.data.bio,
			avatarUrl: result.data.avatarUrl,
			theme: result.data.theme,
			updatedAt: new Date(),
		})
		.where(eq(profiles.userId, session.user.id))
		.returning();

	return NextResponse.json({ profile });
}
