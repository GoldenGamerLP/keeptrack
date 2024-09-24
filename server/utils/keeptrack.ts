import database from "~/server/utils/mongodbUtils";
import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  today,
  fromDate,
} from "@internationalized/date";
const goalCollection = database.collection<Goal>("goals");
const workEntryCollection = database.collection<WorkEntry>("workEntries");

interface Goal {
  title: string;
  description: string;
  user: string;
  id: number;
  done: {
    hours: number;
    earning: number;
  };
  given: {
    hours: number;
    salary: number;
    maxsalary: number;
    paydayofmonth: number;
  };
}

interface WorkEntry {
  user: string;
  id: number;
  date: Date;
  startWorkingTime: number;
  endWorkingTime: number;
  goal: number;
  salary: number;
}

interface Statistic {
  [key: number]: {
    title: string;
    description: string;
    value: number;
    hours: number;
  };
}

export async function deleteWorkingEntry(id: number, user: string) {
  await workEntryCollection.deleteOne({ user, id });
}

export async function editGoal(
  id: number,
  title: string,
  description: string,
  salary: number,
  maxsalary: number,
  paydayofmonth: number,
  user: string
) {
  const res = await goalCollection.updateOne(
    { user, id },
    {
      $set: { title, description, given: { salary, maxsalary, paydayofmonth } },
    }
  );

  console.log(res);
}

export async function createGoal(
  title: string,
  description: string,
  salary: number,
  maxsalary: number,
  paydayofmonth: number,
  user: string
) {
  const countedGoals = await goalCollection.countDocuments({ user });

  const goal: Goal = {
    title,
    description,
    user,
    id: countedGoals + 1,
    done: {
      hours: 0,
      earning: 0,
    },
    given: {
      hours: 0,
      salary,
      maxsalary,
      paydayofmonth,
    },
  };

  await goalCollection.insertOne(goal);
}

export async function getCalendarEntries(
  user: string,
  date: Date
): Promise<WorkEntry[]> {
  const currentDate = fromDate(date, getLocalTimeZone()).set({ day: 1 });

  const userWorkEntries = await workEntryCollection
    .find({
      user,
      date: {
        $gte: currentDate.toDate(),
        $lt: currentDate.add({ months: 1 }).toDate(),
      },
    })
    .toArray();

  return userWorkEntries;
}

export async function getWorkEntries(user: string): Promise<WorkEntry[]> {
  return await workEntryCollection
    .find({ user }, { limit: 20 })
    .sort({ date: -1 })
    .toArray();
}

export async function addWorkEntry(
  date: Date,
  startWorkingTime: number,
  endWorkingTime: number,
  selectedGoal: number,
  user: string
): Promise<void> {
  const goal = await goalCollection.findOne({ user, id: selectedGoal });

  if (!goal) {
    throw new Error("Goal not found");
  }

  // 1900 - 1800 = 100 -> 1 hour -> / 100 = 1
  const salary =
    ((endWorkingTime - startWorkingTime) / 100) * goal.given.salary;

  const countedWorkEntries = await workEntryCollection.countDocuments({ user });

  const workEntry: WorkEntry = {
    user,
    id: countedWorkEntries + 1,
    date,
    startWorkingTime,
    endWorkingTime,
    goal: selectedGoal,
    salary,
  };

  await workEntryCollection.insertOne(workEntry);
}

export async function getGoals(user: string): Promise<Goal[]> {
  const foundGoals = await goalCollection.find({ user }).toArray();
  const now = today(getLocalTimeZone());

  for (let goal of foundGoals) {
    const payday = goal.given.paydayofmonth;
    const weekly = await workEntryCollection
      .aggregate([
        {
          $match: {
            user,
            goal: goal.id,
            date: {
              $gte: now.set({ day: payday }).toDate(getLocalTimeZone()),
              $lt: now
                .add({ months: 1 })
                .set({ day: payday })
                .toDate(getLocalTimeZone()),
            },
          },
        },
        {
          $group: {
            _id: null,
            salary: { $sum: "$salary" },
            startWorkingTimeSum: { $sum: "$startWorkingTime" },
            endWorkingTimeSum: { $sum: "$endWorkingTime" },
          },
        },
        {
          $project: {
            hours: {
              $subtract: ["$endWorkingTimeSum", "$startWorkingTimeSum"],
            },
            salary: 1,
          },
        },
      ])
      .toArray();

    goal.done.hours = weekly[0]?.hours || 0;
    goal.done.earning = weekly[0]?.salary || 0;
  }

  return foundGoals;
}

