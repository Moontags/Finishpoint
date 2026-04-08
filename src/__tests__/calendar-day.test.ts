import { isSlotUnavailableForDate, VarausAika } from "../components/calendar-utils";

type IsPaivaVarattuParams = {
  timeSlots: string[];
  bookings: VarausAika[];
  suljetutPaivat: string[];
  dayIso: string;
  driveToDestinationMinutes: number | null;
};

function isPaivaVarattu({ timeSlots, bookings, suljetutPaivat, dayIso, driveToDestinationMinutes }: IsPaivaVarattuParams): boolean {
  if (suljetutPaivat.includes(dayIso)) return true;
  if (bookings.length === 0) return false;
  return timeSlots.every((slot) => isSlotUnavailableForDate(slot, dayIso, bookings, driveToDestinationMinutes));
}

describe("isPaivaVarattu", () => {
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00"];
  const dayIso = "2024-04-08";

  it("returns true if all slots are blocked (fully booked)", () => {
    const bookings: VarausAika[] = [
      { alku: "08:00:00", loppu: "13:00:00" },
    ];
    expect(isPaivaVarattu({ timeSlots, bookings, suljetutPaivat: [], dayIso, driveToDestinationMinutes: 0 })).toBe(true);
  });

  it("returns false if at least one slot is available", () => {
    const bookings: VarausAika[] = [
      { alku: "08:00:00", loppu: "09:30:00" },
    ];
    expect(isPaivaVarattu({ timeSlots, bookings, suljetutPaivat: [], dayIso, driveToDestinationMinutes: 0 })).toBe(false);
  });

  it("returns true if date is in suljetutPaivat (closed date)", () => {
    expect(isPaivaVarattu({ timeSlots, bookings: [], suljetutPaivat: [dayIso], dayIso, driveToDestinationMinutes: 0 })).toBe(true);
  });
});
