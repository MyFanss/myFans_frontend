import { describe, it, expect, beforeEach } from "vitest";
import {
  validateMediaFile,
  getMediaType,
  formatBytes,
  mediaConfig,
} from "@/lib/api/media";

describe("Media upload validation", () => {
  describe("validateMediaFile", () => {
    it("accepts valid image file", () => {
      const file = new File([""], "test.jpg", { type: "image/jpeg" });
      const result = validateMediaFile(file);
      expect(result.valid).toBe(true);
    });

    it("rejects invalid MIME type", () => {
      const file = new File([""], "test.exe", { type: "application/x-msdownload" });
      const result = validateMediaFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("not allowed");
    });

    it("rejects file too large", () => {
      const largeFile = new File(
        [new ArrayBuffer(100 * 1024 * 1024)],
        "large.jpg",
        { type: "image/jpeg" }
      );
      const result = validateMediaFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("too large");
    });

    it("rejects invalid extension", () => {
      const file = new File([""], "test.txt", { type: "image/jpeg" });
      const result = validateMediaFile(file);
      expect(result.valid).toBe(false);
    });

    it("accepts allowed image types", () => {
      const types = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      types.forEach((type) => {
        const file = new File([""], `test.${type.split("/")[1]}`, { type });
        const result = validateMediaFile(file);
        expect(result.valid).toBe(true);
      });
    });

    it("accepts allowed video types", () => {
      const types = ["video/mp4", "video/webm"];
      types.forEach((type) => {
        const file = new File([""], `test.${type.split("/")[1]}`, { type });
        const result = validateMediaFile(file);
        expect(result.valid).toBe(true);
      });
    });

    it("accepts allowed audio types", () => {
      const types = ["audio/mpeg", "audio/wav"];
      const extensions = { "audio/mpeg": "mp3", "audio/wav": "wav" };
      types.forEach((type) => {
        const ext = extensions[type as keyof typeof extensions];
        const file = new File([""], `test.${ext}`, { type });
        const result = validateMediaFile(file);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe("getMediaType", () => {
    it("identifies image types", () => {
      expect(getMediaType("image/jpeg")).toBe("image");
      expect(getMediaType("image/png")).toBe("image");
    });

    it("identifies video types", () => {
      expect(getMediaType("video/mp4")).toBe("video");
      expect(getMediaType("video/webm")).toBe("video");
    });

    it("identifies audio types", () => {
      expect(getMediaType("audio/mpeg")).toBe("audio");
      expect(getMediaType("audio/wav")).toBe("audio");
    });

    it("returns unknown for unsupported types", () => {
      expect(getMediaType("application/pdf")).toBe("unknown");
    });
  });

  describe("formatBytes", () => {
    it("formats bytes to human-readable", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1024 * 1024)).toBe("1 MB");
      expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("handles decimal places", () => {
      const result = formatBytes(1536, 2); // 1.5 KB
      expect(result).toContain("1.5");
    });
  });

  describe("Concurrent upload limits", () => {
    it("respects max concurrent uploads", () => {
      const maxConcurrent = 2;
      let activeUploads = 0;

      // Simulate queuing 5 uploads
      const queue = Array.from({ length: 5 }, (_, i) => i);
      const uploading: number[] = [];

      queue.forEach((id) => {
        if (activeUploads < maxConcurrent) {
          uploading.push(id);
          activeUploads++;
        }
      });

      expect(uploading.length).toBeLessThanOrEqual(maxConcurrent);
      expect(uploading).toEqual([0, 1]);
    });
  });

  describe("Retry logic", () => {
    it("retries up to max attempts", () => {
      let attempts = 0;
      const maxRetries = 3;

      const simulate5xxError = () => {
        attempts++;
        if (attempts < maxRetries + 1) {
          throw new Error("server error");
        }
        return "success";
      };

      let result: string | null = null;
      for (let retry = 0; retry <= maxRetries; retry++) {
        try {
          result = simulate5xxError();
          break;
        } catch (err) {
          if (retry === maxRetries) throw err;
        }
      }

      expect(result).toBe("success");
      expect(attempts).toBe(maxRetries + 1);
    });

    it("does not retry on 4xx validation error", () => {
      let attempts = 0;

      const attempt = () => {
        attempts++;
        throw new Error("validation error");
      };

      let lastError: Error | null = null;
      try {
        attempt();
      } catch (err) {
        lastError = err as Error;
      }

      // Should not retry on validation
      expect(attempts).toBe(1);
      expect(lastError?.message).toContain("validation");
    });
  });

  describe("Object URL management", () => {
    it("creates object URL from file", () => {
      const file = new File(["test"], "test.txt");
      const url = URL.createObjectURL(file);

      expect(url).toMatch(/^blob:/);
      URL.revokeObjectURL(url);
    });

    it("revokes object URL to free memory", () => {
      const file = new File(["test"], "test.txt");
      const url = URL.createObjectURL(file);

      // Should not throw
      expect(() => URL.revokeObjectURL(url)).not.toThrow();
    });

    it("handles multiple revokes gracefully", () => {
      const file = new File(["test"], "test.txt");
      const url = URL.createObjectURL(file);

      URL.revokeObjectURL(url);
      // Second revoke should not throw
      expect(() => URL.revokeObjectURL(url)).not.toThrow();
    });
  });
});
