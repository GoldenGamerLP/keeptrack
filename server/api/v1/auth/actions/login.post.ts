import {
  createSessionCookie,
  registerLogin,
  usernameToUserIdentity,
  verifyPassword,
} from "~/server/utils/authUtils";

import * as z from "zod";

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, loginRouteValidator.parse);

  const user = await usernameToUserIdentity(email);

  if (user === null) {
    throw createError({
      status: 401,
      statusText: "Invalid email or password",
    });
  }

  const currentId = user._id.toString();

  if (!(await verifyPassword(currentId, password))) {
    throw createError({
      status: 401,
      statusText: "Invalid email or password",
    });
  }

  const session = await registerLogin(
    currentId,
    getRequestIP(event) ?? "unknown"
  );

  const cookie = await createSessionCookie(session.id);
  setCookie(event, cookie.name, cookie.value, cookie.attributes);

  return !!cookie.value;
});

const loginRouteValidator = z.object({
  email: z.string().email(),
  password: z.string(),
});
