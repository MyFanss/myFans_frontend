# Forms

All forms use **react-hook-form** for state management and **Zod** for validation.

## Adding a new validated form

### 1. Define your schema in `src/lib/validations/`

```ts
// src/lib/validations/post.ts
import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  body:  z.string().min(1, "Body is required"),
});

export type PostFormValues = z.infer<typeof postSchema>;
```

`z.infer<typeof postSchema>` derives the TypeScript type automatically — no duplication.

### 2. Create the form component

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { postSchema, type PostFormValues } from "@/lib/validations/post";

export function PostForm() {
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),       // ← connects Zod to RHF
    defaultValues: { title: "", body: "" },  // ← prevents uncontrolled warnings
  });

  async function onSubmit(values: PostFormValues) {
    // Only called when ALL fields pass Zod validation
    await api.post("/posts", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="My post title" {...field} />
              </FormControl>
              <FormMessage /> {/* renders Zod error or nothing */}
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
```

### 3. Use it in a page

```tsx
// page.tsx — Server Component (no "use client")
import { Suspense } from "react";
import { PostForm } from "./post-form";

export default function NewPostPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PostForm />
    </Suspense>
  );
}
```

---

## How validation works end-to-end

```
User clicks Submit
  → form.handleSubmit() runs Zod against current field values
  → If any field fails → RHF populates formState.errors, re-renders
      → <FormMessage> reads the error and displays it
      → <Input> gets aria-invalid=true → red border (via CSS)
  → If ALL fields pass → onSubmit(values) is called with typed values
```

## Cross-field validation (e.g. password confirmation)

Use Zod's `.refine()` at the object level and target the field with `path`:

```ts
const schema = z.object({
  password:        z.string().min(8),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // which <FormMessage> shows the error
});
```

## Optional fields that can be blank

HTML inputs return `""` (not `undefined`) when empty. Use `.or(z.literal(""))`:

```ts
website: z.string().url("Invalid URL").optional().or(z.literal("")),
```

## Handling server errors

Server errors (wrong credentials, duplicate email, etc.) can't be caught by Zod — they come back from the API after submit. Keep a separate `serverError` state:

```ts
const [serverError, setServerError] = useState<string | null>(null);

async function onSubmit(values) {
  try {
    await api.post("/endpoint", values);
  } catch {
    setServerError("Something went wrong.");
  }
}
```

Render it between the last field and the submit button.

## Existing schemas

| Schema | File | Fields |
|--------|------|--------|
| `loginSchema` | `lib/validations/auth.ts` | `email`, `password` |
| `signupSchema` | `lib/validations/auth.ts` | `email`, `password`, `confirmPassword` |
| `profileSchema` | `lib/validations/profile.ts` | `displayName`, `bio`, `website` |
