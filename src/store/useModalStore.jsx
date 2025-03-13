import { create } from "zustand";

const useModalStore = create((set) => ({
  confirmModalOpen: false,
  redeemModalOpen: false,
  setConfirmModalOpen: (value) => set(() => ({ confirmModalOpen: value })),
  setRedeemModalOpen: (value) => set(() => ({ redeemModalOpen: value })),
}));

export default useModalStore;