"use client";

import BuildingSelector from "@/components/BuildingSelector";
import { listOfBuildings } from "@/content/listOfBuildings";
import useRoomStore from "@/store/roomStore";

export default function IndexPage() {
  const { data } = useRoomStore();

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">
          UCLan Free Room Finder
          <br className="block" />
          <span className="from mt-2 w-fit bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-xl font-extrabold text-transparent">
            Instantly find available rooms across the UCLan Preston campus
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-gray-700 dark:text-gray-300">
          Check the current availability of rooms across the University of
          Central Lancashire Preston campus. Ideal for finding a quick study
          space or meeting room.
        </p>
      </div>

      <BuildingSelector listOfBuildings={listOfBuildings} />
    </section>
  );
}
