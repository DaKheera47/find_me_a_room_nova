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
// import { listOfBuildings } from "@/content/listOfBuildings";

export default function CommandSearch() {
  const { open, setOpen, toggle } = useCommandBarStore();
  const router = useRouter();

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
