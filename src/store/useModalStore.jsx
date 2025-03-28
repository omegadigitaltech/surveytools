import { create } from "zustand";

const useModalStore = create((set) => ({
  confirmModalOpen: false,
  redeemModalOpen: false,
  reportModalOpen: false,
  openModalAnimate: false,
  balance: 100,
  setConfirmModalOpen: (value) => set(() => ({ confirmModalOpen: value })),
  setRedeemModalOpen: (value) => set(() => ({ redeemModalOpen: value })),
  setReportModalOpen: (value) => set(() => ({ reportModalOpen: value })),
  setBalance: (value) => set(() => ({ balance: value })),
  setOpenModalAnimate: (value) => set(() => ({ openModalAnimate: value })),

}));

export default useModalStore;