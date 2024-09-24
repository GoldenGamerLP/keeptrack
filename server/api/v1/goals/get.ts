import { getGoals } from "~/server/utils/keeptrack";

export default defineEventHandler(async (req) => {
    return getGoals(req.context.user?.id || "");
});

