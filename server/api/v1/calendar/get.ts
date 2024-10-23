import * as z from "zod";
import { getLocalTimeZone, fromDate } from "@internationalized/date";
import { getCalendarEntries } from "~/server/utils/keeptrack";

export default defineEventHandler(async (req) => {
  const val = await getValidatedQuery(req, schema.safeParseAsync);

  if (val.error) {
    throw createError({
      status: 400,
      message: val.error.message,
    });
  }

  const { date } = val.data;

  const entries = getCalendarEntries(req.context.user?.id || "", date);

  return (await entries).map((entry) =>
    fromDate(entry.workingDate, getLocalTimeZone()).toAbsoluteString()
  );
});

const schema = z.object({
  date: z.coerce.date(),
});
