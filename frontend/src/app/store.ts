import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import { authReducer, sessionExpired } from '@/features/auth/authSlice';
import { uiReducer } from '@/features/ui/uiSlice';
import { registerSessionExpiredHandler } from '@/lib/http';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

// Lets the axios layer end the Redux session when a token refresh fails.
registerSessionExpiredHandler(() => {
  store.dispatch(sessionExpired());
  store.dispatch(baseApi.util.resetApiState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
