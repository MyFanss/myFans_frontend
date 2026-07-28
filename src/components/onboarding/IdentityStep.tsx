'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { identitySchema, IdentityFormData } from '@/lib/onboarding/schemas';
import { checkHandleAvailability } from '@/lib/api/onboarding';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface IdentityStepProps {
  defaultValues?: Partial<IdentityFormData>;
  onSubmit: (data: IdentityFormData) => Promise<void>;
  isLoading?: boolean;
  isDirty?: boolean;
}

export function IdentityStep({
  defaultValues = {},
  onSubmit,
  isLoading = false,
  isDirty = false,
}: IdentityStepProps) {
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [handleError, setHandleError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController>();

  const form = useForm<IdentityFormData>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      displayName: defaultValues.displayName || '',
      handle: defaultValues.handle || '',
      avatar: defaultValues.avatar || '',
    },
  });

  const watchHandle = form.watch('handle');

  // Debounce handle checking
  useEffect(() => {
    // Clear previous abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Only check if handle has minimum length and no validation errors
    const handleError = form.formState.errors.handle;
    if (!watchHandle || watchHandle.length < 3 || handleError) {
      setHandleChecking(false);
      setHandleAvailable(null);
      setHandleError(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setHandleChecking(true);
        setHandleError(null);

        abortControllerRef.current = new AbortController();
        const result = await checkHandleAvailability(
          watchHandle,
          abortControllerRef.current.signal
        );

        setHandleAvailable(result.available);
        if (!result.available && result.error) {
          setHandleError(result.error);
        }
        setHandleChecking(false);
      } catch (err) {
        console.error('Handle check error:', err);
        setHandleChecking(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [watchHandle, form.formState.errors.handle]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Create Your Identity</h2>
        <p className="text-muted-foreground">
          Choose how you want to be known on the platform. Your display name and handle
          are visible to all users.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Display Name */}
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Alex Taylor"
                    {...field}
                    disabled={isLoading}
                    onChange={(e) => {
                      field.onChange(e);
                      form.trigger('displayName');
                    }}
                  />
                </FormControl>
                <FormDescription>
                  This is how your name will appear on your profile (2-50 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Handle */}
          <FormField
            control={form.control}
            name="handle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handle</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">@</div>
                    <Input
                      placeholder="username"
                      className="pl-8"
                      {...field}
                      disabled={isLoading}
                      onChange={(e) => {
                        field.onChange(e);
                        form.trigger('handle');
                      }}
                      aria-describedby={
                        handleChecking || handleAvailable !== null
                          ? 'handle-status'
                          : undefined
                      }
                    />
                    {/* Status indicator */}
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      {handleChecking && (
                        <>
                          <Loader2 className="size-4 animate-spin text-blue-500" />
                          <span className="sr-only">Checking handle availability</span>
                        </>
                      )}
                      {!handleChecking && handleAvailable === true && (
                        <>
                          <CheckCircle2 className="size-4 text-green-500" />
                          <span className="sr-only">Handle is available</span>
                        </>
                      )}
                      {!handleChecking && handleAvailable === false && (
                        <>
                          <AlertCircle className="size-4 text-red-500" />
                          <span className="sr-only">Handle is not available</span>
                        </>
                      )}
                    </div>
                  </div>
                </FormControl>
                <div id="handle-status" className="space-y-1">
                  <FormDescription>
                    Unique username (3-30 characters, letters, numbers, underscore, hyphen)
                  </FormDescription>
                  {handleError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="size-4" />
                      {handleError}
                    </p>
                  )}
                  {handleAvailable === true && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="size-4" />
                      Handle is available!
                    </p>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Avatar URL */}
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/avatar.jpg"
                    type="url"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Link to your profile picture (optional, can be updated later)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              isLoading ||
              handleChecking ||
              (watchHandle && handleAvailable === false)
            }
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
