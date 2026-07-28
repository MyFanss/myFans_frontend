import type { UploadedMedia, UploadProgress } from "@/types/api";

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}

export interface MediaConfig {
  maxFileSize: number; // bytes
  maxTotalSize: number; // bytes
  maxConcurrent: number;
  allowedTypes: string[]; // MIME types
  allowedExtensions: string[];
  maxImageDimensions: { width: number; height: number };
}

const DEFAULT_CONFIG: MediaConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxTotalSize: 200 * 1024 * 1024, // 200MB
  maxConcurrent: 2,
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/wav",
  ],
  allowedExtensions: [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".mp4",
    ".webm",
    ".mp3",
    ".wav",
  ],
  maxImageDimensions: { width: 4000, height: 4000 },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Upload a single media file with progress tracking
 */
export async function uploadMedia(
  file: File,
  itemId: string,
  options: UploadOptions = {},
  config: Partial<MediaConfig> = {}
): Promise<UploadedMedia> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { onProgress, signal } = options;

  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress tracking
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress?.({
          itemId,
          loaded: event.loaded,
          total: event.total,
          progress,
        });
      }
    });

    // Abort handling
    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
      });
    }

    // Error/completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText) as UploadedMedia;
          resolve(response);
        } catch (err) {
          reject(new Error("Invalid upload response"));
        }
      } else if (xhr.status >= 400 && xhr.status < 500) {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      } else {
        reject(new Error("Upload failed: server error"));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    xhr.open("POST", `${API_URL}/media/upload`);

    // Add auth token if available
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
    } catch {
      // localStorage not available in some contexts
    }

    xhr.send(formData);
  });
}

/**
 * Validate file before upload
 */
export function validateMediaFile(
  file: File,
  config: Partial<MediaConfig> = {}
): { valid: boolean; error?: string } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Check file size
  if (file.size > finalConfig.maxFileSize) {
    return {
      valid: false,
      error: `File too large (${formatBytes(file.size)} > ${formatBytes(finalConfig.maxFileSize)})`,
    };
  }

  // Check MIME type
  if (!finalConfig.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed (${file.type})`,
    };
  }

  // Check extension against MIME (basic spoof detection)
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!finalConfig.allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File extension not allowed (${ext})`,
    };
  }

  return { valid: true };
}

/**
 * Get media type from MIME
 */
export function getMediaType(mimeType: string): "image" | "video" | "audio" | "unknown" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "unknown";
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Create object URL from file with cleanup
 */
export function createMediaObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke object URL to free memory
 */
export function revokeMediaObjectUrl(url: string): void {
  try {
    URL.revokeObjectURL(url);
  } catch {
    // Ignore errors
  }
}

/**
 * Extract image dimensions from file
 */
export async function getImageDimensions(file: File): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Not an image file"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Extract video duration from file
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("video/")) {
      reject(new Error("Not a video file"));
      return;
    }

    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video"));
    };

    video.src = url;
  });
}

export const mediaConfig = DEFAULT_CONFIG;
