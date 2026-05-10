import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  fetchAlAdhanCalendarByCoordinates,
  normalizeAlAdhanCalendarResponse,
} from "./aladhan";

const input = {
  latitude: 23.8103,
  longitude: 90.4125,
  timezone: "Asia/Dhaka",
  method: 1,
  school: 1,
  startDate: "2026-05-11",
  days: 2,
};

describe("aladhan client and normalization", () => {
  afterEach(() => {
    mock.restore();
  });

  test("normalizes to app-facing prayers only and YYYY-MM-DD dates", () => {
    const normalized = normalizeAlAdhanCalendarResponse(
      {
        code: 200,
        status: "OK",
        data: [
          {
            timings: {
              Fajr: "04:12 (BST)",
              Sunrise: "05:31 (BST)",
              Dhuhr: "11:58 (BST)",
              Asr: "15:25 (BST)",
              Maghrib: "18:22 (BST)",
              Isha: "19:41 (BST)",
              Imsak: "04:02 (BST)",
              Sunset: "18:22 (BST)",
              Midnight: "23:59 (BST)",
            },
            date: {
              gregorian: { date: "11-05-2026" },
              hijri: { date: "24-11-1447" },
            },
          },
        ],
      },
      input
    );

    expect(normalized).toHaveLength(1);
    expect(normalized[0]?.date).toBe("2026-05-11");
    expect(normalized[0]?.timings).toEqual({
      fajr: "04:12",
      sunrise: "05:31",
      dhuhr: "11:58",
      asr: "15:25",
      maghrib: "18:22",
      isha: "19:41",
    });
  });

  test("throws on non-2xx responses", async () => {
    globalThis.fetch = mock(
      async () => new Response("nope", { status: 500 })
    ) as never;

    await expect(fetchAlAdhanCalendarByCoordinates(input)).rejects.toThrow(
      "AlAdhan request failed: HTTP 500"
    );
  });

  test("throws when calendar data is not an array", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(JSON.stringify({ code: 200, status: "OK", data: null }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
    ) as never;

    await expect(fetchAlAdhanCalendarByCoordinates(input)).rejects.toThrow(
      "AlAdhan calendar response missing data array"
    );
  });
});
