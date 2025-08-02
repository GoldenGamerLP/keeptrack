import database from "~/server/utils/mongodbUtils";
import {
  getLocalTimeZone,
  today,
  fromDate,
  ZonedDateTime,
  DateValue,
} from "@internationalized/date";
import { pipeline } from "zod";
const goalCollection = database.collection<Goal>("goals");
const workEntryCollection = database.collection<WorkEntry>("workEntries");

export interface HoursBetweenDate {
  _id: {
    year: number;
    month: number;
  };
  totalHoursWorked: number;
}

export interface Goal {
  _id?: string;
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

export interface WorkEntry {
  goalId: string;
  user: string;
  id: number;
  workingDate: Date;
  createdDate: Date;
  startWorkingTime: number;
  endWorkingTime: number;
  goal: number;
  salary: number;
}

export interface Statistic {
  [key: number]: {
    title: string;
    description: string;
    value: number;
    hours: number;
    icon: string;
  };
}

/**
 * Deletes a working entry from the work entry collection.
 *
 * @param id - The unique identifier of the working entry to delete.
 * @param user - The user associated with the working entry.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteWorkingEntry(id: number, user: string) {
  await workEntryCollection.deleteOne({ user, id });
}

/**
 * Edits an existing goal in the database.
 *
 * @param id - The unique identifier of the goal.
 * @param title - The new title of the goal.
 * @param description - The new description of the goal.
 * @param salary - The new salary associated with the goal.
 * @param maxsalary - The maximum salary limit for the goal.
 * @param paydayofmonth - The payday of the month for the goal.
 * @param user - The user associated with the goal.
 * @returns A promise that resolves to a boolean indicating whether the goal was successfully edited.
 */
export async function editGoal(
  id: number,
  title: string,
  description: string,
  salary: number,
  maxsalary: number,
  paydayofmonth: number,
  user: string
): Promise<boolean> {
  const res = await goalCollection.updateOne(
    { user, id },
    {
      $set: { title, description, given: { salary, maxsalary, paydayofmonth } },
    }
  );

  return res.modifiedCount > 0;
}

/**
 * Creates a new goal for a user and inserts it into the goal collection.
 *
 * @param title - The title of the goal.
 * @param description - A brief description of the goal.
 * @param salary - The salary associated with the goal.
 * @param maxsalary - The maximum salary that can be earned from the goal.
 * @param paydayofmonth - The day of the month when the salary is paid.
 * @param user - The identifier of the user for whom the goal is being created.
 * @returns A promise that resolves when the goal has been successfully inserted into the collection.
 */
export async function createGoal(
  title: string,
  description: string,
  salary: number,
  maxsalary: number,
  paydayofmonth: number,
  user: string
): Promise<boolean> {
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

  return (await goalCollection.insertOne(goal)).acknowledged;
}

/**
 * Checks if a user has worked on a specific date.
 *
 * @param date - The date to check for work entries.
 * @param user - The user identifier to check work entries for.
 * @returns A promise that resolves to a boolean indicating whether the user has worked on the given date.
 */
export const hasWorkedAt = async (workingDate: Date, user: string) => {
  const workEntries = await workEntryCollection.countDocuments({
    user,
    workingDate,
  });

  return workEntries > 0;
};

/**
 * Retrieves calendar entries for a specific user within the month of the given date.
 *
 * @param user - The identifier of the user whose calendar entries are to be retrieved.
 * @param date - The date within the month for which calendar entries are to be retrieved.
 * @returns A promise that resolves to an array of `WorkEntry` objects representing the user's calendar entries for the specified month.
 */
export async function getCalendarEntries(
  user: string,
  date: Date,
  wholeMonth: boolean = true
): Promise<WorkEntry[]> {
  let currentDate = fromDate(date, getLocalTimeZone());

  const userWorkEntries = await workEntryCollection
    .find({
      user,
      workingDate: {
        $gte: wholeMonth
          ? currentDate.set({ day: 0 }).toDate()
          : currentDate.toDate(),
        $lte: wholeMonth
          ? currentDate.set({ day: 0 }).add({ months: 1 }).toDate()
          : currentDate.add({ days: 1 }).toDate(),
      },
    })
    .toArray();

  return userWorkEntries;
}

/**
 * Retrieves work entries for a specified user, limited to a specified number of entries.
 *
 * @param {string} user - The user whose work entries are to be retrieved.
 * @param {number} [limit=20] - The maximum number of work entries to retrieve. Defaults to 20.
 * @returns {Promise<WorkEntry[]>} A promise that resolves to an array of work entries.
 */
export async function getWorkEntries(
  user: string,
  limit: number = 20,
  filter: "w-date" | "w-workingtime" | "w-earning" | "w-goal"
): Promise<WorkEntry[]> {
  let sort;

  switch (filter) {
    case "w-date":
      sort = "createdDate";
      break;
    case "w-workingtime":
      sort = "startWorkingTime";
      break;
    case "w-earning":
      sort = "salary";
      break;
    case "w-goal":
      sort = "goal";
      break;
  }

  const workEntries = workEntryCollection.aggregate([
    { $match: { user } },
    {
      $sort: {
        [sort]: -1,
      },
    },
    {
      $lookup: {
        from: "goals",
        localField: "goalId",
        foreignField: "_id",
        as: "goal",
        pipeline: [{ $project: { title: 1 } }],
      },
    },
    { $unwind: "$goal" },
    {
      $project: {
        goalId: 1,
        user: 1,
        id: 1,
        workingDate: 1,
        createdDate: 1,
        startWorkingTime: 1,
        endWorkingTime: 1,
        goal: "$goal.title",
        salary: 1,
      },
    },
    { $limit: limit },
  ]);

  return workEntries.toArray() as Promise<WorkEntry[]>;
}

/**
 * Adds a work entry to the database for a specific user and goal.
 *
 * @param workingDate - The date of the work entry.
 * @param startWorkingTime - The start time of the work entry in military time (e.g., 1800 for 6:00 PM).
 * @param endWorkingTime - The end time of the work entry in military time (e.g., 1900 for 7:00 PM).
 * @param selectedGoal - The ID of the goal associated with the work entry.
 * @param user - The username of the user adding the work entry.
 * @returns A promise that resolves when the work entry has been successfully added.
 * @throws Will throw an error if the specified goal is not found.
 */
export async function addWorkEntry(
  workingDate: Date,
  startWorkingTime: number,
  endWorkingTime: number,
  selectedGoal: number,
  user: string
): Promise<boolean> {
  const goal = await goalCollection.findOne({ user, id: selectedGoal });

  if (!goal) {
    throw createError({
      status: 400,
      message: "Goal not found",
    });
  }

  // 1900 - 1800 = 100 -> 1 hour -> / 100 = 1
  const salary =
    ((endWorkingTime - startWorkingTime) / 100) * goal.given.salary;

  const countedWorkEntries = await workEntryCollection.countDocuments({ user });

  const workEntry: WorkEntry = {
    goalId: goal._id,
    user,
    id: countedWorkEntries + 1,
    workingDate,
    createdDate: new Date(),
    startWorkingTime,
    endWorkingTime,
    goal: selectedGoal,
    salary,
  };

  const res = await workEntryCollection.insertOne(workEntry);
  return res.acknowledged;
}

/**
 * Retrieves the goals for a specific user and calculates the total hours worked and earnings for each goal.
 *
 * @param {string} user - The user identifier.
 * @returns {Promise<Goal[]>} A promise that resolves to an array of goals with updated hours worked and earnings.
 */
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
            goalId: goal._id,
            workingDate: {
              $gte: now.set({ day: payday }).toDate(getLocalTimeZone()),
              $lt: now.add({ months: 1 }).toDate(getLocalTimeZone()),
            },
          },
        },
        {
          $group: {
            _id: null,
            salary: { $sum: "$salary" },
            crrHours: {
              $sum: { $subtract: ["$endWorkingTime", "$startWorkingTime"] },
            },
          },
        },
        {
          $project: {
            salary: 1,
            crrHours: 1,
          },
        },
      ])
      .toArray();

    goal.done.hours = weekly[0]?.crrHours || 0;
    goal.done.earning = weekly[0]?.salary || 0;

    //Todo: Create a function to get the goals and do this in the function!!!!
    goal.given.hours = goal.given.maxsalary / goal.given.salary;
  }

  return foundGoals;
}

