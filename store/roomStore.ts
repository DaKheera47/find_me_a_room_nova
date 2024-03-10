import { create } from "zustand";
import { RoomData } from "@/types/roomData"; // Adjust the import path as necessary

type RoomStoreState = {
  data: RoomData | null;
  isLoading: boolean;
  setData: (data: RoomData) => void;
  setIsLoading: (isLoading: boolean) => void;
};

const useRoomStore = create<RoomStoreState>((set) => ({
  data: null, // initially, there's no data
  isLoading: false,
  setData: (data) => set({ data }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useRoomStore;
