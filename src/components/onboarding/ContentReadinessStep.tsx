'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contentSchema, ContentFormData } from '@/lib/onboarding/schemas';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Upload } from 'lucide-react';

interface ContentReadinessStepProps {
  defaultValues?: Partial<ContentFormData>;
  onSubmit: (data: ContentFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ContentReadinessStep({
  defaultValues = {},
  onSubmit,
  isLoading = false,
}: ContentReadinessStepProps) {
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      hasDraft: defaultValues.hasDraft || false,
      draftTitle: defaultValues.draftTitle || '',
      skippedContent: defaultValues.skippedContent || false,
    },
  });

  const hasDraft = form.watch('hasDraft');

  const handleSkip = async () => {
    await form.handleSubmit(async (data) => {
      await onSubmit({
        ...data,
        skippedContent: true,
      });
    })();
    setShowSkipConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Get Ready to Create</h2>
        <p className="text-muted-foreground">
          Let us know if you have content ready to publish. You can always upload more later.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Draft Ready Option */}
          <FormField
            control={form.control}
            name="hasDraft"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="flex-1 space-y-1">
                  <FormLabel className="font-normal cursor-pointer">
                    I have content ready to publish
                  </FormLabel>
                  <FormDescription>
                    Check this if you have prepared posts or videos to upload
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Draft Title Input (shown if hasDraft is checked) */}
          {hasDraft && (
            <FormField
              control={form.control}
              name="draftTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Post Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Welcome to My Channel!"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Give your first post a title (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Content Upload Card */}
          {hasDraft && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="size-5" />
                  Upload Your First Post
                </CardTitle>
                <CardDescription>
                  Add images, videos, or audio to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-2">
                  <Upload className="size-8 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">Drag files here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Images (JPG, PNG, WebP), Videos (MP4, WebM), Audio (MP3, WAV)
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Max 50 MB per file, 200 MB total
                  </p>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    Browse Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">🎯 Start strong</p>
                <p className="text-muted-foreground">
                  Your first post sets the tone. Make it count!
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">📋 Plan ahead</p>
                <p className="text-muted-foreground">
                  Have a content calendar? You can schedule posts in advance
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">🔄 Build consistency</p>
                <p className="text-muted-foreground">
                  Regular posts keep your audience engaged
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSkipConfirm(true)}
              disabled={isLoading}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Skip Confirmation Dialog */}
      <AlertDialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Skip Content Upload?</AlertDialogTitle>
          <AlertDialogDescription>
            You can upload your first post anytime from your dashboard. Skipping won't affect
            your ability to publish later.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSkip}>Skip Anyway</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
