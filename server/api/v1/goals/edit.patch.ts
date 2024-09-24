import * as z from "zod";
import { editGoal } from "~/server/utils/keeptrack";

export default defineEventHandler(async (req) => {
  const user = req.context.user;

  if (!user) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    });
  }

  const val = await readValidatedBody(req, schema.safeParseAsync);

  if (val.error) {
    throw createError({
      status: 400,
      message: val.error.message,
    });
  }

    const { title, description, salary, maxsalary, id, paydayofmonth } = val.data;

    await editGoal(id, title, description, salary, maxsalary, paydayofmonth, user.id);
});

const schema = z.object({
  title: z.string(),
  description: z.string(),
  salary: z.number(),
  maxsalary: z.number(),
  id: z.coerce.number(),
  paydayofmonth: z.coerce.number().min(1).max(31),
});
