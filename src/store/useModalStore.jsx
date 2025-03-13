import { create } from "zustand";

const useModalStore = create((set) => ({
  confirmModalOpen: false,
  redeemModalOpen: false,
  reportModalOpen: false,
  setConfirmModalOpen: (value) => set(() => ({ confirmModalOpen: value })),
  setRedeemModalOpen: (value) => set(() => ({ redeemModalOpen: value })),
  setReportModalOpen: (value) => set(() => ({ reportModalOpen: value })),
}));

export default useModalStore;