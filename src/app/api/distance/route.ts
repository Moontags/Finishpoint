import { NextResponse } from "next/server";

import { distanceLookupUnavailableMessage, getGoogleMapsApiKey } from "@/lib/google-maps-config";

type DistanceRequest = {
  origin: string;
  destination: string;
  waypoints?: string[];
};

function parseDistanceMeters(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

type DistanceMatrixElement = {
  status?: string;
  distance?: {
    value?: number;
    text?: string;
  };
  duration?: {
    value?: number;
    text?: string;
  };
};

function parseDurationSeconds(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

async function fetchLegDistance(
  apiKey: string,
  origin: string,
  destination: string,
): Promise<{ meters: number; durationSeconds: number | null } | { error: string }> {
  const params = new URLSearchParams({
    origins: origin,
    destinations: destination,
    mode: "driving",
    language: "fi",
    region: "fi",
    units: "metric",
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return { error: "Etäisyyden haku epäonnistui Google Maps -palvelusta." };
  }

  const result = (await response.json()) as {
    status?: string;
    error_message?: string;
    rows?: Array<{
      elements?: DistanceMatrixElement[];
    }>;
  };

  if (result.status !== "OK") {
    return { error: result.error_message ?? "Google Maps ei palauttanut etäisyyttä." };
  }

  const element = result.rows?.[0]?.elements?.[0];

  if (!element || element.status !== "OK") {
    return { error: "Etäisyyttä ei voitu laskea annetuilla osoitteilla." };
  }

  const meters = parseDistanceMeters(element.distance?.value);

  if (meters === null) {
    return { error: "Etäisyysdatan käsittely epäonnistui." };
  }

  return {
    meters,
    durationSeconds: parseDurationSeconds(element.duration?.value),
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<DistanceRequest>;
    const origin = payload.origin?.trim();
    const destination = payload.destination?.trim();
    const waypoints = (payload.waypoints ?? [])
      .map((waypoint) => waypoint?.trim())
      .filter((waypoint): waypoint is string => Boolean(waypoint));

    if (!origin || !destination) {
      return NextResponse.json(
        {
          ok: false,
          error: "Anna sekä nouto- että toimitusosoite.",
        },
        { status: 400 },
      );
    }

    const apiKey = getGoogleMapsApiKey();

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: distanceLookupUnavailableMessage,
        },
        { status: 503 },
      );
    }

    const checkpoints = [origin, ...waypoints, destination];

    if (checkpoints.length < 2) {
      return NextResponse.json(
        {
          ok: false,
          error: "Reitin laskentaan tarvitaan vähintään kaksi osoitetta.",
        },
        { status: 400 },
      );
    }

    let totalMeters = 0;
    const legs: Array<{ from: string; to: string; distanceKm: number; durationMinutes: number | null }> = [];
    let totalDurationSeconds = 0;

    for (let index = 0; index < checkpoints.length - 1; index += 1) {
      const from = checkpoints[index];
      const to = checkpoints[index + 1];
      const leg = await fetchLegDistance(apiKey, from, to);

      if ("error" in leg) {
        return NextResponse.json(
          {
            ok: false,
            error: leg.error,
          },
          { status: 502 },
        );
      }

      totalMeters += leg.meters;
      if (leg.durationSeconds !== null) {
        totalDurationSeconds += leg.durationSeconds;
      }
      legs.push({
        from,
        to,
        distanceKm: Number((leg.meters / 1000).toFixed(1)),
        durationMinutes: leg.durationSeconds !== null ? Math.round(leg.durationSeconds / 60) : null,
      });
    }

    const distanceKm = Number((totalMeters / 1000).toFixed(1));
    const distanceText = `${distanceKm} km`;
    const durationMinutes = totalDurationSeconds > 0 ? Math.round(totalDurationSeconds / 60) : null;

    return NextResponse.json({
      ok: true,
      distanceKm,
      distanceText,
      durationMinutes,
      legs,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Etäisyyden haku epäonnistui palvelimella.",
      },
      { status: 500 },
    );
  }
}