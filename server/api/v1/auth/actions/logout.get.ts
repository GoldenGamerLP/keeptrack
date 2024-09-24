import { invalidateSession } from "~/server/utils/authUtils";

export default defineEventHandler(async (event) => {
  const session = event.context.session;

  if (!session) {
    return {
      status: 401,
      body: {
        error: "No session found",
      },
    };
  }
  
  await invalidateSession(session.id);

  return {
    status: 200,
  }
});
