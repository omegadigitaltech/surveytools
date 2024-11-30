import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      authToken: '',
      isAuthenticated: false,
      userEmail: '',
      userName: '',
      userInst: '',
      currentSurveyId: '',
      signupEmail: '',
      isLogoutVisible: false,

      // Action to set authentication data after successful login
      setAuthData: (token, email, name, inst) => {
        set({ authToken: token, isAuthenticated: true, userEmail: email, userName: name, userInst: inst, });
      },

      setSignupEmail: (email) => {
        set({ signupEmail: email })
      },

      setSurveyId: (surveyId) => {
        set({ currentSurveyId: surveyId });
      },

       // Actions for logout confirmation
       showLogoutConfirmation: () => set({ isLogoutVisible: true }),
       hideLogoutConfirmation: () => set({ isLogoutVisible: false }),
     
       // Action to clear user data on logout
      logout: () => {
        set({ authToken: '', isAuthenticated: false, userEmail: '', userName: '', currentSurveyId: '' });
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;


