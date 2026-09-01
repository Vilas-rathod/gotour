import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'gotour-theme';

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info';
}

export interface UiState {
  theme: Theme;
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  toasts: ToastMessage[];
}

const initialState: UiState = {
  theme: readInitialTheme(),
  mobileMenuOpen: false,
  searchOpen: false,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    themeToggled(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(state.theme);
    },
    themeSet(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      applyTheme(state.theme);
    },
    mobileMenuToggled(state, action: PayloadAction<boolean | undefined>) {
      state.mobileMenuOpen = action.payload ?? !state.mobileMenuOpen;
    },
    searchToggled(state, action: PayloadAction<boolean | undefined>) {
      state.searchOpen = action.payload ?? !state.searchOpen;
    },
    toastPushed: {
      reducer(state, action: PayloadAction<ToastMessage>) {
        // Cap the stack so a burst of failures cannot cover the viewport.
        state.toasts = [...state.toasts.slice(-2), action.payload];
      },
      prepare(toast: Omit<ToastMessage, 'id'>) {
        return { payload: { ...toast, id: crypto.randomUUID() } };
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const {
  themeToggled,
  themeSet,
  mobileMenuToggled,
  searchToggled,
  toastPushed,
  toastDismissed,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
