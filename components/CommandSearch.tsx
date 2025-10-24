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
import { getLecturers } from "@/lib/apiCalls";
import { formatLecturerName } from "@/lib/utils";
// import { listOfBuildings } from "@/content/listOfBuildings";

export default function CommandSearch() {
  const { open, setOpen, toggle } = useCommandBarStore();
  const router = useRouter();
  const [lecturers, setLecturers] = React.useState<string[]>([]);
  const [isLoadingLecturers, setIsLoadingLecturers] = React.useState(false);
  const [lecturersError, setLecturersError] = React.useState<string | null>(null);

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

  // const buildingNames = listOfBuildings.map(
  //   (building) => building.buildingName,
  // );

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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search for a building or room..." />

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* <CommandGroup heading="Buildings">
          {buildingNames.map((building) => (
            <CommandItem key={building}>{building}</CommandItem>
          ))}
        </CommandGroup> */}

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
                    router.push(`/lecturers/${encodeURIComponent(lecturer)}`);
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
                console.log("clicked on ", value);
                router.push(`/view-room-details?room=${value}`);
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
