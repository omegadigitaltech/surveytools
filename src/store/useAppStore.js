import { create } from "zustand";

const useAppStore = create((set) => ({
  pointBalance: null,
  setPointBalance: (value) => set(() => ({ pointBalance: value })),
}));

export default useAppStore;
