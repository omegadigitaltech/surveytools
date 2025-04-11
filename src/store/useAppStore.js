import { create } from "zustand";

const useAppStore = create((set) => ({
  pointBalance: null,
  phoneNumber: null,
  selectedPlan: "",
  selectedPlanPrice: 0,
  providerIndex: 0,

  setPointBalance: (value) => set(() => ({ pointBalance: value })),
  setPhoneNumber: (value) => set(() => ({ phoneNumber: value })),
  setSelectedPlan: (value) => set(() => ({ selectedPlan: value })),
  setSelectedPlanPrice: (value) => set(() => ({ selectedPlanPrice: value })),
  setProviderIndex: (value) => set(() => ({ providerIndex: value })),
}));

export default useAppStore;
