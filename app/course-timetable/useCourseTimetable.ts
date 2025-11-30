"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  getCourses,
  getCourseDetails,
  getModuleGroups,
  getTimetablePreview,
  generateICSLink,
} from "@/lib/apiCalls";
import { cleanModuleName } from "@/lib/utils";
import { Course, CourseYear, CourseModule } from "@/types/course";
import {
  ModuleSelection,
  PreviewEvent,
  ICSLinkResponse,
} from "@/types/customTimetable";
import { TimetableEntry } from "@/types/timetableEntry";
import { ComboboxItem } from "@/components/SearchableCombobox";

export interface ModuleWithGroups {
  moduleCode: string;
  moduleName: string;
  moduleType: "compulsory" | "optional" | "other";
  availableGroups: string[];
  selectedGroups: string[];
  isLoadingGroups: boolean;
}

export interface CourseState {
  selectedCourse: Course | null;
  selectedYear: CourseYear | null;
  years: CourseYear[];
  isLoadingCourse: boolean;
}

export function useCourseTimetable() {
  // Course list state
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [courseType, setCourseType] = useState<
    "undergrad" | "postgrad" | undefined
  >(undefined);

  // Course selection state
  const [courseState, setCourseState] = useState<CourseState>({
    selectedCourse: null,
    selectedYear: null,
    years: [],
    isLoadingCourse: false,
  });

  // Selected modules with groups (for optional modules user chose)
  const [selectedOptionalModules, setSelectedOptionalModules] = useState<
    ModuleWithGroups[]
  >([]);

  // Compulsory modules with groups (auto-added based on year selection)
  const [compulsoryModules, setCompulsoryModules] = useState<
    ModuleWithGroups[]
  >([]);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  // Preview state
  const [previewEvents, setPreviewEvents] = useState<PreviewEvent[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // ICS link state
  const [icsData, setIcsData] = useState<ICSLinkResponse | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Current step in the flow
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Fetch courses list
  const fetchCourses = useCallback(async () => {
    setIsCoursesLoading(true);
    setCoursesError(null);

    try {
      const data = await getCourses(courseType);
      setCourses(data.courses);
    } catch (err) {
      console.error(err);
      setCoursesError("Failed to load courses. Please try again.");
    } finally {
      setIsCoursesLoading(false);
    }
  }, [courseType]);

  // Load courses on mount and when type changes
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Select a course and load its details
  const handleSelectCourse = useCallback(
    async (courseId: number) => {
      const course = courses.find((c) => c.id === courseId);
      if (!course) return;

      setCourseState((prev) => ({
        ...prev,
        selectedCourse: course,
        selectedYear: null,
        years: [],
        isLoadingCourse: true,
      }));

      // Reset downstream selections
      setSelectedOptionalModules([]);
      setCompulsoryModules([]);
      setOpenAccordions([]);
      setPreviewEvents([]);
      setIcsData(null);
      setCurrentStep(2);

      try {
        const details = await getCourseDetails(courseId);
        setCourseState((prev) => ({
          ...prev,
          years: details.years,
          isLoadingCourse: false,
        }));
      } catch (err) {
        console.error(err);
        setCourseState((prev) => ({
          ...prev,
          isLoadingCourse: false,
        }));
      }
    },
    [courses],
  );

  // Clear course selection
  const handleClearCourse = useCallback(() => {
    setCourseState({
      selectedCourse: null,
      selectedYear: null,
      years: [],
      isLoadingCourse: false,
    });
    setSelectedOptionalModules([]);
    setCompulsoryModules([]);
    setOpenAccordions([]);
    setPreviewEvents([]);
    setIcsData(null);
    setCurrentStep(1);
  }, []);

  // Select a year and load compulsory modules
  const handleSelectYear = useCallback(
    async (yearId: number) => {
      const year = courseState.years.find((y) => y.id === yearId);
      if (!year) return;

      setCourseState((prev) => ({
        ...prev,
        selectedYear: year,
      }));

      // Reset downstream
      setSelectedOptionalModules([]);
      setOpenAccordions([]);
      setPreviewEvents([]);
      setIcsData(null);
      setCurrentStep(3);

      // Auto-add all compulsory modules and start loading their groups
      const compulsoryToAdd: ModuleWithGroups[] = year.compulsoryModules.map(
        (m) => ({
          moduleCode: m.code,
          moduleName: m.name,
          moduleType: "compulsory" as const,
          availableGroups: [],
          selectedGroups: [],
          isLoadingGroups: true,
        }),
      );

      setCompulsoryModules(compulsoryToAdd);

      // Load groups for all compulsory modules
      for (const mod of compulsoryToAdd) {
        try {
          const groupsData = await getModuleGroups(mod.moduleCode);
          const groups = groupsData.groups;
          // Preselect groups containing "full_group"
          const preselectedGroups = groups.filter((g) =>
            g.toLowerCase().includes("full_group"),
          );

          setCompulsoryModules((prev) =>
            prev.map((m) =>
              m.moduleCode === mod.moduleCode
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
          setCompulsoryModules((prev) =>
            prev.map((m) =>
              m.moduleCode === mod.moduleCode
                ? { ...m, isLoadingGroups: false, availableGroups: [] }
                : m,
            ),
          );
        }
      }
    },
    [courseState.years],
  );

  // Clear year selection
  const handleClearYear = useCallback(() => {
    setCourseState((prev) => ({
      ...prev,
      selectedYear: null,
    }));
    setSelectedOptionalModules([]);
    setCompulsoryModules([]);
    setOpenAccordions([]);
    setPreviewEvents([]);
    setIcsData(null);
    setCurrentStep(2);
  }, []);

  // Add an optional module
  const handleAddOptionalModule = useCallback(
    async (moduleCode: string) => {
      if (!moduleCode) return;
      if (!courseState.selectedYear) return;

      // Check if already added
      if (selectedOptionalModules.some((m) => m.moduleCode === moduleCode)) {
        return;
      }

      const moduleInfo = courseState.selectedYear.optionalModules.find(
        (m) => m.code === moduleCode,
      );
      if (!moduleInfo) return;

      // Add to list with loading state
      const newModule: ModuleWithGroups = {
        moduleCode,
        moduleName: moduleInfo.name,
        moduleType: "optional",
        availableGroups: [],
        selectedGroups: [],
        isLoadingGroups: true,
      };

      setSelectedOptionalModules((prev) => [...prev, newModule]);
      setOpenAccordions((prev) => [...prev, moduleCode]);
      setCurrentStep(4);

      // Fetch groups for this module
      try {
        const groupsData = await getModuleGroups(moduleCode);
        const groups = groupsData.groups;
        // Preselect groups containing "full_group"
        const preselectedGroups = groups.filter((g) =>
          g.toLowerCase().includes("full_group"),
        );
        setSelectedOptionalModules((prev) =>
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
        setSelectedOptionalModules((prev) =>
          prev.map((m) =>
            m.moduleCode === moduleCode
              ? { ...m, isLoadingGroups: false, availableGroups: [] }
              : m,
          ),
        );
      }
    },
    [courseState.selectedYear, selectedOptionalModules],
  );

  // Remove an optional module
  const handleRemoveOptionalModule = useCallback((moduleCode: string) => {
    setSelectedOptionalModules((prev) =>
      prev.filter((m) => m.moduleCode !== moduleCode),
    );
    setOpenAccordions((prev) => prev.filter((code) => code !== moduleCode));
    setIcsData(null);
  }, []);

  // Toggle group selection for any module (compulsory or optional)
  const handleToggleGroup = useCallback(
    (moduleCode: string, group: string, isCompulsory: boolean) => {
      const updateFn = (modules: ModuleWithGroups[]) =>
        modules.map((m) => {
          if (m.moduleCode !== moduleCode) return m;
          const newSelected = m.selectedGroups.includes(group)
            ? m.selectedGroups.filter((g) => g !== group)
            : [...m.selectedGroups, group];
          return { ...m, selectedGroups: newSelected };
        });

      if (isCompulsory) {
        setCompulsoryModules(updateFn);
      } else {
        setSelectedOptionalModules(updateFn);
      }
      setIcsData(null);
    },
    [],
  );

  // All selected modules (compulsory + optional)
  const allSelectedModules = useMemo(
    () => [...compulsoryModules, ...selectedOptionalModules],
    [compulsoryModules, selectedOptionalModules],
  );

  // Create a serialized key for selections to detect changes
  const selectionsKey = useMemo(() => {
    return allSelectedModules
      .filter((m) => !m.isLoadingGroups)
      .map((m) => `${m.moduleCode}:${m.selectedGroups.sort().join(",")}`)
      .join("|");
  }, [allSelectedModules]);

  // Auto-fetch preview when selections change
  useEffect(() => {
    const fetchPreview = async () => {
      const selections: ModuleSelection[] = allSelectedModules
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
    const selections: ModuleSelection[] = allSelectedModules
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
  }, [allSelectedModules]);

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

  // Transform courses to combobox items
  const courseComboboxItems: ComboboxItem[] = useMemo(
    () =>
      courses.map((course) => ({
        value: course.id.toString(),
        label: course.title,
        sublabel:
          course.type === "undergrad" ? "Undergraduate" : "Postgraduate",
      })),
    [courses],
  );

  // Transform years to combobox items
  const yearComboboxItems: ComboboxItem[] = useMemo(
    () =>
      courseState.years.map((year) => ({
        value: year.id.toString(),
        label: year.label,
        sublabel: `${year.compulsoryModules.length} compulsory, ${year.optionalModules.length} optional`,
      })),
    [courseState.years],
  );

  // Transform optional modules to combobox items (excluding already selected)
  const optionalModuleComboboxItems: ComboboxItem[] = useMemo(() => {
    if (!courseState.selectedYear) return [];
    const selectedCodes = new Set(
      selectedOptionalModules.map((m) => m.moduleCode),
    );
    return courseState.selectedYear.optionalModules
      .filter((m) => !selectedCodes.has(m.code))
      .map((module) => ({
        value: module.code,
        label: module.code,
        sublabel: cleanModuleName(module.name),
      }));
  }, [courseState.selectedYear, selectedOptionalModules]);

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
  const hasValidSelections = allSelectedModules.some(
    (m) => m.selectedGroups.length > 0,
  );

  return {
    // Course list
    courses,
    isCoursesLoading,
    coursesError,
    fetchCourses,
    courseComboboxItems,
    courseType,
    setCourseType,

    // Course selection
    courseState,
    handleSelectCourse,
    handleClearCourse,
    yearComboboxItems,
    handleSelectYear,
    handleClearYear,

    // Current step
    currentStep,

    // Compulsory modules
    compulsoryModules,

    // Optional modules
    selectedOptionalModules,
    optionalModuleComboboxItems,
    handleAddOptionalModule,
    handleRemoveOptionalModule,

    // Group toggle
    handleToggleGroup,

    // All modules combined
    allSelectedModules,
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
