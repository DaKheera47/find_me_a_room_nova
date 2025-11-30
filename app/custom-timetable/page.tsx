"use client";

import { Suspense } from "react";
import { BookOpen, Clock, MapPin, Users } from "lucide-react";

import { cleanModuleName, dateStringToReadable } from "@/lib/utils";
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
} from "@/components/SearchableCombobox";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import CalendarForTimetable from "@/components/CalendarForTimetable";

import { useCustomTimetable } from "./useCustomTimetable";
import { SelectedModulesCard } from "./SelectedModulesCard";
import { ICSLinksCard } from "./ICSLinksCard";
import { TimetablePreviewCard } from "./TimetablePreviewCard";

function CustomTimetablePageContent() {
  const {
    modules,
    isListLoading,
    listError,
    selectedModules,
    openAccordions,
    setOpenAccordions,
    previewEvents,
    isPreviewLoading,
    previewError,
    icsData,
    isGeneratingLink,
    linkError,
    copiedUrl,
    fetchModules,
    handleAddModule,
    handleRemoveModule,
    handleToggleGroup,
    handleGenerateLink,
    handleCopyUrl,
    comboboxItems,
    timetableEntries,
    hasValidSelections,
  } = useCustomTimetable();

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <PageHeader
        title="Custom Timetable Generator"
        description="Build your personalized timetable by selecting your modules and groups, then generate a subscribable calendar link."
      />

      {/* Module Selector */}
      <SearchableCombobox
        title="Add Modules"
        description="Search and add modules to your custom timetable."
        icon={<BookOpen className="size-5" />}
        placeholder="Search for a module..."
        searchPlaceholder="Search by code or name..."
        emptyMessage="No module found."
        loadingMessage="Loading modules..."
        items={comboboxItems}
        selectedValue=""
        onSelect={handleAddModule}
        onClear={() => {}}
        onRefresh={fetchModules}
        isLoading={isListLoading}
        error={listError}
        itemCount={modules.length}
      />

      {/* Selected Modules with Group Selection */}
      <SelectedModulesCard
        selectedModules={selectedModules}
        openAccordions={openAccordions}
        setOpenAccordions={setOpenAccordions}
        handleRemoveModule={handleRemoveModule}
        handleToggleGroup={handleToggleGroup}
        handleGenerateLink={handleGenerateLink}
        hasValidSelections={hasValidSelections}
        isGeneratingLink={isGeneratingLink}
      />

      {/* Errors */}
      {previewError && <ErrorAlert message={previewError} />}
      {linkError && <ErrorAlert message={linkError} />}

      {/* ICS Links */}
      {icsData && (
        <ICSLinksCard
          icsData={icsData}
          copiedUrl={copiedUrl}
          handleCopyUrl={handleCopyUrl}
        />
      )}

      {/* Preview */}
      {previewEvents.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timetable Preview</CardTitle>
              <CardDescription>
                {previewEvents.length} session(s) found for your selected
                modules and groups.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {previewEvents.slice(0, 20).map((event, idx) => (
                  <div
                    key={`${event.id}-${idx}`}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {event.moduleCode} - {event.group || "Session"}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {cleanModuleName(event.moduleName || event.module)}
                        </p>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {dateStringToReadable(event.startDateString)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {event.roomName}
                          </span>
                          {event.lecturer && (
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {event.lecturer}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">{event.time}</Badge>
                    </div>
                  </div>
                ))}
                {previewEvents.length > 20 && (
                  <p className="text-muted-foreground text-center text-sm">
                    +{previewEvents.length - 20} more sessions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Calendar View</CardTitle>
              <CardDescription>
                Visual overview of your custom timetable.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0">
              <CalendarForTimetable timetable={timetableEntries} />
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}

export default function CustomTimetablePage() {
  return (
    <Suspense
      fallback={
        <section className="container space-y-8 pb-12 pt-10">
          <LoadingSpinner />
        </section>
      }
    >
      <CustomTimetablePageContent />
    </Suspense>
  );
}
