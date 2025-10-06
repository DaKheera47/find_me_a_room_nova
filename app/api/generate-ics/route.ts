// app/api/generate-ics/route.ts
import type { NextRequest } from "next/server";
import { parse, HTMLElement } from "node-html-parser";
import ical from "ical-generator";
import { addMinutes } from "date-fns";
import { nanoid } from "nanoid";

type ParsedDate = { year: number; month: number; day: number };
type TimetableEvent = {
  day?: string;
  startTime?: string; // "09:00"
  endTime?: string; // "10:00"
  lengthMinutes?: number;
  weeks?: string; // "5-8,10-15..."
  fullName: string;
  courseCode: string;
  title: string;
  type: string;
  typeStr?: string;
  dataDetails?: string;
  group?: string;
  crn?: string;
  location?: string;
};

function sanitizeField(s?: string) {
  if (!s) return "";
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseEventNameHTML(eventNameElementHTML: string) {
  if (!eventNameElementHTML)
    return { code: "", title: "", type: "", typeStr: "" };
  const parts = eventNameElementHTML
    .split(/<br\s*\/?>/i)
    .map((p) => p.replace(/<\/?[^>]+(>|$)/g, "").trim())
    .filter(Boolean);

  const firstLine = parts[0] || "";
  let code = "";
  let title = "";
  const m = firstLine.match(/^([A-Za-z0-9\-_\.]+)\s+(.+)$/);
  if (m) {
    code = sanitizeField(m[1].trim());
    title = sanitizeField(m[2].trim());
  } else {
    title = sanitizeField(firstLine.trim());
  }

  let type = "";
  let typeStr = "";
  if (parts[1]) {
    typeStr = sanitizeField(parts[1]);
    const noParen = parts[1].replace(/\(.*\)/g, "").trim();
    const tMatch = noParen.match(/([A-Za-z]+)/);
    if (tMatch) type = sanitizeField(tMatch[1].toLowerCase());
    else type = sanitizeField(noParen.toLowerCase());
  }

  return { code, title, type, typeStr };
}

/** new: find the event-name HTML more robustly */
function findEventNameHTML(event: HTMLElement) {
  // Many timetables put the code/title inside a strong in a particular area.
  // Try a few heuristics, falling back to the second <strong> if present.
  const strongs = Array.from(event.getElementsByTagName("strong") || []);
  // 1) find strong with a BR in parent or innerHTML containing <br>
  for (const s of strongs) {
    const html = s.innerHTML || "";
    if (/<br\s*\/?>/i.test(html)) return html;
    const text = (s.textContent || "").trim();
    // looks like "CO3519 Artificial Intelligence" -> code + title
    if (/^[A-Za-z0-9\-_\.]+\s+\w+/.test(text)) return s.innerHTML || text;
  }
  // 2) fallback: take the longest strong text (likely the title)
  if (strongs.length) {
    const longest = strongs.reduce((a, b) =>
      (a.textContent || "").length >= (b.textContent || "").length ? a : b,
    );
    return longest.innerHTML || longest.textContent || "";
  }
  return "";
}

function parseTimeRange(timeText?: string) {
  if (!timeText)
    return { start: undefined, end: undefined, minutes: undefined };
  // normalize different dash characters
  const normalized = timeText.replace(/\u2013|\u2014|\u2212/g, "-").trim();

  // accept formats like "09:00 - 10:00", "9am - 10am", "9:00am - 10:00am", "09:00–10:00"
  const hhmmRe = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;
  const ampmRe =
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i;

  let start: string | undefined;
  let end: string | undefined;

  let m = normalized.match(hhmmRe);
  if (m) {
    start = m[1];
    end = m[2];
  } else {
    m = normalized.match(ampmRe);
    if (m) {
      const parseAmPm = (t: string) => {
        t = t.trim().toLowerCase();
        const ampm = t.endsWith("pm") ? "pm" : "am";
        t = t.replace(/\s*(am|pm)$/i, "");
        const [hhStr, mmStr] = t.split(":");
        let hh = Number(hhStr);
        const mm = Number(mmStr || "0");
        if (ampm === "pm" && hh !== 12) hh += 12;
        if (ampm === "am" && hh === 12) hh = 0;
        return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
      };
      start = parseAmPm(m[1]);
      end = parseAmPm(m[2]);
    }
  }

  if (!start || !end)
    return { start: undefined, end: undefined, minutes: undefined };

  const toMinutes = (t: string) => {
    const [hh, mm] = t.split(":").map(Number);
    return hh * 60 + mm;
  };
  const minutes = toMinutes(end) - toMinutes(start);
  return { start, end, minutes: minutes >= 0 ? minutes : undefined };
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hh, mm] = time.split(":").map(Number);
  const total = hh * 60 + mm + minutesToAdd;
  const newH = Math.floor((total % (24 * 60)) / 60)
    .toString()
    .padStart(2, "0");
  const newM = (total % 60).toString().padStart(2, "0");
  return `${newH}:${newM}`;
}

