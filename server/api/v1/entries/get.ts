import { getWorkEntries } from "~/server/utils/keeptrack";

export default defineEventHandler(async (req) => {
    return getWorkEntries(req.context.user?.id || "");
});