"use client";

import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  Dispatch,
  useMemo,
} from "react";

// Toast types
type ToastType = "success" | "error" | "info";

// Toast structure
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// State structure
type State = {
  toasts: Toast[];
};

// Reducer actions
type Action =
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: string };

// Initial state
const initialState: State = {
  toasts: [],
};

// Reducer function
function toastReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.payload] };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
}

// Context shape
interface ToastContextProps {
  state: State;
  dispatch: Dispatch<Action>;
}

// Create context
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// ToastProvider component
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

// ID generator
export const generateId = (): string =>
  Math.random().toString(36).substr(2, 9);

// Custom hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return (message: string, type: ToastType = "info") => {
    const id = generateId();
    context.dispatch({ type: "ADD_TOAST", payload: { id, message, type } });
    setTimeout(() => {
      context.dispatch({ type: "REMOVE_TOAST", payload: id });
    }, 5000);
  };
};

// Toaster component
export const Toaster = () => {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { state, dispatch } = context;

  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 p-4 max-w-xs w-full">
      {state.toasts.map((toast) => {
        const bgColor =
          toast.type === "success"
            ? "bg-green-500"
            : toast.type === "error"
            ? "bg-red-500"
            : "bg-blue-500";

        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-lg text-white transition-all duration-300 transform ${bgColor}`}
          >
            <p className="flex-1">{toast.message}</p>
            <button
              onClick={() =>
                dispatch({ type: "REMOVE_TOAST", payload: toast.id })
              }
              className="ml-4 text-white hover:text-gray-200 transition-colors"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
};
