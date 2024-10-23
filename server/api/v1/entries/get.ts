import * as z from "zod";
import { getWorkEntries } from "~/server/utils/keeptrack";

export default defineEventHandler(async (req) => {
    const { success, data, error } = await getValidatedQuery(req, schema.safeParseAsync);

    if (!success) {
        throw createError({
            status: 400,
            message: error?.message,
        });
    }

    return getWorkEntries(req.context.user?.id || "", data.limit, data.filter);
});

const schema = z.object({
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    filter: z.enum(["w-date", "w-workingtime", "w-earning", "w-goal"]).optional().default("w-date"),
});