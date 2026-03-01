import https from "node:https";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// node:https bypasses the Fetch API's forbidden-header restriction.
// The built-in fetch (undici) silently strips "Origin" because it is a
// forbidden request header per the Fetch spec. Using node:https lets us
// set Origin explicitly so Neon Auth's origin check passes.
function httpsRequest(
	url: string,
	method: string,
	headers: Record<string, string>,
	body?: string,
): Promise<{ status: number; headers: Record<string, string | string[]>; body: string }> {
	return new Promise((resolve, reject) => {
		const parsed = new URL(url);
		const reqHeaders: Record<string, string> = { ...headers };
		if (body !== undefined) reqHeaders["content-length"] = Buffer.byteLength(body).toString();

		const req = https.request(
			{
				hostname: parsed.hostname,
				port: parsed.port || 443,
				path: parsed.pathname + parsed.search,
				method,
				headers: reqHeaders,
			},
			(res) => {
				const chunks: Buffer[] = [];
				res.on("data", (chunk: Buffer) => chunks.push(chunk));
				res.on("end", () => {
					resolve({
						status: res.statusCode ?? 200,
						headers: res.headers as Record<string, string | string[]>,
						body: Buffer.concat(chunks).toString("utf-8"),
					});
				});
			},
		);
		req.on("error", reject);
		if (body !== undefined) req.write(body);
		req.end();
	});
}

async function proxy(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
	const baseUrl = process.env.NEON_AUTH_BASE_URL;
	if (!baseUrl) return NextResponse.json({ error: "Auth not configured" }, { status: 500 });

	const { path } = await context.params;
	const pathStr = path.join("/");

	const { search } = new URL(request.url);
	const upstreamUrl = `${baseUrl}/${pathStr}${search}`;

	// Determine the app origin. Browsers omit Origin for same-origin requests;
	// extract it from Referer as a fallback.
	const refererOrigin = (() => {
		try {
			const ref = request.headers.get("referer");
			return ref ? new URL(ref).origin : null;
		} catch {
			return null;
		}
	})();
	const appOrigin =
		request.headers.get("origin") ??
		refererOrigin ??
		process.env.NEXT_PUBLIC_APP_URL ??
		(() => {
			const proto = request.headers.get("x-forwarded-proto") ?? "https";
			const host =
				request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
			return `${proto}://${host}`;
		})();

	const upstreamHeaders: Record<string, string> = {
		origin: appOrigin,
		"x-neon-auth-middleware": "true",
	};

	for (const h of ["content-type", "authorization", "user-agent"] as const) {
		const v = request.headers.get(h);
		if (v) upstreamHeaders[h] = v;
	}

	const cookie = request.headers.get("cookie") ?? "";
	const authCookies = cookie
		.split(";")
		.map((c) => c.trim())
		.filter((c) => c.startsWith("__neon-auth"))
		.join("; ");
	if (authCookies) upstreamHeaders["cookie"] = authCookies;

	const body =
		request.method !== "GET" && request.method !== "HEAD"
			? await request.text()
			: undefined;

	const upstream = await httpsRequest(upstreamUrl, request.method, upstreamHeaders, body);

	const resHeaders = new Headers();
	for (const [k, v] of Object.entries(upstream.headers)) {
		const lower = k.toLowerCase();
		if (lower === "content-type" || lower === "x-neon-ret-request-id") {
			resHeaders.set(k, Array.isArray(v) ? v[v.length - 1] : v);
		} else if (lower === "set-cookie") {
			// set-cookie may come as an array from node:https
			const cookies = Array.isArray(v) ? v : [v];
			for (const sc of cookies) resHeaders.append("set-cookie", sc);
		}
	}

	return new Response(upstream.body, {
		status: upstream.status,
		headers: resHeaders,
	});
}

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return proxy(request, context);
}

export async function POST(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return proxy(request, context);
}
