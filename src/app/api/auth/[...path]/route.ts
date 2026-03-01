import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function withOrigin(request: NextRequest): NextRequest {
	const proto = request.headers.get("x-forwarded-proto") ?? "https";
	const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
	const origin = `${proto}://${host}`;
	const headers = new Headers(request.headers);
	headers.set("origin", origin);
	return new NextRequest(request.url, { method: request.method, headers, body: request.body });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	const { auth } = await import("@/lib/auth/server");
	const handler = auth.handler();
	return handler.GET(withOrigin(request), context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	const { auth } = await import("@/lib/auth/server");
	const handler = auth.handler();
	return handler.POST(withOrigin(request), context);
}
