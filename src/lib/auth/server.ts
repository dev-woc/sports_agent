import { createNeonAuth } from "@neondatabase/auth/next/server";

function createAuth() {
	const baseUrl = process.env.NEON_AUTH_BASE_URL;
	const secret = process.env.NEON_AUTH_COOKIE_SECRET;
	if (!baseUrl || !secret) {
		throw new Error("NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET must be set");
	}
	return createNeonAuth({ baseUrl, cookies: { secret } });
}

let _auth: ReturnType<typeof createAuth> | undefined;

export const auth = new Proxy({} as ReturnType<typeof createAuth>, {
	get(_target, prop) {
		if (!_auth) _auth = createAuth();
		return (_auth as any)[prop];
	},
});
