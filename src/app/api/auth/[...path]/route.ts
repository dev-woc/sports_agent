import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	const { auth } = await import("@/lib/auth/server");
	const handler = auth.handler();
	return handler.GET(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	const { auth } = await import("@/lib/auth/server");
	const handler = auth.handler();
	return handler.POST(request, context);
}
