"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Upload, X, AlertCircle, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaUploadQueue } from "@/hooks/mutations/useMediaUploadQueue";
import { formatBytes, getMediaType, revokeMediaObjectUrl } from "@/lib/api/media";
import type { UploadItem } from "@/hooks/mutations/useMediaUploadQueue";
import type { MediaConfig } from "@/lib/api/media";

interface MediaUploadFieldProps {
  onMediaReady?: (files: Array<{ id: string; url: string; type: string }>) => void;
  maxFiles?: number;
  config?: Partial<MediaConfig>;
  disabled?: boolean;
}

function MediaPreview({ item }: { item: UploadItem }) {
  const mediaType = getMediaType(item.file.type);

  return (
    <div className="relative size-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
      {mediaType === "image" && (
        <img
          src={item.preview}
          alt={item.file.name}
          className="size-full object-cover"
        />
      )}
      {mediaType === "video" && (
        <div className="size-full flex items-center justify-center">
          <div className="text-xs text-muted-foreground">Video</div>
        </div>
      )}
      {mediaType === "audio" && (
        <div className="size-full flex items-center justify-center">
          <div className="text-xs text-muted-foreground">Audio</div>
        </div>
      )}
    </div>
  );
}

function MediaItemRow({
  item,
  onRemove,
  onRetry,
}: {
  item: UploadItem;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const stateIcon = {
    queued: <Loader2 className="size-4 animate-spin text-blue-500" />,
    validating: <Loader2 className="size-4 animate-spin" />,
    uploading: <Loader2 className="size-4 animate-spin text-blue-500" />,
    processing: <Loader2 className="size-4 animate-spin" />,
    ready: <CheckCircle2 className="size-4 text-green-500" />,
    error: <AlertCircle className="size-4 text-red-500" />,
    cancelled: <X className="size-4 text-muted-foreground" />,
  }[item.state];

  return (
    <div className="flex gap-3 items-start p-3 rounded-lg border bg-card">
      <MediaPreview item={item} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {stateIcon}
          <p className="text-sm font-medium truncate">{item.file.name}</p>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {formatBytes(item.file.size)}
          {item.metadata?.duration && ` · ${item.metadata.duration.toFixed(1)}s`}
        </p>

        {item.state === "uploading" && (
          <div className="mt-2 space-y-1">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatBytes(item.loaded)} / {formatBytes(item.total)}
            </p>
          </div>
        )}

        {item.error && (
          <p className="text-xs text-red-600 mt-1">{item.error}</p>
        )}
      </div>

      <div className="flex gap-1">
        {item.state === "error" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            aria-label="Retry upload"
          >
            <RotateCcw className="size-4" />
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onRemove}
          aria-label="Remove file"
          disabled={item.state === "uploading"}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function MediaUploadField({
  onMediaReady,
  maxFiles = 4,
  config,
  disabled = false,
}: MediaUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const {
    items,
    isProcessing,
    addFiles,
    removeItem,
    retryItem,
    getReadyMedia,
  } = useMediaUploadQueue({ config });

  const canAddMore = items.length < maxFiles;

  /**
   * File picker
   */
  const handlePickFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(Array.from(e.target.files));
        e.target.value = ""; // Reset input
      }
    },
    [addFiles]
  );

  /**
   * Drag and drop
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget === dropzoneRef.current) {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      if (e.dataTransfer.files) {
        addFiles(Array.from(e.dataTransfer.files));
      }
    },
    [addFiles]
  );

  /**
   * Paste from clipboard
   */
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!dropzoneRef.current?.contains(document.activeElement)) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file" && items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        addFiles(files);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [addFiles]);

  /**
   * Notify when media ready
   */
  useEffect(() => {
    if (!isProcessing) {
      const ready = getReadyMedia();
      if (ready.length > 0) {
        onMediaReady?.(
          ready.map((media) => ({
            id: media.id,
            url: media.url,
            type: media.mimeType,
          }))
        );
      }
    }
  }, [isProcessing, getReadyMedia, onMediaReady]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        revokeMediaObjectUrl(item.preview);
      });
    };
  }, [items]);

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        ref={dropzoneRef}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-muted-foreground/20"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        role="button"
        tabIndex={0}
        aria-label="Drag files here or click to select"
        onClick={handlePickFiles}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            handlePickFiles();
          }
        }}
      >
        <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm font-medium">
          {canAddMore ? "Drag files here or click to select" : "Upload limit reached"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Images, videos, and audio files up to{" "}
          {Math.round(50 / 1024)} MB each
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          disabled={disabled || !canAddMore}
          className="hidden"
          accept="image/*,video/*,audio/*"
        />
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {items.length} of {maxFiles} files
            </p>
            {items.some((item) => item.state === "error") && (
              <p className="text-xs text-red-600">
                {items.filter((item) => item.state === "error").length} failed
              </p>
            )}
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <MediaItemRow
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
                onRetry={() => retryItem(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Uploading files...
        </div>
      )}
    </div>
  );
}
