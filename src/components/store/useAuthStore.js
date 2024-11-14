import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      authToken: '',
      isAuthenticated: false,
      userEmail: '',
      userName: '',

      // Action to set authentication data after successful login
      setAuthData: (token, email, name) => {
        set({ authToken: token, isAuthenticated: true, userEmail: email, userName: name });
      },

      // Action to clear user data on logout
      logout: () => {
        set({ authToken: '', isAuthenticated: false, userEmail: '', userName: '' });
      }
    }),
    {
      name: 'auth-storage', 
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;


