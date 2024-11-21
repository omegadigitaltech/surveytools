import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      authToken: '',
      isAuthenticated: false,
      userEmail: '',
      userName: '',
      currentSurveyId: '',
      signupEmail: '',
      // Action to set authentication data after successful login
      setAuthData: (token, email, name) => {
        set({ authToken: token, isAuthenticated: true, userEmail: email, userName: name });
      },

      setSignupEmail: (email) => {
        set({ signupEmail: email })
      },

      setSurveyId: (surveyId) => {
        set({ currentSurveyId: surveyId });
      },
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


