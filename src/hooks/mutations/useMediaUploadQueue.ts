import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  uploadMedia,
  validateMediaFile,
  getMediaType,
  formatBytes,
  getImageDimensions,
  getVideoDuration,
  mediaConfig,
  type MediaConfig,
} from "@/lib/api/media";
import type { UploadedMedia, MediaValidationError } from "@/types/api";

export type UploadItemState = "queued" | "validating" | "uploading" | "processing" | "ready" | "error" | "cancelled";

export interface UploadItem {
  id: string;
  file: File;
  state: UploadItemState;
  preview: string; // object URL or data URL
  progress: number; // 0-100
  loaded: number; // bytes
  total: number; // bytes
  error?: string;
  result?: UploadedMedia;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
}

interface UploadQueueState {
  items: UploadItem[];
  activeUploads: Map<string, AbortController>;
  totalBytes: number;
}

type UploadAction =
  | { type: "ADD_ITEM"; item: UploadItem }
  | { type: "UPDATE_ITEM"; id: string; updates: Partial<UploadItem> }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "SET_PROGRESS"; id: string; progress: number; loaded: number; total: number }
  | { type: "SET_STATE"; id: string; state: UploadItemState }
  | { type: "SET_ERROR"; id: string; error: string }
  | { type: "SET_RESULT"; id: string; result: UploadedMedia }
  | { type: "SET_ACTIVE_UPLOAD"; id: string; controller: AbortController }
  | { type: "REMOVE_ACTIVE_UPLOAD"; id: string }
  | { type: "REORDER_ITEMS"; fromIndex: number; toIndex: number }
  | { type: "CLEAR_ALL" };

function uploadQueueReducer(
  state: UploadQueueState,
  action: UploadAction
): UploadQueueState {
  switch (action.type) {
    case "ADD_ITEM":
      return {
        ...state,
        items: [...state.items, action.item],
        totalBytes: state.totalBytes + action.item.file.size,
      };

    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, ...action.updates } : item
        ),
      };

    case "REMOVE_ITEM": {
      const item = state.items.find((i) => i.id === action.id);
      const controller = state.activeUploads.get(action.id);
      if (controller) {
        controller.abort();
        state.activeUploads.delete(action.id);
      }
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
        totalBytes: state.totalBytes - (item?.file.size || 0),
      };
    }

    case "SET_PROGRESS":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? {
                ...item,
                progress: action.progress,
                loaded: action.loaded,
                total: action.total,
              }
            : item
        ),
      };

    case "SET_STATE":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, state: action.state } : item
        ),
      };

    case "SET_ERROR":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, state: "error", error: action.error }
            : item
        ),
      };

    case "SET_RESULT":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, state: "ready", result: action.result }
            : item
        ),
      };

    case "SET_ACTIVE_UPLOAD":
      state.activeUploads.set(action.id, action.controller);
      return state;

    case "REMOVE_ACTIVE_UPLOAD":
      state.activeUploads.delete(action.id);
      return state;

    case "REORDER_ITEMS": {
      const items = [...state.items];
      const [removed] = items.splice(action.fromIndex, 1);
      items.splice(action.toIndex, 0, removed);
      return { ...state, items };
    }

    case "CLEAR_ALL":
      // Abort all active uploads
      state.activeUploads.forEach((controller) => controller.abort());
      state.activeUploads.clear();
      return {
        items: [],
        activeUploads: new Map(),
        totalBytes: 0,
      };

    default:
      return state;
  }
}

interface UseMediaUploadQueueOptions {
  maxConcurrent?: number;
  config?: Partial<MediaConfig>;
  onItemAdded?: (item: UploadItem) => void;
  onItemRemoved?: (id: string) => void;
  onItemComplete?: (item: UploadItem) => void;
  onItemError?: (id: string, error: string) => void;
}

