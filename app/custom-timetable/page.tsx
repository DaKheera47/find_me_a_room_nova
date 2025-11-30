"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Link,
  Copy,
  Check,
  ExternalLink,
  Clock,
  MapPin,
  Users,
} from "lucide-react";

import {
  getModules,
  getModuleGroups,
  getTimetablePreview,
  generateICSLink,
} from "@/lib/apiCalls";
import { cleanModuleName, dateStringToReadable } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  SearchableCombobox,
  ComboboxItem,
} from "@/components/SearchableCombobox";
import { PageHeader } from "@/components/PageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ModuleInfo } from "@/types/module";
import {
  ModuleSelection,
  PreviewEvent,
  ICSLinkResponse,
} from "@/types/customTimetable";
import CalendarForTimetable from "@/components/CalendarForTimetable";
import { TimetableEntry } from "@/types/timetableEntry";

interface ModuleWithGroups {
  moduleCode: string;
  moduleName: string;
  availableGroups: string[];
  selectedGroups: string[];
  isLoadingGroups: boolean;
}

function CustomTimetablePageContent() {
  // Module list state
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [isListLoading, setIsListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Selected modules with groups
  const [selectedModules, setSelectedModules] = useState<ModuleWithGroups[]>(
    [],
  );

  // Module picker state
  const [moduleToAdd, setModuleToAdd] = useState("");

  // Preview state
  const [previewEvents, setPreviewEvents] = useState<PreviewEvent[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // ICS link state
  const [icsData, setIcsData] = useState<ICSLinkResponse | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Accordion state - track which modules are expanded
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  // Fetch module list
  const fetchModules = async () => {
    setIsListLoading(true);
    setListError(null);

    try {
      const data = await getModules();
      setModules(data.modules);
    } catch (err) {
      console.error(err);
      setListError("Failed to load modules. Please try again.");
    } finally {
      setIsListLoading(false);
    }
  };

  // Load module list on mount
  useEffect(() => {
    fetchModules();
  }, []);

  // Add a module
  const handleAddModule = async (moduleCode: string) => {
    if (!moduleCode) return;

    // Check if already added
    if (selectedModules.some((m) => m.moduleCode === moduleCode)) {
      setModuleToAdd("");
      return;
    }

    const moduleInfo = modules.find((m) => m.code === moduleCode);

    // Add to list with loading state
    const newModule: ModuleWithGroups = {
      moduleCode,
      moduleName: moduleInfo?.name || moduleCode,
      availableGroups: [],
      selectedGroups: [],
      isLoadingGroups: true,
    };

    setSelectedModules((prev) => [...prev, newModule]);
    setModuleToAdd("");
    // Open the accordion for the newly added module
    setOpenAccordions((prev) => [...prev, moduleCode]);

    // Fetch groups for this module
    try {
      const groupsData = await getModuleGroups(moduleCode);
      // Keep original group values (with leading "/" if present) for API calls
      const groups = groupsData.groups;
      // Preselect groups containing "full_group" (case-insensitive)
      const preselectedGroups = groups.filter((g) =>
        g.toLowerCase().includes("full_group"),
      );
      setSelectedModules((prev) =>
        prev.map((m) =>
          m.moduleCode === moduleCode
            ? {
                ...m,
                availableGroups: groups,
                selectedGroups: preselectedGroups,
                isLoadingGroups: false,
              }
            : m,
        ),
      );
    } catch (err) {
      console.error(err);
      setSelectedModules((prev) =>
        prev.map((m) =>
          m.moduleCode === moduleCode
            ? { ...m, isLoadingGroups: false, availableGroups: [] }
            : m,
        ),
      );
    }
  };

  // Remove a module
  const handleRemoveModule = (moduleCode: string) => {
    setSelectedModules((prev) =>
      prev.filter((m) => m.moduleCode !== moduleCode),
    );
    // Remove from open accordions
    setOpenAccordions((prev) => prev.filter((code) => code !== moduleCode));
    // Clear ICS data when selections change
    setIcsData(null);
  };

  // Toggle group selection
  const handleToggleGroup = (moduleCode: string, group: string) => {
    setSelectedModules((prev) =>
      prev.map((m) => {
        if (m.moduleCode !== moduleCode) return m;
        const newSelected = m.selectedGroups.includes(group)
          ? m.selectedGroups.filter((g) => g !== group)
          : [...m.selectedGroups, group];
        return { ...m, selectedGroups: newSelected };
      }),
    );
    // Clear ICS data when selections change (preview will auto-update)
    setIcsData(null);
  };

  // Create a serialized key for the selections to properly detect changes
  const selectionsKey = useMemo(() => {
    return selectedModules
      .filter((m) => !m.isLoadingGroups)
      .map((m) => `${m.moduleCode}:${m.selectedGroups.sort().join(",")}`)
      .join("|");
  }, [selectedModules]);

  // Auto-fetch preview when selections change
  useEffect(() => {
    const fetchPreview = async () => {
      const selections: ModuleSelection[] = selectedModules
        .filter((m) => m.selectedGroups.length > 0 && !m.isLoadingGroups)
        .map((m) => ({
          moduleCode: m.moduleCode,
          groups: m.selectedGroups,
        }));

      if (selections.length === 0) {
        setPreviewEvents([]);
        return;
      }

      setIsPreviewLoading(true);
      setPreviewError(null);

      try {
        const data = await getTimetablePreview(selections);
        setPreviewEvents(data.events);
      } catch (err) {
        console.error(err);
        setPreviewError("Failed to generate preview. Please try again.");
      } finally {
        setIsPreviewLoading(false);
      }
    };

    fetchPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionsKey]);

  // Generate ICS link
  const handleGenerateLink = async () => {
    const selections: ModuleSelection[] = selectedModules
      .filter((m) => m.selectedGroups.length > 0)
      .map((m) => ({
        moduleCode: m.moduleCode,
        groups: m.selectedGroups,
      }));

    if (selections.length === 0) {
      setLinkError("Please select at least one module with groups.");
      return;
    }

    setIsGeneratingLink(true);
    setLinkError(null);

    try {
      const data = await generateICSLink(selections);
      setIcsData(data);
    } catch (err) {
      console.error(err);
      setLinkError("Failed to generate ICS link. Please try again.");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Transform modules to combobox items (excluding already selected)
  const comboboxItems: ComboboxItem[] = useMemo(() => {
    const selectedCodes = new Set(selectedModules.map((m) => m.moduleCode));
    return modules
      .filter((m) => !selectedCodes.has(m.code))
      .map((module) => ({
        value: module.code,
        label: module.code,
        sublabel: cleanModuleName(module.name),
        extra: module.eventCount ? `${module.eventCount} sessions` : undefined,
      }));
  }, [modules, selectedModules]);

  // Transform preview events to timetable entries for calendar
  const timetableEntries: TimetableEntry[] = useMemo(
    () =>
      previewEvents.map((e) => ({
        topIdx: 0,
        slotInDay: 0,
        time: e.time,
        module: e.module,
        lecturer: e.lecturer,
        group: e.group,
        roomName: e.roomName,
        day: e.day,
        startDateString: e.startDateString,
        endDateString: e.endDateString,
      })),
    [previewEvents],
  );

  // Check if any selections are valid
  const hasValidSelections = selectedModules.some(
    (m) => m.selectedGroups.length > 0,
  );

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
        selectedValue={moduleToAdd}
        onSelect={handleAddModule}
        onClear={() => setModuleToAdd("")}
        onRefresh={fetchModules}
        isLoading={isListLoading}
        error={listError}
        itemCount={modules.length}
      />

      {/* Selected Modules with Group Selection */}
      {selectedModules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Selected Modules ({selectedModules.length})
            </CardTitle>
            <CardDescription>
              Choose which groups/session types to include for each module.
              Click to expand and configure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion
              type="multiple"
              className="w-full"
              value={openAccordions}
              onValueChange={setOpenAccordions}
            >
              {selectedModules.map((module) => (
                <AccordionItem
                  key={module.moduleCode}
                  value={module.moduleCode}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-1 items-center justify-between pr-2">
                      <div className="text-left">
                        <span className="font-semibold">
                          {module.moduleCode}
                        </span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {cleanModuleName(module.moduleName)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!module.isLoadingGroups &&
                          module.availableGroups.length > 0 && (
                            <Badge variant="secondary">
                              {module.selectedGroups.length}/
                              {module.availableGroups.length}
                            </Badge>
                          )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveModule(module.moduleCode);
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {module.isLoadingGroups ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <LoadingSpinner />
                          Loading groups...
                        </div>
                      ) : module.availableGroups.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No specific groups found. All sessions will be
                          included.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {module.availableGroups.map((group) => (
                            <label
                              key={group}
                              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-accent"
                            >
                              <Checkbox
                                checked={module.selectedGroups.includes(group)}
                                onCheckedChange={() =>
                                  handleToggleGroup(module.moduleCode, group)
                                }
                              />
                              <span className="text-sm">
                                {group.startsWith("/") ? group.slice(1) : group}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <Separator className="my-4" />

            <div className="flex gap-3">
              <Button
                onClick={handleGenerateLink}
                disabled={!hasValidSelections || isGeneratingLink}
              >
                {isGeneratingLink ? (
                  <>
                    <LoadingSpinner />
                    Generating Link...
                  </>
                ) : (
                  <>
                    <Link className="mr-2 size-4" />
                    Generate Calendar Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {previewError && <ErrorAlert message={previewError} />}
      {linkError && <ErrorAlert message={linkError} />}

      {/* ICS Links */}
      {icsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="size-5" />
              Your Calendar Links
            </CardTitle>
            <CardDescription>
              Use these links to subscribe to your timetable. The calendar will
              automatically update when timetable data changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Direct ICS Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Direct ICS URL (for most calendar apps)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  readOnly
                  value={icsData.icsUrl}
                  className="flex-1 bg-muted"
                />
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
            </div>

            {/* Webcal Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Webcal URL (opens directly in calendar)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  readOnly
                  value={icsData.webcalUrl}
                  className="flex-1 bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyUrl(icsData.webcalUrl)}
                >
                  {copiedUrl === icsData.webcalUrl ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={icsData.webcalUrl}>
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Google Calendar */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Add to Google Calendar
              </label>
              <div>
                <Button variant="outline" asChild>
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

            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
              <strong>Note:</strong> This calendar will automatically update
              whenever the timetable data is refreshed (typically overnight).
              You only need to subscribe once!
            </div>
          </CardContent>
        </Card>
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
