# Hardened Media Upload Pipeline

Complete client-side media pipeline: selection, validation, concurrent upload with progress, cancellation, retries, previews, and composer integration.

## Architecture

```
User → File Selection (picker/drag-drop/paste)
  ↓
Validation (MIME, size, spoof-check, dimensions)
  ↓
Queue Management (reorder, remove, concurrent limits)
  ↓
Upload Engine (XMLHttpRequest, progress, abort, retry)
  ↓
Composer Integration (block publish, show uploaded assets)
```

## Components

### MediaUploadField
Multi-file upload UI with drag-drop, file picker, and paste support.

**Features:**
- Drag-drop zone (keyboard accessible: Enter/Space to open picker)
- File picker input
- Paste from clipboard (images only)
- Per-item preview (thumbnail, video icon, audio icon)
- Progress bar per item (bytes + %)
- Inline error display
- Retry button for failed items
- Remove button (disabled while uploading)
- Status indicator (queued, uploading, ready, error)

**Props:**
```typescript
interface MediaUploadFieldProps {
  onMediaReady?: (files: Array<{ id: string; url: string; type: string }>) => void;
  maxFiles?: number;           // default 4
  config?: Partial<MediaConfig>;
  disabled?: boolean;
}
```

## Upload Engine

### useMediaUploadQueue
React hook managing upload queue with concurrent limits, retries, and state.

**States per item:**
- `queued` — Waiting to upload (respect concurrency limit)
- `validating` — Extracting metadata (image dimensions, video duration)
- `uploading` — In-flight, showing progress
- `processing` — Upload complete, server processing (wait before using)
- `ready` — Available for composition
- `error` — Failed after all retries
- `cancelled` — User removed or cancelled

**API:**
```typescript
const {
  items,                // UploadItem[]
  isProcessing,         // boolean (any item not ready/error/cancelled)
  addFiles,             // (files: File[]) => void
  removeItem,           // (id: string) => void
  retryItem,            // (id: string) => void
  reorderItems,         // (fromIndex, toIndex) => void
  cancelAll,            // () => void
  getReadyMedia,        // () => UploadedMedia[]
} = useMediaUploadQueue({
  maxConcurrent: 2,
  config: { maxFileSize: 50 * 1024 * 1024, ... },
  onItemAdded: (item) => {},
  onItemRemoved: (id) => {},
  onItemComplete: (item) => {},
  onItemError: (id, error) => {},
});
```

### uploadMedia
XMLHttpRequest-based upload with progress tracking and abort.

```typescript
const result = await uploadMedia(file, itemId, {
  signal: abortController.signal,
  onProgress: (progress) => {
    console.log(`${progress.itemId}: ${progress.progress}%`);
  }
}, config);
```

**Response:**
```typescript
interface UploadedMedia {
  id: string;           // Media ID (for composition)
  url: string;          // CDN URL
  mimeType: string;
  size: number;
  width?: number;       // Images
  height?: number;
  duration?: number;    // Videos/audio
}
```

## Validation

### Server-side (POST /media/upload)
```bash
POST /media/upload
Content-Type: multipart/form-data

file: <binary>

→ 200 OK { id, url, mimeType, size, ... }
→ 400 Bad Request { code: "INVALID_TYPE", message: "..." }
→ 413 Payload Too Large
→ 5xx → retry with exponential backoff
```

### Client-side (validateMediaFile)
```typescript
const result = validateMediaFile(file, config);
// Returns: { valid: boolean; error?: string }
```

**Checks:**
1. File size ≤ maxFileSize (default 50MB)
2. MIME type in allowlist
3. Extension matches MIME (spoof detection)
4. Dimension check (soft warn for images > maxImageDimensions)

## Config (MediaConfig)

```typescript
interface MediaConfig {
  maxFileSize: number;           // 50MB default
  maxTotalSize: number;          // 200MB default (all queued files)
  maxConcurrent: number;         // 2 default
  allowedTypes: string[];        // ["image/jpeg", "image/png", ...]
  allowedExtensions: string[];   // [".jpg", ".png", ...]
  maxImageDimensions: {          // { width: 4000, height: 4000 }
    width: number;
    height: number;
  };
}
```

## Retry Strategy

**Exponential backoff:**
- 1st retry: 1s delay
- 2nd retry: 2s delay
- 3rd retry: 4s delay
- Max 3 retries total

**Retry on:**
- 5xx server error
- Network error (no connection, timeout)

**No retry on:**
- 4xx validation error (MIME, size, spoof)
- 401/403 auth error (user must re-login)

