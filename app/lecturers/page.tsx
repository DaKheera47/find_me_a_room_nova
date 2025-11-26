"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "lucide-react";

import { getLecturers, getLecturerSchedule } from "@/lib/apiCalls";
import { formatLecturerName } from "@/lib/utils";
import {
  SearchableCombobox,
  ComboboxItem,
} from "@/components/SearchableCombobox";
import { ScheduleDisplay } from "@/components/ScheduleDisplay";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { LecturerScheduleResponse } from "@/types/lecturer";

function LecturersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nameFromUrl = searchParams.get("name");

  // Lecturer list state
  const [lecturers, setLecturers] = useState<string[]>([]);
  const [listLastUpdated, setListLastUpdated] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState(nameFromUrl || "");
  const [listError, setListError] = useState<string | null>(null);
  const [isListLoading, setIsListLoading] = useState(false);

  // Lecturer schedule state
  const [scheduleData, setScheduleData] =
    useState<LecturerScheduleResponse | null>(null);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Fetch lecturer list
  const fetchLecturers = async (refresh = false) => {
    setIsListLoading(true);
    setListError(null);

    try {
      const data = await getLecturers(refresh);
      setLecturers(data.lecturers);
      setListLastUpdated(data.generatedAt);
    } catch (err) {
      console.error(err);
      setListError("Failed to load lecturers. Please try again.");
    } finally {
      setIsListLoading(false);
    }
  };

  // Fetch schedule for selected lecturer
  const fetchSchedule = async (name: string) => {
    if (!name) {
      setScheduleData(null);
      return;
    }

    setIsScheduleLoading(true);
    setScheduleError(null);

    try {
      const response = await getLecturerSchedule(name);
      setScheduleData(response);
    } catch (err) {
      console.error(err);
      setScheduleError("Unable to load this lecturer's timetable.");
    } finally {
      setIsScheduleLoading(false);
    }
  };

  // Load lecturer list on mount
  useEffect(() => {
    fetchLecturers();
  }, []);

  // Sync selected name from URL on mount and URL changes
  useEffect(() => {
    if (nameFromUrl && nameFromUrl !== selectedName) {
      setSelectedName(nameFromUrl);
    }
  }, [nameFromUrl]);

  // Fetch schedule when selected name changes
  useEffect(() => {
    if (selectedName) {
      fetchSchedule(selectedName);
    } else {
      setScheduleData(null);
    }
  }, [selectedName]);

  const handleSelect = (value: string) => {
    setSelectedName(value);
    router.push(`/lecturers?name=${encodeURIComponent(value)}`, {
      scroll: false,
    });
  };

  const handleClear = () => {
    setSelectedName("");
    setScheduleData(null);
    router.push("/lecturers", { scroll: false });
  };

  // Transform lecturers to combobox items
  const comboboxItems: ComboboxItem[] = useMemo(
    () =>
      lecturers.map((lecturer) => ({
        value: formatLecturerName(lecturer) || lecturer,
        label: formatLecturerName(lecturer) || lecturer,
      })),
    [lecturers]
  );

  const displayName = useMemo(() => {
    const formatted = formatLecturerName(selectedName);
    return formatted.length ? formatted : selectedName;
  }, [selectedName]);

  const sessions = useMemo(() => scheduleData?.timetable ?? [], [scheduleData]);

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <PageHeader
        title="Lecturer Search"
        description="Browse the aggregated timetable and select a lecturer to view their current teaching schedule."
      />

      <SearchableCombobox
        title="Find a Lecturer"
        description="Start typing a name to filter the list."
        icon={<User className="size-5" />}
        placeholder="Select lecturer..."
        searchPlaceholder="Search lecturers..."
        emptyMessage="No lecturer found."
        loadingMessage="Loading lecturers..."
        items={comboboxItems}
        selectedValue={selectedName}
        onSelect={handleSelect}
        onClear={handleClear}
        onRefresh={() => fetchLecturers(true)}
        isLoading={isListLoading}
        error={listError}
        lastUpdated={listLastUpdated}
        popoverWidth="w-[320px]"
      />

      {/* Schedule Content */}
      {scheduleError && <ErrorAlert message={scheduleError} />}

      {isScheduleLoading && <LoadingSpinner message="Loading timetable..." />}

      {!isScheduleLoading && !scheduleError && scheduleData && (
        <div className="space-y-6">
          {/* Lecturer Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <p className="text-muted-foreground">
              Teaching schedule aggregated from the room timetables.
            </p>
            {scheduleData.generatedAt && (
              <p className="text-xs text-muted-foreground">
                Dataset generated:{" "}
                {new Date(scheduleData.generatedAt).toLocaleString()}
              </p>
            )}
          </div>

          <ScheduleDisplay
            sessions={sessions}
            variant="lecturer"
            generatedAt={scheduleData.generatedAt ?? undefined}
          />
        </div>
      )}
    </section>
  );
}

export default function LecturersPage() {
  return (
    <Suspense
      fallback={
        <section className="container space-y-8 pb-12 pt-10">
          <LoadingSpinner />
        </section>
      }
    >
      <LecturersPageContent />
    </Suspense>
  );
}
