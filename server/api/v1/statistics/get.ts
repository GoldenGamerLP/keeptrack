import { getStatistics } from "~/server/utils/keeptrack";

export default defineEventHandler(async (req) => {
  return getStatistics(req.context.user?.id || "");
});

const statistics = [
  //Jährliche Übersicht, Mantliche, Wöchentliceh und Tägliche
  {
    title: "Jährliche Übersicht",
    description: "Jährliche Übersicht",
    value: 100,
    hours: 100,
  },
  {
    title: "Monatliche Übersicht",
    description: "Monatliche Übersicht",
    value: 200,
    hours: 200,
  },
  {
    title: "Wöchentliche Übersicht",
    description: "Wöchentliche Übersicht",
    value: 300,
    hours: 300,
  },
  {
    title: "Tägliche Übersicht",
    description: "Tägliche Übersicht",
    value: 400,
    hours: 400,
  },
] as Statistic;

interface Statistic {
  [key: number]: {
    title: string;
    description: string;
    value: number;
    hours: number;
  };
}
