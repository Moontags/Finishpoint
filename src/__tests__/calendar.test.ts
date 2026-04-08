import { isSlotUnavailableForDate, WORK_DURATION_MINUTES, VarausAika } from "../components/calendar-utils";

describe("isSlotUnavailableForDate", () => {
  const dayIso = "2024-04-08";

  it("slot overlaps booking (10:00-12:00, slot 10:00, drive 0)", () => {
    const bookings: VarausAika[] = [
      { alku: "10:00:00", loppu: "12:00:00" },
    ];
    expect(isSlotUnavailableForDate("10:00", dayIso, bookings, 0)).toBe(true);
  });

  it("slot does not overlap (10:00-12:00, slot 13:00, drive 0)", () => {
    const bookings: VarausAika[] = [
      { alku: "10:00:00", loppu: "12:00:00" },
    ];
    expect(isSlotUnavailableForDate("13:00", dayIso, bookings, 0)).toBe(false);
  });

  it("handles HH:mm:ss format and overlap logic", () => {
    const bookings: VarausAika[] = [
      { alku: "07:26:00", loppu: "09:34:00" },
    ];
    // slot 07:00-08:00 overlaps
    expect(isSlotUnavailableForDate("07:00", dayIso, bookings, 0)).toBe(true);
    // slot 09:30-10:30 overlaps (slotStart < bookingEnd && slotEnd > bookingStart)
    expect(isSlotUnavailableForDate("09:30", dayIso, bookings, 0)).toBe(true);
    // slot 10:00-11:00 does not overlap
    expect(isSlotUnavailableForDate("10:00", dayIso, bookings, 0)).toBe(false);
  });

  it("uses driveToDestinationMinutes when provided", () => {
    const bookings: VarausAika[] = [
      { alku: "10:00:00", loppu: "12:00:00" },
    ];
    // slot 09:00, 60min work + 60min drive = 09:00-11:00 overlaps 10:00-12:00
    expect(isSlotUnavailableForDate("09:00", dayIso, bookings, 60)).toBe(true);
    // slot 07:00, 60min work + 60min drive = 07:00-09:00 does not overlap
    expect(isSlotUnavailableForDate("07:00", dayIso, bookings, 60)).toBe(false);
  });
});
