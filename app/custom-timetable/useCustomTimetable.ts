"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  getModules,
  getModuleGroups,
  getTimetablePreview,
  generateICSLink,
} from "@/lib/apiCalls";
import { cleanModuleName } from "@/lib/utils";
import { ModuleInfo } from "@/types/module";
import {
  ModuleSelection,
  PreviewEvent,
  ICSLinkResponse,
} from "@/types/customTimetable";
import { TimetableEntry } from "@/types/timetableEntry";
import { ComboboxItem } from "@/components/SearchableCombobox";
import { ModuleWithGroups } from "./types";

export function useCustomTimetable() {
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
  const fetchModules = useCallback(async () => {
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
  }, []);

  // Load module list on mount
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Add a module
  const handleAddModule = useCallback(
    async (moduleCode: string) => {
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
    },
    [modules, selectedModules],
  );

  // Remove a module
  const handleRemoveModule = useCallback((moduleCode: string) => {
    setSelectedModules((prev) =>
      prev.filter((m) => m.moduleCode !== moduleCode),
    );
    // Remove from open accordions
    setOpenAccordions((prev) => prev.filter((code) => code !== moduleCode));
    // Clear ICS data when selections change
    setIcsData(null);
  }, []);

  // Toggle group selection
  const handleToggleGroup = useCallback((moduleCode: string, group: string) => {
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
  }, []);

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
  const handleGenerateLink = useCallback(async () => {
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
  }, [selectedModules]);

  // Copy URL to clipboard
  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

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

  return {
    // Module list
    modules,
    isListLoading,
    listError,
    fetchModules,
    comboboxItems,

    // Selected modules
    selectedModules,
    moduleToAdd,
    setModuleToAdd,
    handleAddModule,
    handleRemoveModule,
    handleToggleGroup,
    hasValidSelections,

    // Accordion
    openAccordions,
    setOpenAccordions,

    // Preview
    previewEvents,
    isPreviewLoading,
    previewError,
    timetableEntries,

    // ICS
    icsData,
    isGeneratingLink,
    linkError,
    handleGenerateLink,
    copiedUrl,
    handleCopyUrl,
  };
}
