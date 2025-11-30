"use client";

import { useState } from "react";
import { Calendar, Link, Download, Copy, Check } from "lucide-react";
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
}

export function ICSLinksCard({ icsData }: ICSLinksCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(icsData.icsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="size-5" />
          Your Calendar Links
        </CardTitle>
        <CardDescription>
          Subscribe to automatically receive timetable updates in your calendar
          app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href={icsData.webcalUrl}>
              <Calendar className="mr-2 size-4" />
              Subscribe to Calendar
            </a>
          </Button>

          <Button variant="outline" asChild>
            <a href={icsData.icsUrl} download="timetable.ics">
              <Download className="mr-2 size-4" />
              Download (.ics)
            </a>
          </Button>

          <Button variant="outline" onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check className="mr-2 size-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 size-4" />
                Copy Link
              </>
            )}
          </Button>
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
