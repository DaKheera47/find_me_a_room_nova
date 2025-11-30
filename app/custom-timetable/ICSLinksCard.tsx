"use client";

import { Copy, Check, ExternalLink, Calendar, Link, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ICSLinkResponse } from "@/types/customTimetable";

interface ICSLinksCardProps {
  icsData: ICSLinkResponse;
  copiedUrl: string | null;
  handleCopyUrl: (url: string) => void;
}

export function ICSLinksCard({
  icsData,
  copiedUrl,
  handleCopyUrl,
}: ICSLinksCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="size-5" />
          Your Calendar Links
        </CardTitle>
        <CardDescription>
          Subscribe to these links to automatically receive timetable updates in
          your calendar app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download ICS File */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            <Download className="mr-2 inline size-4" />
            Download ICS File
          </label>
          <div className="flex gap-2">
            <Button variant="default" asChild className="flex-1">
              <a href={icsData.icsUrl} download="timetable.ics">
                <Download className="mr-2 size-4" />
                Download Timetable (.ics)
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Download and import directly into your calendar app
          </p>
        </div>

        {/* ICS URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            <Calendar className="mr-2 inline size-4" />
            ICS Feed URL (Apple Calendar, Outlook)
          </label>
          <div className="flex gap-2">
            <code className="flex-1 overflow-hidden rounded-md bg-muted p-3 text-xs">
              <span className="block truncate">{icsData.icsUrl}</span>
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopyUrl(icsData.icsUrl)}
            >
              {copiedUrl === icsData.icsUrl ? (
                <Check className="size-4 text-green-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Paste this URL when adding a calendar subscription
          </p>
        </div>

        {/* Webcal URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            <Calendar className="mr-2 inline size-4" />
            Quick Subscribe (webcal://)
          </label>
          <div className="flex gap-2">
            <code className="flex-1 overflow-hidden rounded-md bg-muted p-3 text-xs">
              <span className="block truncate">{icsData.webcalUrl}</span>
            </code>
            <Button variant="outline" size="icon" asChild>
              <a href={icsData.webcalUrl}>
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Click the arrow to open directly in your calendar app
          </p>
        </div>

        {/* Google Calendar URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            <Calendar className="mr-2 inline size-4" />
            Add to Google Calendar
          </label>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="flex-1">
              <a
                href={icsData.googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 size-4" />
                Open in Google Calendar
              </a>
            </Button>
          </div>
        </div>

        <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <strong>Note:</strong> The timetable data updates every night around
          3am. Your subscribed calendar will automatically fetch the latest
          changes.
        </p>
      </CardContent>
    </Card>
  );
}
