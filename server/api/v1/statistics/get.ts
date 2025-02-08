import { getStatistics } from "~/server/utils/keeptrack";

export default defineEventHandler(async (req) => {
  return getStatistics(req.context.user?.id || "");
});

interface Statistic {
  [key: number]: {
    title: string;
    description: string;
    value: number;
    hours: number;
    icon: string;
  };
}
