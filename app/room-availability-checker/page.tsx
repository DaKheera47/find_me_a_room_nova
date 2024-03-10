"use client";

import { listOfRooms } from "@/content/listOfRooms";

import RoomSelector from "@/components/RoomSelector";
import CalendarForTimetable from "@/components/CalendarForTimetable";
import useRoomStore from "@/store/roomStore";

export default function IndexPage() {
  const { data } = useRoomStore();

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">
          UCLan Room Availability Checker
          <br className="block" />
          <span className="from mt-2 w-fit bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-xl font-extrabold text-transparent">
            Instantly find detailed information about a room
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-gray-700 dark:text-gray-300">
          Explore detailed information about each room on the University of
          Central Lancashire Preston campus. Perfect for finding a study space.
        </p>
      </div>

      <RoomSelector listOfRooms={listOfRooms} />
    </section>
  );
}
