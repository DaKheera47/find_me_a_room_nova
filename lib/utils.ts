import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { parse, format, parseISO } from "date-fns";

export function dateStringToReadable(
  dateString: string | Date | undefined,
): string {
  if (!dateString) {
    return "";
  }

  dateString = dateString.toString();

  // Adjusted the format based on the input date string format you're dealing with.
  // Removed milliseconds and timezone from the format string as they are not present in your example input.
  const date = format(parseISO(dateString), "h:mma, d MMMM yyyy");

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
