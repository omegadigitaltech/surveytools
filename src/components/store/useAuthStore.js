import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      authToken: '',
      isAuthenticated: false,
      userEmail: '',
      userName: '',
      Department: '',
      currentSurveyId: '',
      signupEmail: '',
      // Action to set authentication data after successful login
      setAuthData: (token, email, name, department) => {
        set({ authToken: token, isAuthenticated: true, userEmail: email, userName: name, Department: department, });
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


