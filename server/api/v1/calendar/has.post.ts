import { z } from "zod";
import { hasWorkedAt } from "~/server/utils/keeptrack";

export default defineEventHandler(async (req) => {
    const val = await readValidatedBody(req, schema.safeParseAsync);

    if (val.error) {
        throw createError({
            status: 400,
            message: val.error.message,
        });
    }

    const hasWorked = await hasWorkedAt(val.data.date, req.context.user?.id || "");

    return hasWorked;
});

const schema = z.object({
    date: z.coerce.date(),
});