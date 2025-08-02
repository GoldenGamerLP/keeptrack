import { fromDate, getLocalTimeZone } from "@internationalized/date";
import { getHoursBetweenDates } from "~/server/utils/keeptrack";
import * as z from "zod";

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    });
  }

  const { success, data, error } = await getValidatedQuery(
    event,
    validation.safeParseAsync
  );

  if (!success) {
    throw createError({
      status: 400,
      message: error.message,
    });
  }

  const { from, to } = data;

  const hours = await getHoursBetweenDates(
    user.id,
    fromDate(from, getLocalTimeZone()),
    fromDate(to, getLocalTimeZone())
  );

  return hours;
});

const validation = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});
