"use client"; // ← Provider must be a client component

// ============================================================
// context/ReduxProvider.tsx  ← REDUX PROVIDER
// This wraps the entire app and makes the Redux store
// accessible to every component via useSelector & useDispatch.
// Without this, components couldn't access the store.
// ============================================================

import { Provider } from "react-redux";
import { store } from "@/store/store";

// Props: just children (the app content wrapped inside)
interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    // <Provider store={store}> makes store available everywhere below
    <Provider store={store}>{children}</Provider>
  );
}
