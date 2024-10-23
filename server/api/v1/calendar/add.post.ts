import * as z from "zod";

export default defineEventHandler(async (req) => {
  try {
    const val = await readValidatedBody(req, schema.safeParseAsync);

    if (val.error) {
      throw createError({
        status: 400,
        message: val.error.message,
      });
    }

    const { date, workTimeFrom, workTimeTo, selectedGoal } = val.data;

    return await addWorkEntry(
      date,
      workTimeFrom,
      workTimeTo,
      selectedGoal,
      req.context.user?.id || ""
    );
  } catch (error) {
    console.error(error);
  }
});

const schema = z.object({
  date: z.coerce.date(),
  workTimeFrom: z.number().min(800).max(2300).int(),
  workTimeTo: z.number().min(800).max(2300).int(),
  selectedGoal: z.number().int(),
});