export async function addGoal(user: string, goal: Goal): Promise<void> {
  await goalCollection.insertOne({ ...goal, user });
}

export async function getStatistics(user: string): Promise<Statistic> {
  //Calculate the statistics -> daily, weekly, monthly, yearly with aggregation
  const statistics = {} as Statistic;
  const now = today(getLocalTimeZone());

  const yearly = await workEntryCollection
    .aggregate([
      {
        $match: {
          user,
          date: {
            $gte: now.set({ month: 1, day: 1 }).toDate(getLocalTimeZone()),
            $lt: now.set({ month: 1, day: 1 }).add({ years: 1 }).toDate(getLocalTimeZone()),
          },
        },
      },
      {
        $group: {
          _id: null,
          salary: { $sum: "$salary" },
          startWorkingTimeSum: { $sum: "$startWorkingTime" },
          endWorkingTimeSum: { $sum: "$endWorkingTime" },
        },
      },
      {
        $project: {
          hours: { $subtract: ["$endWorkingTimeSum", "$startWorkingTimeSum"] },
          salary: 1,
        },
      },
    ])
    .toArray();

  statistics[0] = {
    title: "Jährliche Übersicht",
    description: "Jährliche Übersicht",
    value: yearly[0]?.salary || 0,
    hours: yearly[0]?.hours || 0,
  };

  const monthly = await workEntryCollection
    .aggregate([
      {
        $match: {
          user,
          date: {
            $gte: now.set({ day: 1 }).toDate(getLocalTimeZone()),
            $lt: now.add({ months: 1 }).set({ day: 1 }).toDate(getLocalTimeZone()),
          },
        },
      },
      {
        $group: {
          _id: null,
          salary: { $sum: "$salary" },
          startWorkingTimeSum: { $sum: "$startWorkingTime" },
          endWorkingTimeSum: { $sum: "$endWorkingTime" },
        },
      },
      {
        $project: {
          hours: { $subtract: ["$endWorkingTimeSum", "$startWorkingTimeSum"] },
          salary: 1,
        },
      },
    ])
    .toArray();

  statistics[1] = {
    title: "Monatliche Übersicht",
    description: "Monatliche Übersicht",
    value: monthly[0]?.salary || 0,
    hours: monthly[0]?.hours || 0,
  };

  const weekly = await workEntryCollection
    .aggregate([
      {
        $match: {
          user,
          date: {
            $gte: now.set({ day: 1 }).toDate(getLocalTimeZone()),
            $lt: now.add({ weeks: 1 }).toDate(getLocalTimeZone()),
          },
        },
      },
      {
        $group: {
          _id: null,
          salary: { $sum: "$salary" },
          startWorkingTimeSum: { $sum: "$startWorkingTime" },
          endWorkingTimeSum: { $sum: "$endWorkingTime" },
        },
      },
      {
        $project: {
          hours: { $subtract: ["$endWorkingTimeSum", "$startWorkingTimeSum"] },
          salary: 1,
        },
      },
    ])
    .toArray();

  statistics[2] = {
    title: "Wöchentliche Übersicht",
    description: "Wöchentliche Übersicht",
    value: weekly[0]?.salary || 0,
    hours: weekly[0]?.hours || 0,
  };

  const daily = await workEntryCollection
    .aggregate([
      {
        $match: {
          user,
          date: {
            $gte:  now.toDate(getLocalTimeZone()),
            $lt: now.add({ days: 1 }).toDate(getLocalTimeZone()),
          },
        },
      },
      {
        $group: {
          _id: null,
          salary: { $sum: "$salary" },
          startWorkingTimeSum: { $sum: "$startWorkingTime" },
          endWorkingTimeSum: { $sum: "$endWorkingTime" },
        },
      },
      {
        $project: {
          hours: { $subtract: ["$endWorkingTimeSum", "$startWorkingTimeSum"] },
          salary: 1,
        },
      },
    ])
    .toArray();

  statistics[3] = {
    title: "Tägliche Übersicht",
    description: "Tägliche Übersicht",
    value: daily[0]?.salary || 0,
    hours: daily[0]?.hours || 0,
  };

  return statistics;
}
