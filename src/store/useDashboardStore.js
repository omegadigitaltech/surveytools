import { create } from "zustand";

const useDashboardStore = create((set) => ({
  menuOpen: false,
  setMenuOpen: (value) => set(() => ({ menuOpen: value })),

  spinOpen: false,
  setSpinOpen: (value) => set(() => ({ spinOpen: value })),
}));

export default useDashboardStore;