/**
 * Adds a goal to the goal collection for a specified user.
 *
 * @param user - The identifier of the user to whom the goal belongs.
 * @param goal - The goal object to be added to the collection.
 * @returns A promise that resolves when the goal has been successfully added.
 */
export async function addGoal(user: string, goal: Goal): Promise<void> {
  await goalCollection.insertOne({ ...goal, user });
}

//No co-poliot here!
//Format index: Month, value: { lastYear: number, thisYear: number }
export async function getEarnedStatistics(user: string, from: Date, to: Date) {
  const crrFrom = fromDate(from, getLocalTimeZone());
  const crrTo = fromDate(to, getLocalTimeZone());

  const thisYearData = workEntryCollection.aggregate(
    formatEarnedStatisticsAggregation(user, crrFrom, crrTo)
  );
  const lastYearData = workEntryCollection.aggregate(
    formatEarnedStatisticsAggregation(
      user,
      crrFrom.subtract({ years: 1 }),
      crrTo.subtract({ years: 1 })
    )
  );

  const thisYear = await thisYearData.toArray();
  const lastYear = await lastYearData.toArray();

  const earnedStatistics = [] as Earned[];

  for (let i = 0; i < thisYear.length; i++) {
    earnedStatistics.push({
      date: new Date(thisYear[i]._id.year, thisYear[i]._id.month - 1),
      current: thisYear[i].salary,
      last: lastYear[i]?.salary || 0,
    });
  }

  return earnedStatistics;
}

