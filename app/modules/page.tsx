"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Users, Clock, Calendar } from "lucide-react";

import { getModules, getModuleSchedule } from "@/lib/apiCalls";
import { cleanModuleName } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SearchableCombobox,
  ComboboxItem,
} from "@/components/SearchableCombobox";
import { ScheduleDisplay } from "@/components/ScheduleDisplay";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ModuleInfo, ModuleScheduleResponse } from "@/types/module";

function ModulesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");

  // Module list state
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [listLastUpdated, setListLastUpdated] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState(codeFromUrl || "");
  const [listError, setListError] = useState<string | null>(null);
  const [isListLoading, setIsListLoading] = useState(false);

  // Module schedule state
  const [scheduleData, setScheduleData] =
    useState<ModuleScheduleResponse | null>(null);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Fetch module list
  const fetchModules = async () => {
    setIsListLoading(true);
    setListError(null);

    try {
      const data = await getModules();
      setModules(data.modules);
      setListLastUpdated(data.generatedAt);
    } catch (err) {
      console.error(err);
      setListError("Failed to load modules. Please try again.");
    } finally {
      setIsListLoading(false);
    }
  };

  // Fetch schedule for selected module
  const fetchSchedule = async (code: string) => {
    if (!code) {
      setScheduleData(null);
      return;
    }

    setIsScheduleLoading(true);
    setScheduleError(null);

    try {
      const response = await getModuleSchedule(code);
      setScheduleData(response);
    } catch (err) {
      console.error(err);
      setScheduleError("Unable to load this module's timetable.");
    } finally {
      setIsScheduleLoading(false);
    }
  };

  // Load module list on mount
  useEffect(() => {
    fetchModules();
  }, []);

  // Sync selected code from URL on mount and URL changes
  useEffect(() => {
    if (codeFromUrl && codeFromUrl !== selectedCode) {
      setSelectedCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  // Fetch schedule when selected code changes
  useEffect(() => {
    if (selectedCode) {
      fetchSchedule(selectedCode);
    } else {
      setScheduleData(null);
    }
  }, [selectedCode]);

  const handleSelect = (moduleCode: string) => {
    setSelectedCode(moduleCode);
    router.push(`/modules?code=${encodeURIComponent(moduleCode)}`, {
      scroll: false,
    });
  };

  const handleClear = () => {
    setSelectedCode("");
    setScheduleData(null);
    router.push("/modules", { scroll: false });
  };

  // Transform modules to combobox items
  const comboboxItems: ComboboxItem[] = useMemo(
    () =>
      modules.map((module) => ({
        value: module.code,
        label: module.code,
        sublabel: cleanModuleName(module.name),
        extra: module.eventCount ? `${module.eventCount} sessions` : undefined,
      })),
    [modules]
  );

  const sessions = useMemo(() => scheduleData?.timetable ?? [], [scheduleData]);

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <PageHeader
        title="Module Search"
        description="Search for a module by code or name to view all scheduled sessions across all rooms and lecturers."
      />

      <SearchableCombobox
        title="Find a Module"
        description="Start typing a module code (e.g., CO3519) or name to filter the list."
        icon={<BookOpen className="size-5" />}
        placeholder="Select module..."
        searchPlaceholder="Search by code or name..."
        emptyMessage="No module found."
        loadingMessage="Loading modules..."
        items={comboboxItems}
        selectedValue={selectedCode}
        onSelect={handleSelect}
        onClear={handleClear}
        onRefresh={fetchModules}
        isLoading={isListLoading}
        error={listError}
        lastUpdated={listLastUpdated}
        itemCount={modules.length}
      />

      {/* Schedule Content */}
      {scheduleError && <ErrorAlert message={scheduleError} />}

      {isScheduleLoading && <LoadingSpinner message="Loading timetable..." />}

      {!isScheduleLoading && !scheduleError && scheduleData && (
        <div className="space-y-6">
          {/* Module Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{scheduleData.module.code}</h2>
            <p className="text-lg text-muted-foreground">
              {cleanModuleName(scheduleData.module.name)}
            </p>
            {scheduleData.generatedAt && (
              <p className="text-xs text-muted-foreground">
                Dataset generated:{" "}
                {new Date(scheduleData.generatedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Summary Card */}
          {sessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Module Summary</CardTitle>
                <CardDescription>
                  Overview of all scheduled sessions for this module.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {scheduleData.summary.totalSessions}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Total Session(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="size-5 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {scheduleData.summary.lecturers.length}
                      </p>
                      <p className="text-muted-foreground text-sm">Lecturer(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="size-5 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {scheduleData.summary.sessionTypes.length}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Session Type(s)
                      </p>
                    </div>
                  </div>
                </div>

                {scheduleData.summary.lecturers.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 font-medium text-sm">Lecturers:</p>
                    <div className="flex flex-wrap gap-2">
                      {scheduleData.summary.lecturers.map((lecturer) => (
                        <Badge key={lecturer} variant="outline">
                          {lecturer}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {scheduleData.summary.sessionTypes.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 font-medium text-sm">Session Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {scheduleData.summary.sessionTypes.map((type) => (
                        <Badge key={type} variant="outline">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <ScheduleDisplay
            sessions={sessions}
            variant="module"
            generatedAt={scheduleData.generatedAt ?? undefined}
          />
        </div>
      )}
    </section>
  );
}

export default function ModulesPage() {
  return (
    <Suspense
      fallback={
        <section className="container space-y-8 pb-12 pt-10">
          <LoadingSpinner />
        </section>
      }
    >
      <ModulesPageContent />
    </Suspense>
  );
}
