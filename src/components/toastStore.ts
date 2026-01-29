import { useSyncExternalStore } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

let toasts: ToastItem[] = [];
let nextToastId = 1;
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const removeTimer = (id: number) => {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
};

export const dismissToast = (id: number) => {
  removeTimer(id);
  const updated = toasts.filter((toast) => toast.id !== id);
  if (updated.length === toasts.length) {
    return;
  }
  toasts = updated;
  emit();
};

const scheduleDismiss = (id: number, duration: number) => {
  removeTimer(id);
  const timeoutId = setTimeout(() => dismissToast(id), duration);
  timers.set(id, timeoutId);
};

const createToast = (message: string, variant: ToastVariant, duration: number) => {
  const id = nextToastId++;
  const toast = { id, message, variant };
  toasts = [...toasts, toast];
  emit();
  scheduleDismiss(id, duration);
  return id;
};

export const showToast = (message: string, variant: ToastVariant = "info", duration = 4000) => {
  return createToast(message, variant, duration);
};

export const toast = {
  success: (message: string, duration?: number) => createToast(message, "success", duration ?? 4000),
  error: (message: string, duration?: number) => createToast(message, "error", duration ?? 4000),
  info: (message: string, duration?: number) => createToast(message, "info", duration ?? 4000),
};

export const useToasts = () => {
  return useSyncExternalStore(subscribe, () => toasts, () => toasts);
};
