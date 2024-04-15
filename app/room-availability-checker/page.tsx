import { listOfRooms } from "@/content/listOfRooms";

import RoomSelector from "@/components/RoomSelector";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Room Availability Checker",
};

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-bold md:text-4xl">
          UCLan Room Availability Checker
        </h1>
        <span className="w-fit bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text  text-xl font-bold text-transparent">
          Instantly find detailed information about a room
        </span>

        <p className="mt-4 max-w-2xl text-gray-700 dark:text-gray-300">
          Explore detailed information about each room on the University of
          Central Lancashire Preston campus. Perfect for finding a study space.
        </p>
      </div>

      <RoomSelector listOfRooms={listOfRooms} />
    </section>
  );
}
