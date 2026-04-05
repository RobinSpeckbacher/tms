import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export type RecurrenceType = "none" | "daily" | "weekly" | "biweekly" | "monthly";

/**
 * Pure function — computes all dates within [rangeStartDate, rangeEndDate]
 * on which a recurring vorlage should generate a sendung/truck.
 * Skipped dates are excluded from the result.
 */
export function calculateExpectedDates(
  recurrenceConfig: {
    recurrence_type: RecurrenceType;
    recurrence_days: number[] | null;
    active: boolean;
    skipped_dates: string[];
  },
  rangeStartDate: dayjs.Dayjs,
  rangeEndDate: dayjs.Dayjs,
): string[] {
  if (!recurrenceConfig.active || recurrenceConfig.recurrence_type === "none") {
    return [];
  }

  const skippedDatesSet = new Set(recurrenceConfig.skipped_dates ?? []);
  const generatedDates: string[] = [];
  let currentDate = rangeStartDate.clone();

  while (!currentDate.isAfter(rangeEndDate)) {
    let shouldGenerateOnThisDate = false;

    switch (recurrenceConfig.recurrence_type) {
      case "daily":
        shouldGenerateOnThisDate = true;
        break;

      case "weekly":
        shouldGenerateOnThisDate =
          (recurrenceConfig.recurrence_days?.length ?? 0) > 0 &&
          recurrenceConfig.recurrence_days!.includes(currentDate.isoWeekday());
        break;

      case "biweekly":
        shouldGenerateOnThisDate =
          (recurrenceConfig.recurrence_days?.length ?? 0) > 0 &&
          currentDate.isoWeek() % 2 === 1 &&
          recurrenceConfig.recurrence_days!.includes(currentDate.isoWeekday());
        break;

      case "monthly":
        shouldGenerateOnThisDate =
          (recurrenceConfig.recurrence_days?.length ?? 0) > 0 &&
          currentDate.date() === recurrenceConfig.recurrence_days![0];
        break;
    }

    if (shouldGenerateOnThisDate) {
      const dateString = currentDate.format("YYYY-MM-DD");
      if (!skippedDatesSet.has(dateString)) {
        generatedDates.push(dateString);
      }
    }

    currentDate = currentDate.add(1, "day");
  }

  return generatedDates;
}
