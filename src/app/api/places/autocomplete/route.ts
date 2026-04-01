import { NextResponse } from "next/server";

import { getGoogleMapsApiKey } from "@/lib/google-maps-config";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get("input")?.trim();

    if (!input || input.length < 3) {
      return NextResponse.json({ ok: true, suggestions: [] });
    }

    const apiKey = getGoogleMapsApiKey();

    if (!apiKey) {
      return NextResponse.json({ ok: true, suggestions: [] });
    }

    const params = new URLSearchParams({
      input,
      types: "address",
      language: "fi",
      components: "country:fi",
      key: apiKey,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Osoite-ehdotusten haku epäonnistui.",
        },
        { status: 502 },
      );
    }

    const result = (await response.json()) as {
      status?: string;
      error_message?: string;
      predictions?: Array<{ description?: string; place_id?: string }>;
    };

    if (result.status !== "OK" && result.status !== "ZERO_RESULTS") {
      return NextResponse.json(
        {
          ok: false,
          error: result.error_message ?? "Google Places ei palauttanut osoitteita.",
        },
        { status: 502 },
      );
    }

    const suggestions = (result.predictions ?? [])
      .map((prediction) => ({
        label: prediction.description?.trim() ?? "",
        placeId: prediction.place_id ?? "",
      }))
      .filter((prediction) => prediction.label.length > 0)
      .slice(0, 5);

    return NextResponse.json({ ok: true, suggestions });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Osoite-ehdotusten haku epäonnistui palvelimella.",
      },
      { status: 500 },
    );
  }
}