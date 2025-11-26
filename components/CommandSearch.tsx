"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

import { listOfRooms } from "@/content/listOfRooms";
import { useRouter } from "next/navigation";
import { useCommandBarStore } from "@/store/commandBarStore";
import { getLecturers, getModules } from "@/lib/apiCalls";
import { formatLecturerName, cleanModuleName } from "@/lib/utils";
import { listOfBuildings } from "@/content/listOfBuildings";
import { ModuleInfo } from "@/types/module";

export default function CommandSearch() {
  const { open, setOpen, toggle } = useCommandBarStore();
  const router = useRouter();

  // Lecturers state
  const [lecturers, setLecturers] = React.useState<string[]>([]);
  const [isLoadingLecturers, setIsLoadingLecturers] = React.useState(false);
  const [lecturersError, setLecturersError] = React.useState<string | null>(
    null
  );

  // Modules state
  const [modules, setModules] = React.useState<ModuleInfo[]>([]);
  const [isLoadingModules, setIsLoadingModules] = React.useState(false);
  const [modulesError, setModulesError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();

        toggle();
      }
    };

    document.addEventListener("keydown", down);

    return () => document.removeEventListener("keydown", down);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildingData = listOfBuildings.map((building) => ({
    name: building.buildingName,
    code: building.buildingCode,
  }));

  // Fetch lecturers
  React.useEffect(() => {
    const fetchLecturers = async () => {
      setIsLoadingLecturers(true);
      setLecturersError(null);

      try {
        const data = await getLecturers();
        setLecturers(data.lecturers);
      } catch (error) {
        console.error("Failed to load lecturers for command search", error);
        setLecturersError("Unable to load lecturers.");
      } finally {
        setIsLoadingLecturers(false);
      }
    };

    fetchLecturers();
  }, []);

  // Fetch modules
  React.useEffect(() => {
    const fetchModules = async () => {
      setIsLoadingModules(true);
      setModulesError(null);

      try {
        const data = await getModules();
        setModules(data.modules);
      } catch (error) {
        console.error("Failed to load modules for command search", error);
        setModulesError("Unable to load modules.");
      } finally {
        setIsLoadingModules(false);
      }
    };

    fetchModules();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search buildings, rooms, lecturers, modules..." />

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Buildings">
          {buildingData.map((building) => (
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push(
                  `/buildings?building=${encodeURIComponent(building.code)}`
                );
              }}
              key={building.code}
            >
              {building.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Modules">
          {isLoadingModules && (
            <CommandItem disabled key="loading-modules">
              Loading modules...
            </CommandItem>
          )}

          {modulesError && !isLoadingModules && (
            <CommandItem disabled key="error-modules">
              {modulesError}
            </CommandItem>
          )}

          {!isLoadingModules &&
            !modulesError &&
            modules.map((module) => {
              const displayName = `${module.code} - ${cleanModuleName(module.name)}`;
              return (
                <CommandItem
                  key={module.code}
                  value={displayName}
                  onSelect={() => {
                    setOpen(false);
                    router.push(
                      `/modules?code=${encodeURIComponent(module.code)}`
                    );
                  }}
                >
                  {displayName}
                </CommandItem>
              );
            })}
        </CommandGroup>

        <CommandGroup heading="Lecturers">
          {isLoadingLecturers && (
            <CommandItem disabled key="loading-lecturers">
              Loading lecturers...
            </CommandItem>
          )}

          {lecturersError && !isLoadingLecturers && (
            <CommandItem disabled key="error-lecturers">
              {lecturersError}
            </CommandItem>
          )}

          {!isLoadingLecturers &&
            !lecturersError &&
            lecturers.map((lecturer) => {
              const displayName = formatLecturerName(lecturer) || lecturer;
              return (
                <CommandItem
                  key={lecturer}
                  value={displayName}
                  onSelect={() => {
                    setOpen(false);
                    router.push(
                      `/lecturers?name=${encodeURIComponent(displayName)}`
                    );
                  }}
                >
                  {displayName}
                </CommandItem>
              );
            })}
        </CommandGroup>

        <CommandGroup heading="Rooms">
          {listOfRooms.map((room) => (
            <CommandItem
              onSelect={(value) => {
                setOpen(false);
                router.push(`/rooms?room=${value}`);
              }}
              key={room}
            >
              {room}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