## Composer Integration

### Blocking Publish
```typescript
// In PostComposer
const { isProcessing } = useMediaUploadQueue();

<Button disabled={isProcessing || /* other validation */}>
  Publish
</Button>
```

### Orphaned Asset Handling
On publish failure after upload:
1. Show toast: "Upload successful. Publish failed, retrying…"
2. Keep uploaded items in queue as `ready`
3. Allow user to retry publish without re-uploading
4. Or discard and retry with new files

### Edit Flow
When editing post with existing media:
1. Load remote URLs into queue as pre-`ready` items
2. Allow remove/replace
3. On publish: include both original and new media IDs

## Object URL Lifecycle

**Create:**
```typescript
const preview = URL.createObjectURL(file);
```

**Use:** Display in `<img>` or `<video>` during upload/preview.

**Revoke:** On component unmount or item removal.
```typescript
useEffect(() => {
  return () => {
    items.forEach(item => URL.revokeObjectURL(item.preview));
  };
}, [items]);
```

**Why:** Object URLs hold memory until revoked. Failing to revoke causes memory leaks.

## Metadata Extraction

### Image Dimensions
```typescript
const { width, height } = await getImageDimensions(file);
```

- Used for dimension warning (soft warn if > maxImageDimensions)
- Extracted during `validating` state
- Failures don't block upload

### Video Duration
```typescript
const duration = await getVideoDuration(file);
```

- Extracted during `validating` state
- Displayed as "MM:SS" in preview

### Audio Duration
- Same as video; extracted if duration available

## Security

### EXIF Orientation
- Client-side: Set `image-orientation: from-image` CSS (limits support)
- Server-side: Strip EXIF on upload or return pre-rotated CDN URL
- **Limitation:** Not currently handled; document if not supported

### Content Validation
- Magic byte sniffing: Check file header, not just extension
- Reject: `javascript:`, HTML with `<script>`, etc.
- Currently enforced by MIME + extension cross-check

### Privacy
- No file metadata logged (path, original name after hash)
- Object URLs scoped to browser tab (not transmitted)

## Testing

### Unit (src/__tests__/media-upload.test.ts)
- Validation matrix: all type/size/extension combos
- Retry logic: exponential backoff, max attempts
- Object URL: create/revoke, multiple revokes

### Component
- Queue concurrency: 2 uploading max, next waits
- Cancel aborts request (XMLHttpRequest.abort)
- Reorder preserves state
- Remove item cancels in-flight

### Integration (E2E)
- Happy path: drag-drop → progress → ready → publish
- Invalid type: rejected before upload
- Failed upload: show error, "Retry" succeeds
- Publish blocked while uploading
- Publish failure: assets reusable

### Memory
- Rapid add/remove: no leak in DevTools
- Component unmount: all object URLs revoked

## Deployment Checklist

- [ ] Backend POST /media/upload accepts multipart/form-data
- [ ] Returns { id, url, mimeType, size, width?, height?, duration? }
- [ ] Validates MIME + size server-side (defense in depth)
- [ ] Returns 400 for invalid, 413 for too large, 5xx on error
- [ ] EXIF handling documented or implemented (rotate/strip)
- [ ] CDN configured for media.* or /uploads/ path
- [ ] Tests pass: `npm run test`
- [ ] E2E passes: `npm run test:e2e`
- [ ] Memory profiling: no leak on rapid add/remove
- [ ] Accessible: keyboard picker, screen reader announcements
- [ ] Dark mode: dropzone, previews

## Future Enhancements

- Drag reorder items in queue
- Resumable upload (Tus protocol) if backend supports
- Image cropping / rotation UI
- Video thumbnail picker (frame selection)
- Audio waveform rendering (WaveSurfer)
- Compress images before upload (sharp.js)
- Generate multiple sizes (responsive images)
- Copy to clipboard (raw file bytes)

## Troubleshooting

### Memory leak on frequent upload/cancel
- Verify: useEffect cleanup revokes all object URLs
- Check: browser DevTools → Performance → take heap snapshot

### Upload stuck in "processing"
- Check: server response includes all required fields
- Fix: Server must return full UploadedMedia object within timeout

### Cannot paste from clipboard
- Check: File → Image MIME types checked in handlePaste
- Fix: Only image/* supported; extend for other types

### Publish button enabled while uploading
- Check: `isProcessing` wired to button `disabled` prop
- Fix: Ensure useMediaUploadQueue hook updates state correctly
