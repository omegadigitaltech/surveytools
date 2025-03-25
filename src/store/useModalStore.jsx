import { create } from "zustand";

const useModalStore = create((set) => ({
  confirmModalOpen: false,
  redeemModalOpen: false,
  reportModalOpen: false,
  balance: 100,
  setConfirmModalOpen: (value) => set(() => ({ confirmModalOpen: value })),
  setRedeemModalOpen: (value) => set(() => ({ redeemModalOpen: value })),
  setReportModalOpen: (value) => set(() => ({ reportModalOpen: value })),
  setBalance: (value) => set(() => ({ balance: value })),

}));

export default useModalStore;