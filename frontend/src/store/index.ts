import { configureStore } from '@reduxjs/toolkit';
import { wbApi } from '@/api/wbApi';
import { authSlice } from '@/store/authSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [wbApi.reducerPath]: wbApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(wbApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
