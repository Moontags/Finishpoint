import { parse, addMinutes } from "date-fns";

export const WORK_DURATION_MINUTES = 60;

export type VarausAika = { alku: string; loppu: string };

/**
 * Returns true if the slot is unavailable for the given bookings and drive time.
 * @param slot e.g. '10:00'
 * @param dayIso e.g. '2024-04-08'
 * @param bookings array of { alku, loppu } with times in 'HH:mm:ss' or 'HH:mm'
 * @param driveToDestinationMinutes number or null
 */
export function isSlotUnavailableForDate(
  slot: string,
  dayIso: string,
  bookings: VarausAika[],
  driveToDestinationMinutes: number | null
): boolean {
  const slotStart = parse(`${dayIso} ${slot}`, "yyyy-MM-dd HH:mm", new Date());
  if (driveToDestinationMinutes === null) {
    return bookings.some((b) => {
      const bStart = parse(`${dayIso} ${b.alku.slice(0, 5)}`, "yyyy-MM-dd HH:mm", new Date());
      const bEnd = parse(`${dayIso} ${b.loppu.slice(0, 5)}`, "yyyy-MM-dd HH:mm", new Date());
      const sEnd = addMinutes(slotStart, WORK_DURATION_MINUTES);
      return slotStart < bEnd && sEnd > bStart;
    });
  }
  const slotEnd = addMinutes(slotStart, WORK_DURATION_MINUTES + driveToDestinationMinutes);
  return bookings.some((b) => {
    const bookingStart = parse(`${dayIso} ${b.alku.slice(0, 5)}`, "yyyy-MM-dd HH:mm", new Date());
    const bookingEnd = parse(`${dayIso} ${b.loppu.slice(0, 5)}`, "yyyy-MM-dd HH:mm", new Date());
    return slotStart < bookingEnd && slotEnd > bookingStart;
  });
}
