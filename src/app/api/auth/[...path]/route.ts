import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function withOrigin(request: NextRequest): Promise<NextRequest> {
	const proto = request.headers.get("x-forwarded-proto") ?? "https";
	const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
	const origin = `${proto}://${host}`;
	const headers = new Headers(request.headers);
	headers.set("origin", origin);
	// Read body to string so it survives the NextRequest constructor (ReadableStream can't be re-streamed in Node.js without duplex:half)
	const body =
		request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined;
	return new NextRequest(request.url, { method: request.method, headers, body });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	const { auth } = await import("@/lib/auth/server");
	const handler = auth.handler();
	return handler.GET(await withOrigin(request), context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	const { auth } = await import("@/lib/auth/server");
	const handler = auth.handler();
	return handler.POST(await withOrigin(request), context);
}