/** normalize "5-8,10-15,33" -> [5,6,7,8,10,...] */
function expandWeekList(weeksStr?: string) {
  if (!weeksStr) return [];
  // remove common prefixes like "Weeks:" or "Week:"
  weeksStr = weeksStr.replace(/^Weeks?:\s*/i, "");
  const parts = weeksStr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const out: number[] = [];
  for (const part of parts) {
    const r = part.match(/^(\d+)-(\d+)$/);
    if (r) {
      const a = Number(r[1]);
      const b = Number(r[2]);
      for (let w = a; w <= b; w++) out.push(w);
    } else {
      const n = Number(part);
      if (!Number.isNaN(n)) out.push(n);
    }
  }
  return Array.from(new Set(out)).sort((a, b) => a - b);
}

/** Parse timetable-key to Map<weekNumber, ParsedDate> */
function parseWeekKey(root: HTMLElement) {
  const map = new Map<number, ParsedDate>();
  const keyContainer = root.querySelector(".timetable-key");
  if (!keyContainer) return map;

  const keyDivs = keyContainer.querySelectorAll(".key");
  keyDivs.forEach((k) => {
    const badge = k.querySelector(".badge")?.textContent?.trim() || "";
    const weekMatch = badge.match(/Week\s*(\d+)/i);
    let dateText = (k.textContent || "").replace(badge, "").trim();
    dateText = dateText.replace(/\s+/g, " ").trim();
    if (weekMatch && dateText) {
      const weekNum = Number(weekMatch[1]);
      const dMatch = dateText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dMatch) {
        const day = Number(dMatch[1]);
        const month = Number(dMatch[2]);
        const year = Number(dMatch[3]);
        map.set(weekNum, { year, month, day });
      }
    }
  });
  return map;
}

/** find row header (Day) for an event node */
function findRowHeaderForTd(node: HTMLElement) {
  // climb until tr found (or table)
  let el: HTMLElement | null = node;
  while (el && el.tagName.toLowerCase() !== "tr") {
    el = el.parentNode as HTMLElement | null;
  }
  // if we didn't find tr, try the original parent chain until table row-like header is found
  let tr = el;
  if (!tr) {
    // fallback: search upward for any element that has a preceding th in previous siblings
    el = node;
    while (el) {
      const candidate = el.querySelector(
        "th.TimeTableRowHeader, th.TimeTableRowHeader.FirstRow",
      );
      if (candidate && candidate.textContent)
        return sanitizeField(candidate.textContent.trim());
      el = el.parentNode as HTMLElement | null;
    }
    return undefined;
  }

  // look for header cell in same row
  const th = tr.querySelector(
    "th.TimeTableRowHeader, th.TimeTableRowHeader.FirstRow",
  );
  if (th && th.textContent) return sanitizeField(th.textContent.trim());

  // otherwise walk previous rows until a header is found
  let prev = (tr.previousElementSibling as HTMLElement) || null;
  while (prev) {
    const prevTh = prev.querySelector(
      "th.TimeTableRowHeader, th.TimeTableRowHeader.FirstRow",
    );
    if (prevTh && prevTh.textContent)
      return sanitizeField(prevTh.textContent.trim());
    prev = prev.previousElementSibling as HTMLElement;
  }
  return undefined;
}

function extractCampusFromTypeStr(typeStr?: string) {
  if (!typeStr) return "";
  const m = typeStr.match(/\(([^)]+)\)/);
  return m ? sanitizeField(m[1]) : "";
}

function getDayOffset(dayName?: string): number {
  if (!dayName) return 0;
  const days: Record<string, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };
  return days[dayName.toLowerCase()] ?? 0;
}

/** Escape newlines in description passed to ical-generator (it will escape further) */
function normalizeDescriptionLines(parts: string[]) {
  return parts
    .filter(Boolean)
    .map((p) => sanitizeField(p))
    .join("\n");
}

