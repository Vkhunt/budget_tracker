// ============================================================
// hooks/useAppSelector.ts  ← TYPED SELECTOR HOOK
// This is a typed wrapper around useSelector from react-redux.
// It gives TypeScript full knowledge of the state shape.
// ============================================================

import { useSelector, TypedUseSelectorHook } from "react-redux";
import { RootState } from "@/store/store";

// TypedUseSelectorHook<RootState> gives you auto-complete
// when selecting state in components.
//
// Usage in a component:
// const expenses = useAppSelector((state) => state.expenses.items);
//                                                ↑ TypeScript knows this shape!
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
