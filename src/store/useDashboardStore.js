import { create } from "zustand";

const useDashboardStore = create((set) => ({
  menuOpen: null,
  setMenuOpen: (value) => set(() => ({ menuOpen: value })),
}));

export default useDashboardStore;