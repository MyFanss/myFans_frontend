import { toast } from "sonner";

type ToastOptions = Parameters<typeof toast>[1];

/** Standard success toast. */
export function showSuccess(message: string, options?: ToastOptions) {
  return toast.success(message, options);
}

/** Standard error toast. */
export function showError(message: string, options?: ToastOptions) {
  return toast.error(message, options);
}

/** Standard info toast. */
export function showInfo(message: string, options?: ToastOptions) {
  return toast.info(message, options);
}
