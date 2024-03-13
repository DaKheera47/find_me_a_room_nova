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
    "yyyy-MM-dd",
    "MM/dd/yyyy",
    "dd-MM-yyyy HH:mm:ss",
    "EEE MMM d yyyy HH:mm:ss 'GMT'X",
    "yyyy-MM-dd'T'HH:mm:ss.SSSX",
  ];

  // Convert the input date string to a date object if it's not already.
  if (typeof dateString === "string") {
    console.log("dateString before iso", dateString);
    // dateString = parseISO(dateString);
    console.log("dateString after iso", dateString);
    // dateString = parse(dateString, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", new Date());
  }

  console.log(dateString);

  let parsedDate = tryParseDate(dateString.toString(), dateFormats);

  if (!parsedDate) {
    return "Invalid date";
  }

  // Adjusted the format based on the input date string format you're dealing with.
  // Removed milliseconds and timezone from the format string as they are not present in your example input.
  const date = format(parsedDate.toString(), "h:mma, d MMMM yyyy");

  // Format the date to the desired format "12:24pm, 11 March 2024".
  return date.toString();
}

export function getOrdinalNum(n: number) {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function cleanModuleName(moduleName: string) {
  return moduleName.replace(/\(.*?\)/g, "");
}
