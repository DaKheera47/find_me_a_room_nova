import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function dateStringToReadable(dateString: string | undefined): string {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    // Formatting the date part
    const formattedDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    // Formatting the time part to include only the hour in 12-hour format with am/pm
    const formattedTime = date
        .toLocaleTimeString("en-GB", {
            hour: "2-digit",
            hour12: true,
            minute: "2-digit",
        })
        .toLowerCase()
        .replace(/ /g, "");

    // Combining the formatted time and date parts
    return `${formattedTime}, ${formattedDate}`;
}
