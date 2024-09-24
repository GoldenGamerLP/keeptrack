import * as z from "zod";
import { deleteWorkingEntry } from "~/server/utils/keeptrack";

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

  const { id } = val.data;

  await deleteWorkingEntry(id, user.id);
});

const schema = z.object({
  id: z.coerce.number(),
});
