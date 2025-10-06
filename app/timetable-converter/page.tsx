"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Download } from "lucide-react";

interface PreviewEvent {
  id: string;
  title: string;
  start: string;
  duration: number;
}

// converter
export default function TimetableConverter() {
  const [htmlInput, setHtmlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [icsContent, setIcsContent] = useState<string | null>(null);
  const [previewEvents, setPreviewEvents] = useState<PreviewEvent[]>([]);

  const handleConvert = async () => {
    if (!htmlInput.trim()) {
      setStatus({ type: "error", message: "Please paste your timetable HTML" });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: null, message: "" });
    setIcsContent(null);
    setPreviewEvents([]);

    try {
      // Sanitize HTML input before sending to backend
      const sanitizedHtml = htmlInput
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .trim();

      const response = await fetch("/api/generate-ics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: sanitizedHtml, reminderMinutes: 15 }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to process timetable");
      }

      const icsData = await response.text();
      setIcsContent(icsData);

      // Parse ICS for preview (basic parsing)
      const eventMatches = icsData.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
      const events: TimetableEntry[] = eventMatches.map((eventBlock, index) => {
        const summaryMatch = eventBlock.match(/SUMMARY:(.*)/);
        const dtStartMatch = eventBlock.match(/DTSTART:(.*)/);
        const durationMatch = eventBlock.match(/DURATION:PT(\d+)H?(\d+)?M/);

        return {
          id: `event-${index}`,
          title: summaryMatch?.[1]?.replace(/\\,/g, ",").replace(/\\n/g, " ") || "Untitled Event",
          start: dtStartMatch?.[1] || "",
          duration: durationMatch ? parseInt(durationMatch[1] || "0") * 60 + parseInt(durationMatch[2] || "0") : 60,
        };
      });

      setPreviewEvents(events);
      setStatus({
        type: "success",
        message: `Successfully parsed ${eventMatches.length} event(s)`,
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message: error.message || "An error occurred while processing",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadICS = (icsData: string) => {
    const blob = new Blob([icsData], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timetable.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">
          UCLan Timetable to ICS Converter
        </h1>
        <span className="w-fit bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-xl font-bold text-transparent">
          Convert your UCLan timetable HTML to calendar format
        </span>
        <p className="mt-4 max-w-2xl text-gray-700 dark:text-gray-300">
          Paste the HTML from your UCLan timetable page below and convert it to
          an ICS file that you can import into any calendar application.
        </p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Timetable HTML Input</CardTitle>
          <CardDescription>
            Open your UCLan timetable page, right-click and select &quot;View Page
            Source&quot; or press Ctrl+U (Cmd+Option+U on Mac), then copy and paste
            the entire HTML here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your timetable HTML here..."
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            className="min-h-[300px] font-mono text-xs"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleConvert}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Processing..." : "Parse & Preview"}
            </Button>

            {icsContent && (
              <Button
                onClick={() => downloadICS(icsContent)}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 size-4" />
                Download ICS
              </Button>
            )}
          </div>

          {status.type && (
            <div
              className={`flex items-center gap-2 rounded-md p-3 ${
                status.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <AlertCircle className="size-5" />
              )}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <ol className="list-inside list-decimal space-y-2">
            <li>Navigate to your UCLan student timetable page</li>
            <li>Right-click anywhere on the page and select &quot;View Page Source&quot;</li>
            <li>Copy all the HTML code (Ctrl+A or Cmd+A, then Ctrl+C or Cmd+C)</li>
            <li>Paste it into the text area above</li>
            <li>Click &quot;Parse & Preview&quot; to view your timetable</li>
            <li>Review the calendar preview below</li>
            <li>Click &quot;Download ICS&quot; to save your calendar file</li>
            <li>Import the downloaded file into your calendar app (Google Calendar, Apple Calendar, Outlook, etc.)</li>
          </ol>
        </CardContent>
      </Card>

      {previewEvents.length > 0 && (
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Timetable Preview</CardTitle>
              <CardDescription>
                Preview of your converted timetable ({previewEvents.length} events)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previewEvents.slice(0, 10).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-md border p-3 text-sm"
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-muted-foreground">
                      {event.start} • {event.duration} minutes
                    </div>
                  </div>
                ))}
                {previewEvents.length > 10 && (
                  <p className="text-muted-foreground text-sm">
                    ...and {previewEvents.length - 10} more events
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
