import { createSlice } from '@reduxjs/toolkit';

const saved = JSON.parse(localStorage.getItem('interview_ai_auth') || 'null');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: saved?.user || null,
    accessToken: saved?.accessToken || null
  },
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('interview_ai_auth', JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('interview_ai_auth');
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
