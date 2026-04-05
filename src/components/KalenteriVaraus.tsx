"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMinutes,
  format,
  isSameDay,
  isWeekend,
  parse,
  startOfDay,
} from "date-fns";
import { fi } from "date-fns/locale";
import type { BookingSelectionData } from "@/lib/types";

const RIIHIMAKI = "Riihimaki, Finland";
const WORK_DURATION_MINUTES = 60;
const MAX_FORWARD_WEEKS = 8;

type DistanceResponse = {
  ok: boolean;
  durationMinutes?: number | null;
};

type ReservedBooking = {
  varaus_pvm: string;
  aloitusaika: string;
  lopetusaika: string;
};

function parseMinutes(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.max(1, Math.round(value));
}

function timeLabel(date: Date) {
  return format(date, "HH:mm", { locale: fi });
}

function durationLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}

function generateTimeSlots() {
  const result: string[] = [];
  for (let hour = 7; hour <= 18; hour += 1) {
    result.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour < 18) {
      result.push(`${String(hour).padStart(2, "0")}:30`);
    }
  }
  return result;
}

const timeSlots = generateTimeSlots();

function getInitialWeekStart() {
  const today = startOfDay(new Date());

  if (isWeekend(today)) {
    const offset = today.getDay() === 6 ? 2 : 1;
    return addDays(today, offset);
  }

  return today;
}

