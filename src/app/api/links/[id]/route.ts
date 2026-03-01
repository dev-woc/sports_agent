export const dynamic = "force-dynamic";

import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { linkItems, profiles } from "@/lib/db/schema";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
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

	const { id } = await params;

	const link = await db.query.linkItems.findFirst({
		where: eq(linkItems.id, id),
	});

	if (!link) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	if (link.profileId !== profile.id) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	await db.delete(linkItems).where(and(eq(linkItems.id, id), eq(linkItems.profileId, profile.id)));

	return NextResponse.json({ success: true });
}
