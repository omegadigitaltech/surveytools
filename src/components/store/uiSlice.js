import { createSlice } from "@reduxjs/toolkit";

const initialUIState = {
  authToken: "",
  isAuthenticated: false,
  isLoading: false,
  userEmail: "",
  userName: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState: initialUIState,
  reducers: {
    setAuthToken(state, action) {
      state.authToken = action.payload;
    },
    setIsAuthenticated(state, action) {
      state.isAuthenticated = action.payload;
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setUserEmail(state, action) {
      state.userEmail = action.payload;
    },
    setUserName(state, action) {
      state.userName = action.payload;
    },
  },
});

export const uiSliceAction = uiSlice.actions;
export default uiSlice;