export function KalenteriVaraus({
  lahto,
  kohde,
  onDateTimeSelect,
}: {
  lahto: string;
  kohde: string;
  onDateTimeSelect: (selection: BookingSelectionData | null) => void;
}) {
  const [weekStart, setWeekStart] = useState(getInitialWeekStart);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);
  const [reservedBookings, setReservedBookings] = useState<ReservedBooking[]>([]);
  const [isLoadingReservedDays, setIsLoadingReservedDays] = useState(false);
  const [driveToDestinationMinutes, setDriveToDestinationMinutes] = useState<number | null>(null);
  const [driveFromRiihimakiMinutes, setDriveFromRiihimakiMinutes] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const daysCount = isMobile ? 3 : 7;
  const navStep = isMobile ? 3 : 7;

  const weekDays = useMemo(
    () => Array.from({ length: daysCount }, (_, index) => addDays(weekStart, index)),
    [weekStart, daysCount],
  );

  const initialWeekStart = useMemo(getInitialWeekStart, []);
  const canGoBack = weekStart > initialWeekStart;
  const maxWeekStart = useMemo(() => addDays(initialWeekStart, (MAX_FORWARD_WEEKS - 1) * 7), [initialWeekStart]);
  const canGoForward = weekStart < maxWeekStart;

  useEffect(() => {
    const earliest = format(weekStart, "yyyy-MM-dd");
    const latest = format(addDays(weekStart, 6), "yyyy-MM-dd");
    const controller = new AbortController();

    const run = async () => {
      setIsLoadingReservedDays(true);
      try {
        const response = await fetch(`/api/varatut-paivat?alku=${earliest}&loppu=${latest}`, {
          signal: controller.signal,
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as {
          ok: boolean;
          data?: ReservedBooking[];
        };

        if (!response.ok || !payload.ok) {
          setReservedBookings([]);
          return;
        }

        setReservedBookings(payload.data ?? []);
      } catch {
        setReservedBookings([]);
      } finally {
        setIsLoadingReservedDays(false);
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [weekStart]);

  useEffect(() => {
    const origin = lahto.trim();
    const destination = kohde.trim();

    if (!origin || !destination) {
      setDriveToDestinationMinutes(null);
      setDriveFromRiihimakiMinutes(null);
      onDateTimeSelect(null);
      return;
    }

    const controller = new AbortController();

    const fetchDuration = async (from: string, to: string) => {
      const response = await fetch("/api/distance", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: from, destination: to }),
      });

      const payload = (await response.json()) as DistanceResponse;
      if (!response.ok || !payload.ok) {
        return null;
      }

      return parseMinutes(payload.durationMinutes ?? null);
    };

    const run = async () => {
      const [fromCustomerToDestination, fromRiihimakiToDestination] = await Promise.all([
        fetchDuration(origin, destination),
        fetchDuration(RIIHIMAKI, destination),
      ]);

      if (controller.signal.aborted) {
        return;
      }

      setDriveToDestinationMinutes(fromCustomerToDestination);
      setDriveFromRiihimakiMinutes(fromRiihimakiToDestination);
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [kohde, lahto, onDateTimeSelect]);

  useEffect(() => {
    if (!selectedDay || !selectedTime || driveToDestinationMinutes === null || driveFromRiihimakiMinutes === null) {
      onDateTimeSelect(null);
      return;
    }

    const dayIso = format(selectedDay, "yyyy-MM-dd");
    const arrivalAtDestination = parse(`${dayIso} ${selectedTime}`, "yyyy-MM-dd HH:mm", new Date());
    const departureFromRiihimaki = addMinutes(
      arrivalAtDestination,
      -(driveFromRiihimakiMinutes + WORK_DURATION_MINUTES),
    );
    const releaseAt = addMinutes(arrivalAtDestination, WORK_DURATION_MINUTES + driveToDestinationMinutes);

    onDateTimeSelect({
      reservationDate: dayIso,
      arrivalTime: timeLabel(arrivalAtDestination),
      riihimakiDepartureTime: timeLabel(departureFromRiihimaki),
      releaseTime: timeLabel(releaseAt),
      driveToDestinationMinutes,
      driveFromRiihimakiMinutes,
      workDurationMinutes: WORK_DURATION_MINUTES,
      calendarBlockMinutes: driveFromRiihimakiMinutes + WORK_DURATION_MINUTES + driveToDestinationMinutes,
    });
  }, [driveFromRiihimakiMinutes, driveToDestinationMinutes, onDateTimeSelect, selectedDay, selectedTime]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getReservedBookingsForDay = (day: Date) => {
    const dayIso = format(day, "yyyy-MM-dd");
    return reservedBookings.filter((booking) => booking.varaus_pvm === dayIso);
  };

  const hasReservations = (day: Date) => getReservedBookingsForDay(day).length > 0;
  const isPast = (day: Date) => startOfDay(day) < startOfDay(new Date());

  const isTimeSlotUnavailable = (slot: string) => {
    if (!selectedDay) {
      return false;
    }

    const dayIso = format(selectedDay, "yyyy-MM-dd");
    const slotStart = parse(`${dayIso} ${slot}`, "yyyy-MM-dd HH:mm", new Date());

    if (driveToDestinationMinutes === null) {
      return getReservedBookingsForDay(selectedDay).some((booking) => booking.aloitusaika === slot);
    }

    const slotEnd = addMinutes(slotStart, WORK_DURATION_MINUTES + driveToDestinationMinutes);

    return getReservedBookingsForDay(selectedDay).some((booking) => {
      const bookingStart = parse(`${dayIso} ${booking.aloitusaika}`, "yyyy-MM-dd HH:mm", new Date());
      const bookingEnd = parse(`${dayIso} ${booking.lopetusaika}`, "yyyy-MM-dd HH:mm", new Date());
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  };

  useEffect(() => {
    if (!selectedDay || !selectedTime) {
      return;
    }

    const dayIso = format(selectedDay, "yyyy-MM-dd");
    const bookingsForDay = reservedBookings.filter((booking) => booking.varaus_pvm === dayIso);
    const slotStart = parse(`${dayIso} ${selectedTime}`, "yyyy-MM-dd HH:mm", new Date());

    const selectedSlotUnavailable =
      driveToDestinationMinutes === null
        ? bookingsForDay.some((booking) => booking.aloitusaika === selectedTime)
        : bookingsForDay.some((booking) => {
            const slotEnd = addMinutes(slotStart, WORK_DURATION_MINUTES + driveToDestinationMinutes);
            const bookingStart = parse(`${dayIso} ${booking.aloitusaika}`, "yyyy-MM-dd HH:mm", new Date());
            const bookingEnd = parse(`${dayIso} ${booking.lopetusaika}`, "yyyy-MM-dd HH:mm", new Date());
            return slotStart < bookingEnd && slotEnd > bookingStart;
          });

    if (selectedSlotUnavailable) {
      setSelectedTime("");
    }
  }, [driveToDestinationMinutes, reservedBookings, selectedDay, selectedTime]);

  const handleDayGridTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };

  const handleDayGridTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || touchStartXRef.current === null || touchStartYRef.current === null) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (Math.abs(deltaX) < 35 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0 && canGoForward) {
      setWeekStart((current) => addDays(current, navStep));
      return;
    }

    if (deltaX > 0 && canGoBack) {
      setWeekStart((current) => addDays(current, -navStep));
    }
  };

  return (
    <div className="rounded-[10px] border-0 bg-white/10 p-0 shadow-none sm:col-span-2 sm:border sm:border-slate-200 sm:p-5 sm:shadow-[0_1px_4px_rgba(0,0,0,0.08)] lg:p-3.5">
      <div className="mb-3 flex items-center justify-between gap-2 lg:mb-1.5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7a8d]">Varaa ajankohta</p>
        {isLoadingReservedDays ? (
          <span className="hidden text-[11px] font-medium text-[#6b7a8d] sm:inline">Paivitetaan saatavuutta...</span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => canGoBack && setWeekStart((current) => addDays(current, -navStep))}
          disabled={!canGoBack}
          className="hidden shrink-0 rounded-lg border border-slate-300 bg-white/75 px-3 py-2 text-[#1a2e4a] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex focus:ring-[3px] focus:ring-blue-200"
          aria-label="Edellinen jakso"
        >
          ←
        </button>

        <div
          className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:grid-cols-7 sm:gap-2 lg:gap-1.5"
          onTouchStart={handleDayGridTouchStart}
          onTouchEnd={handleDayGridTouchEnd}
        >
          {weekDays.map((day) => {
            const selected = selectedDay ? isSameDay(selectedDay, day) : false;
            const reserved = hasReservations(day);
            const past = isPast(day);
            const disabled = past;
            const today = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSelectedDay(day);
                  setSelectedTime("");
                  setIsTimeMenuOpen(false);
                }}
                className={`rounded-lg border px-1 py-2 text-center transition lg:py-1 ${
                  selected
                    ? "border-[#1a2e4a] bg-[#1a2e4a] text-white"
                    : "border-slate-300 bg-white/75 text-[#1a2e4a] hover:border-[#1a2e4a] hover:bg-white"
                } ${disabled ? "cursor-not-allowed opacity-40 hover:border-slate-300 hover:bg-white/75" : ""}`}
              >
                <span className={`block text-[11px] uppercase tracking-[0.06em] lg:text-[10px] ${selected ? "text-white/80" : "text-[#6b7a8d]"}`}>
                  {format(day, "EE", { locale: fi })}
                </span>
                <span className="mt-0.5 block text-[18px] font-semibold lg:text-[16px]">{format(day, "d")}</span>
                <span className={`block text-[10px] lg:text-[9px] ${selected ? "text-white/80" : "text-[#6b7a8d]"}`}>
                  {format(day, "LLL", { locale: fi })}
                </span>
                <span className="mt-1 block h-3 text-[10px]">
                  {reserved ? (
                    <span className={`inline-block rounded-full px-1.5 py-0.5 ${selected ? "bg-white/15 text-white" : "bg-[#f0f2f5] text-[#1a2e4a]"}`}>
                      Varattu
                    </span>
                  ) : today ? (
                    <span className={`mx-auto block h-1.5 w-1.5 rounded-full ${selected ? "bg-white" : "bg-[#1a2e4a]"}`} />
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => canGoForward && setWeekStart((current) => addDays(current, navStep))}
          disabled={!canGoForward}
          className="hidden shrink-0 rounded-lg border border-slate-300 bg-white/75 px-3 py-2 text-[#1a2e4a] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex focus:ring-[3px] focus:ring-blue-200"
          aria-label="Seuraava jakso"
        >
          →
        </button>
      </div>

      {selectedDay && !isPast(selectedDay) ? (
        <div className="mt-4 animate-[fadein_200ms_ease-in-out] lg:mt-2.5">
          <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7a8d]">
            Valitse kuljetusaika
          </label>

          {getReservedBookingsForDay(selectedDay).length > 0 ? (
            <div className="mb-3 rounded-[10px] border border-slate-200 bg-[#f8fafc] px-4 py-3 text-[13px] text-[#1a2e4a]">
              <p className="font-semibold">Auto on jo varattu:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {getReservedBookingsForDay(selectedDay).map((booking) => (
                  <span
                    key={`${booking.varaus_pvm}-${booking.aloitusaika}-${booking.lopetusaika}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1"
                  >
                    {booking.aloitusaika} - {booking.lopetusaika}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[10px] border border-slate-300 bg-white/10 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setIsTimeMenuOpen((current) => !current)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-[17px] text-[#1a2e4a] transition hover:bg-white/20 lg:py-2.5"
              aria-expanded={isTimeMenuOpen}
              aria-label="Valitse saapumisaika"
            >
              <span>{selectedTime || "-- Valitse aika --"}</span>
              <span className={`text-[14px] text-[#6b7a8d] transition ${isTimeMenuOpen ? "rotate-180" : ""}`}>⌄</span>
            </button>

            {isTimeMenuOpen ? (
              <div className="max-h-52 overflow-y-auto border-t border-slate-200 lg:max-h-44">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    disabled={isTimeSlotUnavailable(slot)}
                    onClick={() => {
                      if (isTimeSlotUnavailable(slot)) {
                        return;
                      }

                      setSelectedTime(slot);
                      setIsTimeMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-[17px] transition lg:py-2.5 ${
                      isTimeSlotUnavailable(slot)
                        ? "cursor-not-allowed bg-white/5 text-slate-400 line-through"
                        : selectedTime === slot
                        ? "bg-[#1a2e4a] text-white"
                        : "bg-white/10 text-[#1a2e4a] hover:bg-white/20"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>{slot}</span>
                      {isTimeSlotUnavailable(slot) ? (
                        <span className="text-[13px] font-medium no-underline">Varattu</span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {selectedTime && driveToDestinationMinutes !== null && driveFromRiihimakiMinutes !== null ? (
            <div className="mt-3 rounded-[10px] bg-[#f0f2f5] px-4 py-3 text-[13px] leading-7 text-[#1a2e4a]">
              <p>📍 Saapuminen kohteeseen: ~{selectedTime}</p>
              <p>
                ⏱ Arvioitu kuljetuksen kokonaiskesto: {durationLabel(WORK_DURATION_MINUTES + driveToDestinationMinutes)}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[12px] text-[#6b7a8d]">
              Täytä mistä ja minne jotta kuljetushinta voidaan laskea
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
