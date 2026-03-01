import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	const headers: Record<string, string> = {};
	request.headers.forEach((value, key) => {
		headers[key] = value;
	});
	const origin =
		headers["origin"] ||
		headers["referer"]?.split("/").slice(0, 3).join("/") ||
		new URL(request.url).origin;
	return Response.json({ headers, computed_origin: origin, request_url: request.url });
}
