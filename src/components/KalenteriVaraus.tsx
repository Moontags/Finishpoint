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
import { isSlotBeforeMinLeadTime } from "@/components/calendar-utils";

const RIIHIMAKI = "Riihimaki, Finland";
const WORK_DURATION_MINUTES = 60;
const MAX_FORWARD_WEEKS = 8;

type DistanceResponse = {
  ok: boolean;
  durationMinutes?: number | null;
};

type VarausAika = { alku: string; loppu: string };

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
  const timeMenuRef = useRef<HTMLDivElement | null>(null);
    // Sulje aikavalikko kun klikataan/kosketetaan ulkopuolelle
    useEffect(() => {
      if (!isTimeMenuOpen) return;
      function handlePointerDown(e: MouseEvent | TouchEvent) {
        if (!timeMenuRef.current) return;
        if (e.target instanceof Node && !timeMenuRef.current.contains(e.target)) {
          setIsTimeMenuOpen(false);
        }
      }
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("touchstart", handlePointerDown);
      };
    }, [isTimeMenuOpen]);
  const [suljetutPaivat, setSuljetutPaivat] = useState<string[]>([]);
  const [varausAjat, setVarausAjat] = useState<Record<string, VarausAika[]>>({});
  const [isLoadingReservedDays, setIsLoadingReservedDays] = useState(false);
  const [driveToDestinationMinutes, setDriveToDestinationMinutes] = useState<number | null>(null);
  const [driveFromRiihimakiMinutes, setDriveFromRiihimakiMinutes] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const daysCount = isMobile ? 2 : 7;
  const navStep = isMobile ? 2 : 7;

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
          suljetutPaivat?: string[];
          varausAjat?: Record<string, VarausAika[]>;
        };

        if (!response.ok || !payload.ok) {
          setSuljetutPaivat([]);
          setVarausAjat({});
          return;
        }

        setSuljetutPaivat(payload.suljetutPaivat ?? []);
        setVarausAjat(payload.varausAjat ?? {});
        console.log("varausAjat:", payload.varausAjat);
        console.log("suljetutPaivat:", payload.suljetutPaivat);
      } catch {
        setSuljetutPaivat([]);
        setVarausAjat({});
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
      try {
        const [fromCustomerToDestination, fromRiihimakiToDestination] = await Promise.all([
          fetchDuration(origin, destination),
          fetchDuration(RIIHIMAKI, destination),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        setDriveToDestinationMinutes(fromCustomerToDestination);
        setDriveFromRiihimakiMinutes(fromRiihimakiToDestination);
      } catch {
        // abort tai verkkovirhe — ei tarvita toimenpiteitä
      }
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
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isPast = (day: Date) => startOfDay(day) < startOfDay(new Date());

  const isSlotUnavailableForDate = (slot: string, dayIso: string, bookings: VarausAika[]): boolean => {
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
  };

  const isPaivaVarattu = (day: Date): boolean => {
    const dayIso = format(day, "yyyy-MM-dd");
    if (suljetutPaivat.includes(dayIso)) return true;
    const bookings = varausAjat[dayIso] ?? [];
    const isToday = isSameDay(day, new Date());
    if (bookings.length === 0 && !isToday) return false;
    const now = new Date();
    return timeSlots.every(
      (slot) =>
        isSlotBeforeMinLeadTime(slot, dayIso, now) ||
        isSlotUnavailableForDate(slot, dayIso, bookings),
    );
  };

  const isTimeSlotUnavailable = (slot: string): boolean => {
    if (!selectedDay) return false;
    const dayIso = format(selectedDay, "yyyy-MM-dd");
    if (suljetutPaivat.includes(dayIso)) return true;
    if (isSlotBeforeMinLeadTime(slot, dayIso, new Date())) return true;
    const bookings = varausAjat[dayIso] ?? [];
    return isSlotUnavailableForDate(slot, dayIso, bookings);
  };

  const isTimeSlotUnavailableForDay = (slot: string, day: Date): boolean => {
    const dayIso = format(day, "yyyy-MM-dd");
    if (suljetutPaivat.includes(dayIso)) return true;
    if (isSlotBeforeMinLeadTime(slot, dayIso, new Date())) return true;
    const bookings = varausAjat[dayIso] ?? [];
    return isSlotUnavailableForDate(slot, dayIso, bookings);
  };

  useEffect(() => {
    if (!selectedDay || !selectedTime) return;
    if (isTimeSlotUnavailable(selectedTime)) {
      setSelectedTime("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveToDestinationMinutes, varausAjat, suljetutPaivat, selectedDay, selectedTime]);

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
    <div data-testid="calendar" className="rounded-xl bg-white/20 p-3 backdrop-blur-sm shadow-none sm:col-span-2 sm:bg-white/30 sm:p-5 sm:shadow-[0_1px_4px_rgba(0,0,0,0.08)] lg:p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2 lg:mb-1.5">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-600">Varaa ajankohta</p>
        </div>
        {isLoadingReservedDays ? (
          <span className="text-[11px] font-medium text-slate-500">Päivitetään...</span>
        ) : null}
      </div>

      {isMobile ? (
        <>
          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => canGoBack && setWeekStart((current) => addDays(current, -navStep))}
              disabled={!canGoBack}
              className="shrink-0 rounded-lg bg-white/20 px-4 py-2 text-[#1a2e4a] transition hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-30 focus:ring-[3px] focus:ring-blue-200"
              aria-label="Edellinen jakso"
            >
              ←
            </button>
            <div className="flex-1 rounded-lg border border-white/30 bg-white/10 px-2 py-2 text-center text-[14px] font-semibold text-[#1a2e4a]">
              {format(weekDays[0], "d.M.", { locale: fi })} – {format(weekDays[weekDays.length - 1], "d.M.", { locale: fi })}
            </div>
            <button
              type="button"
              onClick={() => canGoForward && setWeekStart((current) => addDays(current, navStep))}
              disabled={!canGoForward}
              className="shrink-0 rounded-lg bg-white/20 px-4 py-2 text-[#1a2e4a] transition hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-30 focus:ring-[3px] focus:ring-blue-200"
              aria-label="Seuraava jakso"
            >
              →
            </button>
          </div>

          <div
            className="grid grid-cols-2 gap-2"
            onTouchStart={handleDayGridTouchStart}
            onTouchEnd={handleDayGridTouchEnd}
          >
            {weekDays.map((day) => {
              const past = isPast(day);
              const reserved = isPaivaVarattu(day);
              const isSelectedDay = selectedDay ? isSameDay(selectedDay, day) : false;
              const showSlots = !!selectedDay && !isPast(selectedDay);

              return (
                <div key={day.toISOString()} className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    disabled={past}
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedTime("");
                      setIsTimeMenuOpen(false);
                    }}
                    className={`rounded-lg px-2 py-3 text-center transition ${
                      past
                        ? "cursor-not-allowed bg-white/10 text-slate-400 opacity-60"
                        : isSelectedDay
                        ? "bg-[#1a2e4a] text-white"
                        : "bg-white/20 text-[#1a2e4a] hover:bg-white/40"
                    }`}
                  >
                    <span className="block text-[14px] font-semibold capitalize">
                      {format(day, "EEEEEE", { locale: fi })} {format(day, "d.M.", { locale: fi })}
                    </span>
                    {reserved && !past ? (
                      <span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[10px] ${isSelectedDay ? "bg-white/15 text-white" : "bg-white/40 text-slate-600"}`}>
                        Varattu
                      </span>
                    ) : null}
                  </button>

                  {showSlots ? (
                    past ? (
                      <div className="rounded-lg bg-white/10 px-2 py-3 text-center text-[12px] text-slate-500">—</div>
                    ) : reserved ? (
                      <div className="rounded-lg bg-white/10 px-2 py-3 text-center text-[12px] text-slate-600">Varattu</div>
                    ) : (
                      timeSlots.map((slot) => {
                        const unavailable = isTimeSlotUnavailableForDay(slot, day);
                        const isCurrentSelection = isSelectedDay && selectedTime === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={unavailable}
                            onClick={() => {
                              setSelectedDay(day);
                              setSelectedTime(slot);
                              setIsTimeMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition ${
                              unavailable
                                ? "cursor-not-allowed border-white/20 bg-white/5 text-slate-400 line-through"
                                : isCurrentSelection
                                ? "border-[#1a2e4a] bg-[#1a2e4a] text-white"
                                : "border-[#1a2e4a]/20 bg-white/30 text-[#1a2e4a] hover:bg-white/50"
                            }`}
                          >
                            <span className="text-[15px] font-semibold">{slot}</span>
                            <span className="text-[14px]">›</span>
                          </button>
                        );
                      })
                    )
                  ) : null}
                </div>
              );
            })}
          </div>

          {selectedDay && selectedTime && !isPast(selectedDay) && driveToDestinationMinutes !== null && driveFromRiihimakiMinutes !== null ? (
            <div className="mt-3 rounded-[10px] bg-transparent px-2 py-3 text-[13px] leading-7 text-[#1a2e4a]">
              <p>📍 Saapuminen kohteeseen: ~{selectedTime}</p>
              <p>
                ⏱ Arvioitu kuljetuksen kokonaiskesto: {durationLabel(WORK_DURATION_MINUTES + driveToDestinationMinutes)}
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => canGoBack && setWeekStart((current) => addDays(current, -navStep))}
              disabled={!canGoBack}
              className="shrink-0 rounded-lg bg-white/20 px-2 py-2 text-[#1a2e4a] transition hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-30 sm:bg-white/30 sm:px-3 sm:backdrop-blur-sm focus:ring-[3px] focus:ring-blue-200"
              aria-label="Edellinen jakso"
            >
              ←
            </button>

            <div className="grid min-w-0 flex-1 grid-cols-7 gap-2 lg:gap-1.5">
              {weekDays.map((day) => {
                const selected = selectedDay ? isSameDay(selectedDay, day) : false;
                const reserved = isPaivaVarattu(day);
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
                    className={`rounded-lg px-1 py-2.5 text-center transition sm:py-2 lg:py-1 ${
                      selected
                        ? "bg-[#1a2e4a] text-white"
                        : "bg-white/10 text-[#1a2e4a] hover:bg-white/30"
                    } ${disabled ? "cursor-not-allowed opacity-40 hover:bg-white/10" : ""}`}
                  >
                    <span className={`block text-[11px] uppercase tracking-[0.06em] lg:text-[10px] ${selected ? "text-white/80" : "text-slate-500"}`}>
                      {format(day, "EE", { locale: fi })}
                    </span>
                    <span className="mt-0.5 block text-[17px] font-bold sm:text-[18px] lg:text-[16px]">{format(day, "d")}</span>
                    <span className={`block text-[10px] lg:text-[9px] ${selected ? "text-white/80" : "text-slate-500"}`}>
                      {format(day, "LLL", { locale: fi })}
                    </span>
                    <span className="mt-1 block h-3 text-[10px]">
                      {reserved ? (
                        <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] ${selected ? "bg-white/15 text-white" : "bg-white/40 text-slate-600"}`}>
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
              className="shrink-0 rounded-lg bg-white/20 px-2 py-2 text-[#1a2e4a] transition hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-30 sm:bg-white/30 sm:px-3 sm:backdrop-blur-sm focus:ring-[3px] focus:ring-blue-200"
              aria-label="Seuraava jakso"
            >
              →
            </button>
          </div>

          {selectedDay && !isPast(selectedDay) ? (
            <div className="mt-4 animate-[fadein_200ms_ease-in-out] lg:mt-2.5">
              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                Valitse kuljetusaika
              </label>

              <div ref={timeMenuRef} className="overflow-hidden rounded-[10px] bg-white/30 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setIsTimeMenuOpen((current) => !current)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-[17px] text-[#1a2e4a] transition hover:bg-white/20 lg:py-2.5"
                  aria-expanded={isTimeMenuOpen}
                  aria-label="Valitse saapumisaika"
                >
                  <span>{selectedTime || "-- Valitse aika --"}</span>
                  <span className={`text-[14px] text-slate-600 transition ${isTimeMenuOpen ? "rotate-180" : ""}`}>⌄</span>
                </button>

                {isTimeMenuOpen ? (
                  <div className="max-h-52 overflow-y-auto lg:max-h-44">
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
                <div className="mt-3 rounded-[10px] bg-transparent px-4 py-3 text-[13px] leading-7 text-[#1a2e4a]">
                  <p>📍 Saapuminen kohteeseen: ~{selectedTime}</p>
                  <p>
                    ⏱ Arvioitu kuljetuksen kokonaiskesto: {durationLabel(WORK_DURATION_MINUTES + driveToDestinationMinutes)}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-[12px] text-slate-600">
                  Täytä mistä ja minne jotta kuljetushinta voidaan laskea
                </p>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
