import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      authToken: "",
      isAuthenticated: false,
      userEmail: "",
      userName: "",
      userId: "",
      userInst: "",
      currentSurveyId: "",
      currentFormId: "",
      signupEmail: "",
      isLogoutVisible: false,
      surveys: [],
      notifications: [],
      hasPaid: false,
      // Form draft data (stored before final submission)
      formDraft: {
        title: "",
        description: "",
        sections: [], // Changed from fields to sections
        config: {
          time: "10 minutes",
          point: "100",
          totalRequiredParticipants: "50",
          preferredParticipants: "20",
          totalParticipants: "75",
        },
        backgroundColor: "#ffffff",
        fontFamily: "Arial",
        shares: {
          type: "public",
          emails: [],
          userIds: [],
        },
      },

      // Action to set authentication data after successful login
      setAuthData: (token, email, name, inst, userId) => {
        set({
          authToken: token,
          isAuthenticated: true,
          userEmail: email,
          userName: name,
          userInst: inst,
          userId: userId,
        });
      },

      setSignupEmail: (email) => {
        set({ signupEmail: email });
      },

      setSurveyId: (surveyId) => {
        set({ currentSurveyId: surveyId });
      },
      setFormId: (formId) => {
        set({ currentFormId: formId });
      },
      setFormDraft: (draftData) => {
        set((state) => ({
          formDraft: { ...state.formDraft, ...draftData },
        }));
      },
      clearFormDraft: () => {
        set({
          formDraft: {
            title: "",
            description: "",
            sections: [], // Changed from fields to sections
            config: {
              time: "10 minutes",
              point: "100",
              totalRequiredParticipants: "50",
              preferredParticipants: "20",
              totalParticipants: "75",
            },
            backgroundColor: "#ffffff",
            fontFamily: "Arial",
            shares: {
              type: "public",
              emails: [],
              userIds: [],
            },
          },
        });
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
        set({ hasPaid: haspaid });
      },
      // Action to clear user data on logout
      logout: () => {
        set({
          authToken: "",
          isAuthenticated: false,
          userEmail: "",
          userName: "",
          userId: "",
          currentSurveyId: "",
          currentFormId: "",
          formDraft: {
            title: "",
            description: "",
            sections: [], // Changed from fields to sections
            config: {
              time: "10 minutes",
              point: "100",
              totalRequiredParticipants: "50",
              preferredParticipants: "20",
              totalParticipants: "75",
            },
            backgroundColor: "#ffffff",
            fontFamily: "Arial",
            shares: {
              type: "public",
              emails: [],
              userIds: [],
            },
          },
        });
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
      // Only store the essential authentication data in localStorage
      partialize: (state) => ({
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
        userEmail: state.userEmail,
        userName: state.userName,
        userId: state.userId,
        userInst: state.userInst,
      }),
    }
  )
);

export default useAuthStore;
