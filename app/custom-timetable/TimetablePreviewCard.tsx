"use client";

import CalendarForTimetable from "@/components/CalendarForTimetable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TimetableEntry } from "@/types/timetableEntry";
import { CalendarDays } from "lucide-react";

interface TimetablePreviewCardProps {
  isLoadingPreview: boolean;
  previewError: string | null;
  previewEvents: TimetableEntry[];
  timetableEntries: TimetableEntry[];
  hasValidSelections: boolean;
}

export function TimetablePreviewCard({
  isLoadingPreview,
  previewError,
  previewEvents,
  timetableEntries,
  hasValidSelections,
}: TimetablePreviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5" />
          Timetable Preview
        </CardTitle>
        <CardDescription>
          Preview of what your calendar will look like
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingPreview ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="text-muted-foreground ml-2">
              Loading preview...
            </span>
          </div>
        ) : previewError ? (
          <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
            {previewError}
          </div>
        ) : previewEvents.length > 0 ? (
          <CalendarForTimetable timetable={timetableEntries} />
        ) : hasValidSelections ? (
          <p className="text-muted-foreground py-12 text-center">
            No events found for the selected groups. Try selecting different
            groups.
          </p>
        ) : (
          <p className="text-muted-foreground py-12 text-center">
            Add modules and select groups to see a preview
          </p>
        )}
      </CardContent>
    </Card>
  );
}
