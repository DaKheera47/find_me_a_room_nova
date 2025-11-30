"use client";

import { Suspense } from "react";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Check,
} from "lucide-react";

import { cleanModuleName, dateStringToReadable } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchableCombobox } from "@/components/SearchableCombobox";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import CalendarForTimetable from "@/components/CalendarForTimetable";

import { useCourseTimetable } from "./useCourseTimetable";
import { StepIndicator } from "./StepIndicator";
import { ModuleGroupsCard } from "./ModuleGroupsCard";
import { ICSLinksCard } from "../custom-timetable/ICSLinksCard";

function CourseTimetablePageContent() {
  const {
    courses,
    isCoursesLoading,
    coursesError,
    fetchCourses,
    courseComboboxItems,
    courseState,
    handleSelectCourse,
    handleClearCourse,
    yearComboboxItems,
    handleSelectYear,
    handleClearYear,
    currentStep,
    compulsoryModules,
    selectedOptionalModules,
    optionalModuleComboboxItems,
    handleAddOptionalModule,
    handleRemoveOptionalModule,
    handleToggleGroup,
    allSelectedModules,
    hasValidSelections,
    openAccordions,
    setOpenAccordions,
    previewEvents,
    isPreviewLoading,
    previewError,
    timetableEntries,
    icsData,
    isGeneratingLink,
    linkError,
    handleGenerateLink,
    copiedUrl,
    handleCopyUrl,
  } = useCourseTimetable();

  const steps = [
    { number: 1, label: "Select Course", completed: currentStep > 1 },
    { number: 2, label: "Choose Year", completed: currentStep > 2 },
    { number: 3, label: "Pick Modules", completed: currentStep > 3 },
    { number: 4, label: "Configure Groups", completed: false },
  ];

  return (
    <section className="container space-y-8 pb-12 pt-10">
      <PageHeader
        title="Course Timetable Builder"
        description="Build your timetable by selecting your course, year, and modules. We'll help you choose which optional modules and groups to include."
      />

      {/* Step Indicator */}
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Step 1: Course Selection */}
      <SearchableCombobox
        title="Step 1: Select Your Course"
        description="Search for your degree programme to get started."
        icon={<GraduationCap className="size-5" />}
        placeholder="Search for a course..."
        searchPlaceholder="Search by course name..."
        emptyMessage="No course found."
        loadingMessage="Loading courses..."
        items={courseComboboxItems}
        selectedValue={courseState.selectedCourse?.id.toString() || ""}
        onSelect={(value) => handleSelectCourse(parseInt(value, 10))}
        onClear={handleClearCourse}
        onRefresh={fetchCourses}
        isLoading={isCoursesLoading}
        error={coursesError}
        itemCount={courses.length}
        popoverWidth="w-[500px]"
      />

      {/* Step 2: Year Selection */}
      {courseState.selectedCourse && (
        <SearchableCombobox
          title="Step 2: Choose Your Year"
          description={`Select your year of study for ${courseState.selectedCourse.title}`}
          icon={<Calendar className="size-5" />}
          placeholder="Select your year..."
          searchPlaceholder="Search years..."
          emptyMessage="No years found for this course."
          loadingMessage="Loading years..."
          items={yearComboboxItems}
          selectedValue={courseState.selectedYear?.id.toString() || ""}
          onSelect={(value) => handleSelectYear(parseInt(value, 10))}
          onClear={handleClearYear}
          isLoading={courseState.isLoadingCourse}
          error={null}
          itemCount={courseState.years.length}
        />
      )}

      {/* Step 3: Optional Module Selection */}
      {courseState.selectedYear && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              Step 3: Select Optional Modules
            </CardTitle>
            <CardDescription>
              Your compulsory modules have been automatically added below.
              Select any optional modules you&apos;re taking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Compulsory modules info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 text-sm font-semibold">
                Compulsory Modules ({compulsoryModules.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {compulsoryModules.map((m) => (
                  <Badge key={m.moduleCode} variant="secondary">
                    <Check className="mr-1 size-3" />
                    {m.moduleCode}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Optional modules selector */}
            {optionalModuleComboboxItems.length > 0 && (
              <SearchableCombobox
                title="Add Optional Modules"
                description={`${courseState.selectedYear.optionalModules.length} optional modules available for ${courseState.selectedYear.label}`}
                icon={<BookOpen className="size-4" />}
                placeholder="Search for an optional module..."
                searchPlaceholder="Search by code or name..."
                emptyMessage="No more optional modules available."
                loadingMessage="Loading..."
                items={optionalModuleComboboxItems}
                selectedValue=""
                onSelect={handleAddOptionalModule}
                onClear={() => {}}
                isLoading={false}
                error={null}
                itemCount={optionalModuleComboboxItems.length}
              />
            )}

            {/* Selected optional modules list */}
            {selectedOptionalModules.length > 0 && (
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-semibold">
                  Selected Optional Modules ({selectedOptionalModules.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedOptionalModules.map((m) => (
                    <Badge
                      key={m.moduleCode}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleRemoveOptionalModule(m.moduleCode)}
                    >
                      {m.moduleCode}
                      <span className="ml-1 text-destructive">×</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Configure Groups */}
      {allSelectedModules.length > 0 && (
        <ModuleGroupsCard
          compulsoryModules={compulsoryModules}
          optionalModules={selectedOptionalModules}
          openAccordions={openAccordions}
          setOpenAccordions={setOpenAccordions}
          handleToggleGroup={handleToggleGroup}
          handleRemoveOptionalModule={handleRemoveOptionalModule}
          handleGenerateLink={handleGenerateLink}
          hasValidSelections={hasValidSelections}
          isGeneratingLink={isGeneratingLink}
        />
      )}

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
      {isPreviewLoading && <LoadingSpinner message="Loading preview..." />}

      {!isPreviewLoading && previewEvents.length > 0 && (
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
                        <p className="text-sm text-muted-foreground">
                          {cleanModuleName(event.moduleName || event.module)}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
                  <p className="text-center text-sm text-muted-foreground">
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
                Visual overview of your course timetable.
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

export default function CourseTimetablePage() {
  return (
    <Suspense
      fallback={
        <section className="container space-y-8 pb-12 pt-10">
          <LoadingSpinner />
        </section>
      }
    >
      <CourseTimetablePageContent />
    </Suspense>
  );
}
