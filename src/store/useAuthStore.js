import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useKycStore from './useKycStore';

const useAuthStore = create(
  persist(
    (set) => ({
      authToken: '',
      isAuthenticated: false,
      userEmail: '',
      userName: '',
      userInst: '',
      userType: '',
      // "standard" | "premium" | "institutional"; empty until the tier endpoint
      // resolves it. Researchers only.
      researcherTier: '',
      // Accounts from before account types may be respondents who already
      // posted surveys. null = not checked yet. Kept in memory only.
      ownsSurveys: null,
      // From the login response; true until the phone OTP is verified
      requiresPhoneVerification: false,
      currentSurveyId: '',
      signupEmail: '',
      isLogoutVisible: false,
      surveys: [],
      notifications: [],
      hasPaid: false,

      // Action to set authentication data after successful login
      setAuthData: ({ token, email, name, userType, requiresPhoneVerification }) => {
        // Legacy pages still read the token from localStorage directly
        localStorage.setItem('token', token);
        set({
          authToken: token,
          isAuthenticated: true,
          userEmail: email,
          userName: name,
          userType,
          researcherTier: '',
          ownsSurveys: null,
          requiresPhoneVerification,
        });
      },

      setRequiresPhoneVerification: (value) => set({ requiresPhoneVerification: value }),

      setResearcherTier: (tier) => set({ researcherTier: tier || '' }),

      setOwnsSurveys: (value) => set({ ownsSurveys: value }),

      setSignupEmail: (email) => {
        set({ signupEmail: email })
      },

      setSurveyId: (surveyId) => {
        set({ currentSurveyId: surveyId });
      },
      setSurveys: (fetchedSurveys) => {
        set({ surveys: fetchedSurveys });
      },
      setNotifications: (fetchedNotifications) => {
        set({ notifications: fetchedNotifications });
      },
      // Actions for logout confirmation
      showLogoutConfirmation: () => set({ isLogoutVisible: true }),
      hideLogoutConfirmation: () => set({ isLogoutVisible: false }),
     // check payment status
     setHasPaid: (haspaid) => {
      set({ hasPaid: haspaid})
     },
      // Action to clear user data on logout
      logout: () => {
        localStorage.removeItem('token');
        useKycStore.getState().resetLayer1();
        set({
          authToken: '',
          isAuthenticated: false,
          userEmail: '',
          userName: '',
          userInst: '',
          userType: '',
          researcherTier: '',
          ownsSurveys: null,
          requiresPhoneVerification: false,
          currentSurveyId: '',
        });
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      // Only store the essential authentication data in localStorage
      partialize: (state) => ({ 
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
        userEmail: state.userEmail,
        userName: state.userName,
        userInst: state.userInst,
        userType: state.userType,
        researcherTier: state.researcherTier,
        requiresPhoneVerification: state.requiresPhoneVerification
      })
    }
  )
);

export default useAuthStore;


