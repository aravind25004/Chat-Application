import { create } from "zustand";

export const useOptionsStore = create((set) => ({
  opened: "",
  setOpened: (val) => set({ opened: val }),
}));
