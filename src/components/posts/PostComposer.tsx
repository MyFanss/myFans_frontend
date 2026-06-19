"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createPostSchema,
  POST_BODY_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  type PostVisibility,
} from "@/lib/validations/post";
import { createPost } from "@/lib/api/posts";

const VISIBILITY_OPTIONS: { value: PostVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "subscribers", label: "Subscribers only" },
];

export function PostComposer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const result = createPostSchema.safeParse({
      title,
      body,
      visibility,
      mediaUrl,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await createPost(result.data);
      router.push("/dashboard/posts?published=1");
    } catch {
      setSubmitError("Failed to publish post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-2xl space-y-6"
      >
        <h1 className="text-2xl font-semibold">New post</h1>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={POST_TITLE_MAX_LENGTH}
            aria-invalid={Boolean(errors.title)}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-red-600">{errors.title}</span>
            <span>
              {title.length}/{POST_TITLE_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={POST_BODY_MAX_LENGTH}
            rows={8}
            aria-invalid={Boolean(errors.body)}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="text-red-600">{errors.body}</span>
            <span>
              {body.length}/{POST_BODY_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mediaUrl">Media URL (optional)</Label>
          <Input
            id="mediaUrl"
            type="url"
            value={mediaUrl}
            onChange={(event) => setMediaUrl(event.target.value)}
            placeholder="https://..."
            aria-invalid={Boolean(errors.mediaUrl)}
          />
          {errors.mediaUrl ? (
            <p className="text-xs text-red-600">{errors.mediaUrl}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Visibility</Label>
          <div className="flex gap-2">
            {VISIBILITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setVisibility(option.value)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  visibility === option.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-accent"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {submitError ? (
          <p className="text-sm text-red-600">{submitError}</p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Publishing..." : "Publish"}
        </Button>
      </form>
    </main>
  );
}
