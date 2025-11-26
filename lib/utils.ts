import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { format, isValid, parse } from "date-fns";

function tryParseDate(dateString: string, formatList: string[]) {
  for (let format of formatList) {
    try {
      // Attempt to parse the date using the current format
      let parsedDate = parse(dateString, format, new Date());
      // If parsing was successful and the date seems reasonable, return it
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    } catch (error) {
      // If parsing fails, move on to the next format
      continue;
    }
  }
  // If no formats match, return null or throw an error
  return null;
}

export function dateStringToReadable(
  dateString: string | Date | undefined,
): string {
  if (!dateString) {
    return "";
  }

  const dateFormats = [
    "yyyy-MM-dd'T'HH:mm:ss",      // ISO without timezone (from DB)
    "yyyy-MM-dd'T'HH:mm:ss.SSSX", // ISO with millis and timezone
    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", // ISO with millis and Z
    "yyyy-MM-dd'T'HH:mm:ssX",     // ISO with timezone
    "yyyy-MM-dd",
    "MM/dd/yyyy",
    "dd-MM-yyyy HH:mm:ss",
    "EEE MMM d yyyy HH:mm:ss 'GMT'X",
  ];

  // Convert the input date string to a date object if it's not already.
  let parsedDate: Date | null = null;

  if (typeof dateString === "string") {
    parsedDate = tryParseDate(dateString, dateFormats);
  } else if (dateString instanceof Date) {
    parsedDate = isValid(dateString) ? dateString : null;
  }

  if (!parsedDate) {
    return "Invalid date";
  }

  // Format the date to the desired format "12:24pm, 11 March 2024".
  return format(parsedDate, "h:mma, d MMMM yyyy");
}

export function getOrdinalNum(n: number) {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function cleanModuleName(moduleName: string) {
  return moduleName.replace(/\(.*?\)/g, "").trim();
}

const capitalizeToken = (token: string) => {
  if (!token.length) return "";
  return token[0].toUpperCase() + token.slice(1).toLowerCase();
};

const titleCaseWord = (word: string) =>
  word
    .split(/([-'])/)
    .map((segment, index) =>
      index % 2 === 1 ? segment : capitalizeToken(segment),
    )
    .join("");

const toTitleCase = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(titleCaseWord)
    .join(" ");

export const formatLecturerName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed.length) return "";

  const commaSeparatedParts = trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const orderedParts =
    commaSeparatedParts.length > 1
      ? [...commaSeparatedParts.slice(1), commaSeparatedParts[0]]
      : commaSeparatedParts;

  if (!orderedParts.length) return "";

  return toTitleCase(orderedParts.join(" "));
};
