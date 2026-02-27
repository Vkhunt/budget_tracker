// ============================================================
// hooks/useAppDispatch.ts  ← TYPED DISPATCH HOOK
// This is a thin wrapper around useDispatch from react-redux.
// Using this instead of plain useDispatch gives you TypeScript
// autocomplete and error checking for all your actions.
// ============================================================

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

// Usage in a component:
// const dispatch = useAppDispatch();
// dispatch(addExpense({ ... }));  ← TypeScript knows the payload type!
export const useAppDispatch = () => useDispatch<AppDispatch>();
