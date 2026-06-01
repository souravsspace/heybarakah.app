import { describe, expect, test } from "bun:test";
import {
  celestialTone,
  derivePrayerState,
  formatCountdown,
  formatHM,
  HIJRI_MONTHS_INTERNAL,
  hijriDateString,
  localMinuteOfDay,
  parseSnapshotISO,
} from "@/lib/widget-derive";
import type { WidgetSnapshot } from "@/lib/widgets-native";

const HEX_COLOR = /^#[0-9a-f]{6}$/;

function iso(date: string, hm: string): string {
  return `${date}T${hm}:00+00:00`;
}

function makeSnapshot(): WidgetSnapshot {
  const d = "2026-05-30";
  return {
    v: 1,
    generatedAt: iso(d, "04:00"),
    tz: "+00:00",
    date: d,
    prayers: [
      {
        name: "fajr",
        adhanISO: iso(d, "05:00"),
        startISO: iso(d, "05:00"),
        endISO: iso(d, "05:30"),
      },
      {
        name: "dhuhr",
        adhanISO: iso(d, "12:00"),
        startISO: iso(d, "12:00"),
        endISO: iso(d, "12:30"),
      },
      {
        name: "asr",
        adhanISO: iso(d, "15:00"),
        startISO: iso(d, "15:00"),
        endISO: iso(d, "15:30"),
      },
      {
        name: "maghrib",
        adhanISO: iso(d, "18:00"),
        startISO: iso(d, "18:00"),
        endISO: iso(d, "18:30"),
      },
      {
        name: "isha",
        adhanISO: iso(d, "20:00"),
        startISO: iso(d, "20:00"),
        endISO: iso(d, "20:30"),
      },
    ],
    tomorrowFajrISO: iso("2026-05-31", "05:00"),
    streak: { days: 1, best: 1, history: [], todayDone: 0 },
    dhikr: { arabic: "", count: 0, target: 33, sessionTotal: 0 },
    ayah: { arabic: "", translation: "", surah: "", reference: "" },
    lockNow: null,
  };
}

describe("parseSnapshotISO", () => {
  test("reads epoch and local minute-of-day from offset string", () => {
    const p = parseSnapshotISO(iso("2026-05-30", "12:34"));
    expect(p?.minuteOfDay).toBe(12 * 60 + 34);
    expect(p?.epochMs).toBe(Date.parse("2026-05-30T12:34:00+00:00"));
  });

  test("returns null for garbage", () => {
    expect(parseSnapshotISO("not-a-date")).toBeNull();
  });
});

describe("derivePrayerState", () => {
  const snap = makeSnapshot();

  test("active prayer stays shown OUTSIDE its lock window (Bug 1)", () => {
    // 15:45 is 45 min past Asr adhan (15:00) and past its lock window
    // [15:00,15:30], but before Maghrib (18:00). The app shows Asr in progress;
    // the widget must too — not jump to the next prayer.
    const s = derivePrayerState(snap, Date.parse(iso("2026-05-30", "15:45")));
    expect(s.display.name).toBe("asr");
    expect(s.isActive).toBe(true);
    expect(s.isLocked).toBe(false);
    expect(s.timeText).toBe("15:00");
    expect(s.countdownMinutes).toBe(135); // 15:45 → 18:00 Maghrib
    expect(s.countdownText).toBe("2h 15m");
  });

  test("inside the lock window → QUIET badge (isLocked)", () => {
    const s = derivePrayerState(snap, Date.parse(iso("2026-05-30", "12:10")));
    expect(s.display.name).toBe("dhuhr");
    expect(s.isActive).toBe(true);
    expect(s.isLocked).toBe(true);
    expect(s.timeText).toBe("12:00");
    expect(s.countdownMinutes).toBe(170); // 12:10 → 15:00 Asr
  });

  test("before the first prayer → next, not active", () => {
    const s = derivePrayerState(snap, Date.parse(iso("2026-05-30", "04:30")));
    expect(s.display.name).toBe("fajr");
    expect(s.isActive).toBe(false);
    expect(s.isLocked).toBe(false);
    expect(s.timeText).toBe("05:00");
    expect(s.countdownMinutes).toBe(30);
  });

  test("after the last prayer → stays on Isha until tomorrow's Fajr", () => {
    const s = derivePrayerState(snap, Date.parse(iso("2026-05-30", "21:00")));
    expect(s.display.name).toBe("isha");
    expect(s.isActive).toBe(true);
    expect(s.timeText).toBe("20:00");
    expect(s.countdownMinutes).toBe(8 * 60); // 21:00 → 05:00 next day
  });

  test("rail positions span first→last adhan", () => {
    const s = derivePrayerState(snap, Date.parse(iso("2026-05-30", "13:00")));
    const dhuhr = s.points.find((p) => p.name === "dhuhr");
    // first=05:00(300), last=20:00(1200), span=900; dhuhr=720 → 420/900
    expect(dhuhr?.pct).toBeCloseTo(420 / 900, 5);
    const fajr = s.points.find((p) => p.name === "fajr");
    expect(fajr?.pct).toBe(0);
    expect(fajr?.isPast).toBe(true);
    const isha = s.points.find((p) => p.name === "isha");
    expect(isha?.pct).toBe(1);
    expect(isha?.isUpcoming).toBe(true);
  });
});

describe("celestialTone", () => {
  test("snaps to a stop at its exact time", () => {
    const t = celestialTone(12 * 60 + 15);
    expect(t.sky1).toBe("#9cc3e8");
    expect(t.isMoon).toBe(false);
  });

  test("midnight is a moon tone", () => {
    const t = celestialTone(0);
    expect(t.sky1).toBe("#0a142a");
    expect(t.isMoon).toBe(true);
  });

  test("interpolates between stops", () => {
    const t = celestialTone(5 * 60 + 15); // between 04:30 and 06:00
    expect(t.sky1).not.toBe("#1f2a4f");
    expect(t.sky1).toMatch(HEX_COLOR);
  });
});

describe("formatCountdown", () => {
  test.each([
    [0, "now"],
    [45, "45m"],
    [60, "1h"],
    [90, "1h 30m"],
  ])("%i → %s", (min, out) => {
    expect(formatCountdown(min)).toBe(out);
  });
});

describe("formatHM", () => {
  test("reads wall clock from ISO", () => {
    expect(formatHM(iso("2026-05-30", "07:08"))).toBe("07:08");
  });
});

describe("localMinuteOfDay", () => {
  test("applies offset east of UTC", () => {
    const epoch = Date.parse("2026-05-30T00:00:00+00:00");
    expect(localMinuteOfDay(epoch, 5 * 60 + 30)).toBe(5 * 60 + 30);
  });
});

describe("hijriDateString", () => {
  test("returns a day + a valid Islamic month name", () => {
    const out = hijriDateString(Date.parse("2026-05-30T12:00:00+00:00"));
    const [day, ...rest] = out.split(" ");
    expect(Number(day)).toBeGreaterThanOrEqual(1);
    expect(Number(day)).toBeLessThanOrEqual(30);
    expect(HIJRI_MONTHS_INTERNAL).toContain(rest.join(" "));
  });
});
