"use client";

import { useToasts, dismissToast } from "@/components/toastStore";

export function ToastTray() {
  const toasts = useToasts();

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className={`toast toast-${item.variant}`}>
          <span>{item.message}</span>
          <button
            className="toast-close"
            type="button"
            aria-label="Dismiss notification"
            onClick={() => dismissToast(item.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