/* ---------- API handler ---------- */

export async function POST(request: NextRequest) {
  try {
    const { html, reminderMinutes = 15 } = await request.json();

    if (!html) {
      return new Response("No HTML provided", { status: 400 });
    }

    const root = parse(String(html));
    const weekMap = parseWeekKey(root); // Map<number, ParsedDate>

    // parse events
    const events = root.querySelectorAll(".StuTTEvent");
    if (!events.length) {
      return new Response("No events found", { status: 400 });
    }

    const parsedEvents: TimetableEvent[] = [];

    events.forEach((event) => {
      // find the best strong that contains event name/title
      const eventNameElementHTML =
        findEventNameHTML(event as HTMLElement) || "";
      const { code, title, type, typeStr } =
        parseEventNameHTML(eventNameElementHTML);

      // derive cleaned full name from text content of the strongest element (fallback)
      let cleanedFullname = "";
      const allStrongs = event.getElementsByTagName("strong") || [];
      if (allStrongs.length) {
        cleanedFullname = (
          Array.from(allStrongs).reduce((a, b) =>
            (a.textContent || "").length >= (b.textContent || "").length
              ? a
              : b,
          ).textContent || ""
        )
          .replace(/\(On Campus\)/gi, "")
          .trim();
      } else {
        cleanedFullname = (event.textContent || "")
          .replace(/\(On Campus\)/gi, "")
          .trim();
      }

      // group/weeks are often in the first nested div strongs
      const firstDiv = event.querySelector("div");
      const strongsInDiv = firstDiv?.getElementsByTagName("strong") || [];
      // Heuristic: group is usually the first strong inside a small info div and weeks the next
      const groupRaw = sanitizeField(strongsInDiv?.[0]?.textContent || "");
      let weeksText = sanitizeField(strongsInDiv?.[1]?.textContent || "");
      weeksText = weeksText.replace(/^Weeks?:\s*/i, "");

      // If weeksText doesn't look like weeks, search all strongs for something containing 'Week' or numbers
      if (!/week|[\d-+,]/i.test(weeksText || "")) {
        for (const s of Array.from(allStrongs || [])) {
          const t = s.textContent || "";
          if (/weeks?:/i.test(t) || /\d+(?:-\d+)?(?:,\d+)*$/.test(t.trim())) {
            weeksText = sanitizeField(t);
            break;
          }
        }
      }
      // strip "Weeks:" prefix if present
      weeksText = weeksText.replace(/^Weeks?:\s*/i, "");

      // visible time is often in the first strong of the event element
      const firstStrong = event.getElementsByTagName("strong")?.[0];
      const visibleTime = sanitizeField(firstStrong?.textContent || "");

      let startTime: string | undefined;
      let endTime: string | undefined;
      let lengthMinutes: number | undefined;

      // try to parse visibleTime first (supports hh:mm and am/pm now)
      const parsedRange = parseTimeRange(visibleTime);
      if (
        parsedRange.start &&
        parsedRange.end &&
        typeof parsedRange.minutes === "number"
      ) {
        startTime = parsedRange.start;
        endTime = parsedRange.end;
        lengthMinutes = parsedRange.minutes;
      } else {
        // fallback to parsing data-details: look for HH:MM anywhere and for length integer
        const dataDetails = event.getAttribute("data-details") || "";
        if (dataDetails) {
          // times in dataDetails
          const times = Array.from(
            dataDetails.matchAll(/(\d{1,2}:\d{2})/g),
          ).map((m) => m[1]);
          if (times.length >= 1) {
            startTime = times[0];
            if (times.length >= 2) {
              endTime = times[1];
            }
          }
          // length often present as a numeric part in the ~ separated fields. try to find a plausible minutes value
          const parts = dataDetails
            .split("~")
            .map((p) => p.trim())
            .filter(Boolean);
          // look for a numeric part that is a reasonable minutes count (< 24*60)
          for (const p of parts) {
            if (/^\d+$/.test(p)) {
              const n = Number(p);
              if (n > 0 && n < 24 * 60) {
                lengthMinutes = n;
                break;
              }
            }
          }
          // if we found start but no end and length, try to look for an explicit length token like "len" or similar
          if (!endTime && lengthMinutes && startTime) {
            endTime = addMinutesToTime(startTime, lengthMinutes);
          }
        }
      }

      const day = findRowHeaderForTd(event as HTMLElement);
      const rawDD = event.getAttribute("data-details") || undefined;
      let crn;
      if (rawDD) {
        const parts = rawDD.split("~");
        // try multiple positions for CRN: prefer parts[2], else first numeric-looking token
        crn = sanitizeField(parts[2] || "");
        if (!crn) {
          for (const p of parts) {
            if (/^\d{3,6}$/.test(p.trim())) {
              crn = p.trim();
              break;
            }
          }
        }
      }

      let location = extractCampusFromTypeStr(typeStr) || "";
      if (!location && rawDD) {
        const parts = rawDD.split("~");
        if (parts[6]) location = sanitizeField(parts[6]);
        // fallback: search for "On Campus" or known campus text in rawDD
        if (!location && /On Campus/i.test(rawDD)) location = "On Campus";
      }

      // push parsed event (weeks text is raw now; expand later)
      parsedEvents.push({
        day,
        startTime,
        endTime,
        lengthMinutes,
        weeks: weeksText,
        fullName: sanitizeField(cleanedFullname),
        courseCode: code,
        title,
        type,
        typeStr,
        dataDetails: rawDD,
        group: groupRaw,
        crn,
        location,
      });

      // Helpful debug logging for problematic events
      if (!startTime) {
        console.warn("Event without start time parsed:", {
          title,
          fullName: cleanedFullname,
          dataDetails: event.getAttribute("data-details"),
          visibleTime,
        });
      }
      if (!weeksText) {
        console.warn("Event without weeks text parsed:", {
          title,
          fullName: cleanedFullname,
          eventHTML: event.toString().slice(0, 400),
        });
      }
    });

    // create calendar
    const cal = ical({
      name: "UCLan Timetable",
      prodId: { company: "uclan", product: "timetable-to-ics" },
    });

    const minutesBefore = Math.max(0, Number(reminderMinutes) || 15);

    // For each parsed event occurrence, build start/end Date objects
    for (const ev of parsedEvents) {
      const weekNumbers = expandWeekList(ev.weeks);
      if (!weekNumbers.length) continue;

      for (const wk of weekNumbers) {
        const wkDate = weekMap.get(wk);
        if (!wkDate) continue;
        if (!ev.startTime) continue;

        // weekMap gives us Monday for each week, adjust for actual day
        const dayOffset = getDayOffset(ev.day);

        const [hStr, mStr] = ev.startTime.split(":");
        const startHour = Number(hStr);
        const startMinute = Number(mStr || "0");

        // Create a date in local time (JavaScript Date constructor uses local time)
        // Note: month is 0-indexed in JavaScript Date
        const startDate = new Date(
          wkDate.year,
          wkDate.month - 1,
          wkDate.day + dayOffset,
          startHour,
          startMinute,
          0,
        );

        // compute end date
        let endDate: Date;
        if (ev.lengthMinutes && ev.lengthMinutes > 0) {
          endDate = addMinutes(startDate, ev.lengthMinutes);
        } else if (ev.endTime) {
          const [eh, em] = ev.endTime.split(":").map(Number);
          endDate = new Date(
            wkDate.year,
            wkDate.month - 1,
            wkDate.day + dayOffset,
            eh,
            em,
            0,
          );
        } else {
          endDate = addMinutes(startDate, 60); // default 1 hour
        }

        const summary = ev.title
          ? `${ev.title}${ev.courseCode ? ` (${ev.courseCode})` : ""}`
          : ev.fullName;

        const description = normalizeDescriptionLines([
          ev.fullName,
          ev.group ? `Group: ${ev.group}` : "",
          ev.type ? `Type: ${ev.type}` : "",
        ]);

        const event = cal.createEvent({
          start: startDate,
          end: endDate,
          summary,
          description,
          location: ev.location || "On Campus",
        });

        // Add alarm if needed
        if (minutesBefore > 0) {
          event.createAlarm({
            type: "display" as any,
            trigger: minutesBefore * 60,
            triggerBefore: minutesBefore * 60,
          });
        }

        // Set UID separately
        const uid = `${ev.courseCode || "event"}-${wk}-${nanoid()}`;
        event.uid(uid);
      } // for wk
    } // for ev

    const ics = cal.toString();

    return new Response(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="uclan_timetable-${new Date().toISOString().slice(0, 10)}.ics"`,
      },
    });
  } catch (err: any) {
    console.error("generate-ics error:", err);
    return new Response(String(err?.message || err), { status: 500 });
  }
}
