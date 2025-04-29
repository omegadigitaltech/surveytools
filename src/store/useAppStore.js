import { create } from "zustand";

const useAppStore = create((set) => ({
  pointBalance: null,
  phoneNumber: null,
  selectedPlan: "",
  selectedPlanPrice: 0,
  providerIndex: 0,
  airtimeAmount: 0,
  contestModalOpen: true,

  setPointBalance: (value) => set(() => ({ pointBalance: value })),
  setPhoneNumber: (value) => set(() => ({ phoneNumber: value })),
  setSelectedPlan: (value) => set(() => ({ selectedPlan: value })),
  setSelectedPlanPrice: (value) => set(() => ({ selectedPlanPrice: value })),
  setProviderIndex: (value) => set(() => ({ providerIndex: value })),
  setAirtimeAmount: (amount) => set({ airtimeAmount: amount }),
  setContestModalOpen: (amount) => set({ contestModalOpen: amount }),
}));

export default useAppStore;