export function useMediaUploadQueue(options: UseMediaUploadQueueOptions = {}) {
  const { maxConcurrent = 2, config = {}, onItemAdded, onItemRemoved, onItemComplete, onItemError } = options;
  const [state, dispatch] = useReducer(uploadQueueReducer, {
    items: [],
    activeUploads: new Map(),
    totalBytes: 0,
  });
  const uploadQueueRef = useRef<string[]>([]);

  /**
   * Process upload queue
   */
  useEffect(() => {
    const activeCount = state.activeUploads.size;
    const queuedItems = state.items.filter((i) => i.state === "queued");

    if (activeCount < maxConcurrent && queuedItems.length > 0) {
      const item = queuedItems[0];
      processUpload(item.id);
    }
  }, [state.items, state.activeUploads.size]);

  /**
   * Add files to queue
   */
  const addFiles = useCallback(
    async (files: File[]) => {
      let totalSize = state.totalBytes;

      for (const file of files) {
        // Validate
        const validation = validateMediaFile(file, config);
        if (!validation.valid) {
          onItemError?.(file.name, validation.error || "Unknown error");
          continue;
        }

        // Check total size
        totalSize += file.size;
        if (totalSize > mediaConfig.maxTotalSize) {
          onItemError?.(file.name, `Total upload size exceeded`);
          break;
        }

        // Create preview
        const preview = URL.createObjectURL(file);
        const id = `${Date.now()}_${Math.random()}`;

        const item: UploadItem = {
          id,
          file,
          state: "validating",
          preview,
          progress: 0,
          loaded: 0,
          total: file.size,
        };

        dispatch({ type: "ADD_ITEM", item });
        onItemAdded?.(item);

        // Get metadata
        try {
          if (file.type.startsWith("image/")) {
            const dims = await getImageDimensions(file);
            dispatch({
              type: "UPDATE_ITEM",
              id,
              updates: { metadata: dims },
            });
          } else if (file.type.startsWith("video/")) {
            const duration = await getVideoDuration(file);
            dispatch({
              type: "UPDATE_ITEM",
              id,
              updates: { metadata: { duration } },
            });
          }
        } catch (err) {
          console.warn(`Failed to extract metadata for ${file.name}:`, err);
        }

        dispatch({ type: "SET_STATE", id, state: "queued" });
      }
    },
    [state.totalBytes, config, onItemAdded, onItemError]
  );

  /**
   * Process a single upload with retries
   */
  const processUpload = useCallback(
    async (itemId: string) => {
      const item = state.items.find((i) => i.id === itemId);
      if (!item) return;

      const controller = new AbortController();
      dispatch({ type: "SET_ACTIVE_UPLOAD", id: itemId, controller });
      dispatch({ type: "SET_STATE", id: itemId, state: "uploading" });

      let retries = 0;
      const maxRetries = 3;

      const attemptUpload = async (): Promise<void> => {
        try {
          const result = await uploadMedia(item.file, itemId, {
            signal: controller.signal,
            onProgress: (progress) => {
              dispatch({
                type: "SET_PROGRESS",
                id: itemId,
                progress: progress.progress,
                loaded: progress.loaded,
                total: progress.total,
              });
            },
          });

          dispatch({ type: "SET_STATE", id: itemId, state: "processing" });
          dispatch({ type: "SET_RESULT", id: itemId, result });
          onItemComplete?.(item);
        } catch (err) {
          const error = err instanceof Error ? err.message : "Upload failed";

          // Retry logic: exponential backoff for 5xx/network
          if (retries < maxRetries && (error.includes("server") || error.includes("Network"))) {
            retries++;
            const delay = Math.pow(2, retries - 1) * 1000; // 1s, 2s, 4s
            await new Promise((resolve) => setTimeout(resolve, delay));
            await attemptUpload();
          } else {
            dispatch({ type: "SET_ERROR", id: itemId, error });
            onItemError?.(itemId, error);
          }
        } finally {
          dispatch({ type: "REMOVE_ACTIVE_UPLOAD", id: itemId });
        }
      };

      await attemptUpload();
    },
    [state.items, onItemComplete, onItemError]
  );

  /**
   * Remove item from queue
   */
  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", id });
    onItemRemoved?.(id);
  }, [onItemRemoved]);

  /**
   * Retry failed item
   */
  const retryItem = useCallback((id: string) => {
    dispatch({ type: "SET_STATE", id, state: "queued" });
    dispatch({ type: "SET_ERROR", id, error: undefined } as any);
  }, []);

  /**
   * Reorder items
   */
  const reorderItems = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: "REORDER_ITEMS", fromIndex, toIndex });
  }, []);

  /**
   * Cancel all uploads
   */
  const cancelAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  /**
   * Check if any item is processing
   */
  const isProcessing = state.items.some((item) =>
    ["queued", "validating", "uploading", "processing"].includes(item.state)
  );

  /**
   * Get ready media
   */
  const getReadyMedia = useCallback(() => {
    return state.items
      .filter((item) => item.state === "ready" && item.result)
      .map((item) => item.result!);
  }, [state.items]);

  return {
    items: state.items,
    isProcessing,
    addFiles,
    removeItem,
    retryItem,
    reorderItems,
    cancelAll,
    getReadyMedia,
  };
}
