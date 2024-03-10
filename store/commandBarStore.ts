// store.ts
import { create } from "zustand";

type State = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

export const useCommandBarStore = create<State>((set) => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
