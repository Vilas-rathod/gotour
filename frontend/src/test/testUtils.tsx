import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import { baseApi } from '@/app/api/baseApi';
import { authReducer, credentialsReceived } from '@/features/auth/authSlice';
import { uiReducer } from '@/features/ui/uiSlice';
import type { AuthResponse } from '@/types/api';

/**
 * Builds a fresh store per test so cached RTK Query data never leaks between
 * them. State is seeded by dispatching real actions rather than by
 * `preloadedState`, which keeps the reducer types identical to the app store.
 */
export function makeTestStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export type TestStore = ReturnType<typeof makeTestStore>;

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Seeds an authenticated session before the tree renders. */
  session?: AuthResponse;
  route?: string;
  store?: TestStore;
}

export function renderWithProviders(
  ui: ReactElement,
  { session, route = '/', store = makeTestStore(), ...renderOptions }: RenderWithProvidersOptions = {},
) {
  if (session) store.dispatch(credentialsReceived(session));

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
