import { isSlotUnavailableForDate, isSlotBeforeMinLeadTime, WORK_DURATION_MINUTES, VarausAika } from "../components/calendar-utils";

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

describe("isSlotBeforeMinLeadTime", () => {
  const dayIso = "2026-05-13";

  it("blocks slots in the past", () => {
    const now = new Date("2026-05-13T14:00:00");
    expect(isSlotBeforeMinLeadTime("10:00", dayIso, now)).toBe(true);
    expect(isSlotBeforeMinLeadTime("13:59", dayIso, now)).toBe(true);
  });

  it("blocks slots within 2 hour buffer from now", () => {
    const now = new Date("2026-05-13T14:00:00");
    // 2h buffer => any slot before 16:00 is blocked
    expect(isSlotBeforeMinLeadTime("14:00", dayIso, now)).toBe(true);
    expect(isSlotBeforeMinLeadTime("15:30", dayIso, now)).toBe(true);
    expect(isSlotBeforeMinLeadTime("15:59", dayIso, now)).toBe(true);
  });

  it("allows slots at or after the 2 hour buffer", () => {
    const now = new Date("2026-05-13T14:00:00");
    expect(isSlotBeforeMinLeadTime("16:00", dayIso, now)).toBe(false);
    expect(isSlotBeforeMinLeadTime("17:00", dayIso, now)).toBe(false);
  });

  it("allows all slots on future days", () => {
    const now = new Date("2026-05-13T14:00:00");
    expect(isSlotBeforeMinLeadTime("07:00", "2026-05-14", now)).toBe(false);
    expect(isSlotBeforeMinLeadTime("07:00", "2026-05-20", now)).toBe(false);
  });

  it("blocks all slots on past days", () => {
    const now = new Date("2026-05-13T14:00:00");
    expect(isSlotBeforeMinLeadTime("18:00", "2026-05-12", now)).toBe(true);
  });
});
