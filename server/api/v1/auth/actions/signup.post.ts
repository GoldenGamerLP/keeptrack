import {
  createSession,
  createSessionCookie,
  lucia,
  registerLogin,
  usernameToUserIdentity,
} from "~/server/utils/authUtils";

import * as z from "zod";


export default defineEventHandler(async (event) => {
  const { password, email, displayName } = await readValidatedBody(
    event,
    registerRouteValidator.parse
  );

  const user = await usernameToUserIdentity(email);

  if (user !== null) {
    throw createError({
      status: 401,
      statusText: "Email already exists",
    });
  }

  const res = await createUser(email, password, displayName);
  if (!res.insertedId) {
    throw createError({
      status: 500,
      statusText: "Failed to create user",
    });
  }

  const currentId = res.user._id.toString();

  const session = await registerLogin(
    currentId,
    getRequestIP(event) ?? "unknown"
  );
  
  const cookie = await createSessionCookie(session.id);
  setCookie(event, cookie.name, cookie.value, cookie.attributes);

  return !!cookie.value;
});

const registerRouteValidator = z.object({
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
  displayName: z.string(),
});
