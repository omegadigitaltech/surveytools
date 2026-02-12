import { create } from "zustand";

const useDashboardStore = create((set) => ({
  menuOpen: false,
  setMenuOpen: (value) => set(() => ({ menuOpen: value })),
}));

export default useDashboardStore;