interface Earned {
  date: Date;
  current: number;
  last: number;
}

function formatEarnedStatisticsAggregation(
  user: string,
  from: ZonedDateTime,
  to: ZonedDateTime
) {
  return [
    {
      $match:
        /**
         * query: The query in MQL.
         */
        {
          user: user,
          workingDate: { $gte: from.toDate(), $lt: to.toDate() },
        },
    },
    {
      $group:
        /**
         * _id: The id of the group.
         * fieldN: The first field name.
         */
        {
          _id: {
            month: {
              $month: "$workingDate",
            },
            year: {
              $year: "$workingDate",
            },
          },
          salary: {
            $sum: "$salary",
          },
        },
    },
    {
      $sort:
        /**
         * Provide any number of field/order pairs.
         */
        {
          "_id.month": 1,
          "_id.year": 1,
        },
    },
  ];
}

export async function getHoursBetweenDates(
  userId: string,
  from: DateValue,
  to: DateValue
): Promise<HoursBetweenDate[]> {
  const hours = await workEntryCollection
    .aggregate([
      {
        $project: {
          user: 1,
          hoursWorked: {
            $subtract: ["$endWorkingTime", "$startWorkingTime"],
          },
          workingDate: 1,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$workingDate" },
            month: { $month: "$workingDate" },
          },
          totalHoursWorked: {
            $sum: "$hoursWorked",
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ])
    .toArray();

  return hours as HoursBetweenDate[];
}

/**
 * Retrieves statistical data for a given user, aggregated over different time periods:
 * daily, weekly, monthly, and yearly.
 *
 * @param {string} user - The user for whom the statistics are to be calculated.
 * @returns {Promise<Statistic>} A promise that resolves to an object containing the calculated statistics.
 *
 * The returned `Statistic` object contains the following properties for each time period:
 * - `title`: The title of the overview (e.g., "Jährliche Übersicht").
 * - `description`: A description of the overview.
 * - `value`: The total salary for the time period.
 * - `hours`: The total working hours for the time period.
 *
 * The function performs the following steps:
 * 1. Calculates the current date and time in the local time zone.
 * 2. Aggregates work entries for the user over the past year, month, week, and day.
 * 3. Groups the aggregated data by summing up the salary and working times.
 * 4. Projects the total working hours and salary for each time period.
 * 5. Constructs the `Statistic` object with the aggregated data.
 */
export async function getStatistics(user: string): Promise<Statistic> {
  //Calculate the statistics -> daily, weekly, monthly, yearly with aggregation
  const statistics = {} as Statistic;
  const now = today(getLocalTimeZone());

  const yearly = await workEntryCollection
    .aggregate([
      {
        $match: {
          user,
          workingDate: {
            $gte: now.set({ month: 1, day: 1 }).toDate(getLocalTimeZone()),
            $lt: now
              .set({ month: 1, day: 1 })
              .add({ years: 1 })
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
          hours: { $subtract: ["$endWorkingTimeSum", "$startWorkingTimeSum"] },
          salary: 1,
        },
      },
    ])
    .toArray();

  statistics[0] = {
    title: "Jährliche Übersicht",
    description: "Alles aus diesem Jahr",
    value: yearly[0]?.salary || 0,
    hours: yearly[0]?.hours || 0,
    icon: "mdi:calendar-star-four-points",
  };

  const monthly = await workEntryCollection
    .aggregate([
      {
        $match: {
          user,
          workingDate: {
            $gte: now.set({ day: 1 }).toDate(getLocalTimeZone()),
            $lt: now
              .add({ months: 1 })
              .set({ day: 1 })
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
          hours: { $subtract: ["$endWorkingTimeSum", "$startWorkingTimeSum"] },
          salary: 1,
        },
      },
    ])
    .toArray();

  statistics[1] = {
    title: "Monatliche Übersicht",
    description: "Alles aus diesem Monat",
    value: monthly[0]?.salary || 0,
    hours: monthly[0]?.hours || 0,
    icon: "mdi:calendar-month",
  };

  const weekly = await workEntryCollection
    .aggregate([
      {
        $match: {
          user,
          workingDate: {
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
    description: "Alles aus dieser Woche",
    value: weekly[0]?.salary || 0,
    hours: weekly[0]?.hours || 0,
    icon: "mdi:calendar-range",
  };

  const daily = await workEntryCollection
    .aggregate([
      {
        $match: {
          user,
          workingDate: {
            $gte: now.subtract({ days: 1 }).toDate(getLocalTimeZone()),
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
    description: "Von diesem Tag",
    value: daily[0]?.salary || 0,
    hours: daily[0]?.hours || 0,
    icon: "mdi:calendar",
  };

  return statistics;
}
