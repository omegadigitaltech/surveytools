import { create } from "zustand";

const useDashboardStore = create((set) => ({
  menuOpen: false,
  setMenuOpen: (value) => set(() => ({ menuOpen: value })),

  spinOpen: false,
  setSpinOpen: (value) => set(() => ({ spinOpen: value })),

  // Bumped after anything that changes gamification stats (e.g. a spin) so the
  // dashboard re-fetches them
  statsVersion: 0,
  bumpStatsVersion: () => set((s) => ({ statsVersion: s.statsVersion + 1 })),
}));

export default useDashboardStore;