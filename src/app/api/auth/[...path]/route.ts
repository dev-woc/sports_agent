import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Forward-proxy approach: bypass the SDK handler so we control the exact
// Origin header sent to Neon Auth. The SDK recreates Request objects in
// ways that can drop or mangle the origin header in Vercel's Node.js runtime.
async function proxy(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
	const baseUrl = process.env.NEON_AUTH_BASE_URL;
	if (!baseUrl) return NextResponse.json({ error: "Auth not configured" }, { status: 500 });

	const { path } = await context.params;
	const pathStr = path.join("/");

	// Preserve query string
	const { search } = new URL(request.url);
	const upstreamUrl = `${baseUrl}/${pathStr}${search}`;

	// Use the browser-sent Origin header as primary source (most reliable).
	// Fall back to constructing from forwarding headers for non-browser callers.
	const browserOrigin = request.headers.get("origin");
	const appOrigin =
		browserOrigin ??
		(() => {
			const proto = request.headers.get("x-forwarded-proto") ?? "https";
			const host =
				request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
			return `${proto}://${host}`;
		})();

	const upstreamHeaders: Record<string, string> = {
		Origin: appOrigin,
		"x-neon-auth-middleware": "true",
	};

	// Forward content-type and authorization when present
	for (const h of ["content-type", "authorization", "user-agent"] as const) {
		const v = request.headers.get(h);
		if (v) upstreamHeaders[h] = v;
	}

	// Forward auth cookies only
	const cookie = request.headers.get("cookie") ?? "";
	const authCookies = cookie
		.split(";")
		.map((c) => c.trim())
		.filter((c) => c.startsWith("__neon-auth"))
		.join("; ");
	if (authCookies) upstreamHeaders["Cookie"] = authCookies;

	const body =
		request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined;

	const upstream = await fetch(upstreamUrl, {
		method: request.method,
		headers: upstreamHeaders,
		body,
	});

	// Build the response — forward all set-cookie and auth headers
	const resHeaders = new Headers();
	const FORWARD_HEADERS = [
		"content-type",
		"set-cookie",
		"set-auth-jwt",
		"set-auth-token",
		"x-neon-ret-request-id",
	];
	for (const h of FORWARD_HEADERS) {
		const v = upstream.headers.get(h);
		if (v) resHeaders.set(h, v);
	}
	// getSetCookie() returns all Set-Cookie headers as an array
	for (const sc of upstream.headers.getSetCookie?.() ?? []) {
		resHeaders.append("set-cookie", sc);
	}

	return new Response(upstream.body, {
		status: upstream.status,
		headers: resHeaders,
	});
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	return proxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	return proxy(request, context);
}
