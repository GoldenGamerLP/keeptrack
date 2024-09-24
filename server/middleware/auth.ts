import { verifyRequestOrigin } from "lucia";

import type { Session, User } from "lucia";
import { lucia } from "../utils/authUtils";

export default defineEventHandler(async (event) => {
	if (event.method !== "GET") {
		const originHeader = getHeader(event, "Origin") ?? null;
		// NOTE: You may need to use `X-Forwarded-Host` instead
		const hostHeader = getHeader(event, "Host") ?? null;
		if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
			return event.node.res.writeHead(403).end();
		}
	}

	const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
	if (!sessionId) {
		event.context.session = null;
		event.context.user = null;
		return;
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const cookie = lucia.createSessionCookie(session.id);
		setCookie(event, cookie.name, cookie.value, cookie.attributes);
	} else if (!session) {
		setCookie(event, lucia.sessionCookieName, "", { expires: new Date(0) });
	}

	event.context.session = session;
	event.context.user = user;
});

declare module "h3" {
	interface H3EventContext {
		user: User | null;
		session: Session | null;
	}
}