import { create } from 'zustand';

// Layer 1 is collected over three screens (personal info, academic profile,
// review) and submitted once. The draft lives in memory only: KYC data is
// never written to localStorage, so a page refresh restarts the form.
const emptyLayer1 = {
  gender: '',
  dateOfBirth: '', // "YYYY-MM-DD" from <input type="date">
  stateOfOrigin: '',
  stateOfResidence: '',
  lgaOfResidence: '',
  academicStatus: '',
  institution: '',
  faculty: '',
  department: '',
  levelOfStudy: '',
};

const useKycStore = create((set) => ({
  layer1: emptyLayer1,
  updateLayer1: (patch) => set((state) => ({ layer1: { ...state.layer1, ...patch } })),
  resetLayer1: () => set({ layer1: emptyLayer1 }),
}));

export default useKycStore;
