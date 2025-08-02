import { getEarnedStatistics, getStatistics } from "~/server/utils/keeptrack";
import * as z from "zod";

export default defineEventHandler(async (req) => {
  const user = req.context.user;

  if(!user) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    });
  }

  const { success, data, error } = await getValidatedQuery(req, validation.safeParseAsync);

  if (!success) {
    throw createError({
      status: 400,
      message: error.message,
    });
  }

  const { from, to } = data;

  return await getEarnedStatistics(user.id, from, to);
});

const validation = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
})


//Format index: Month, value: { lastYear: number, thisYear: number }
