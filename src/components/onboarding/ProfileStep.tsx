'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '@/lib/onboarding/schemas';
import { getCategories } from '@/lib/api/onboarding';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface ProfileStepProps {
  defaultValues?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileStep({
  defaultValues = {},
  onSubmit,
  isLoading = false,
}: ProfileStepProps) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: defaultValues.bio || '',
      categories: defaultValues.categories || [],
      socialLinks: {
        twitter: defaultValues.socialLinks?.twitter || '',
        instagram: defaultValues.socialLinks?.instagram || '',
        tiktok: defaultValues.socialLinks?.tiktok || '',
      },
    },
  });

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
        <p className="text-muted-foreground">
          Tell your audience about yourself and what you create. This helps users discover
          and connect with you.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself and what you create..."
                    className="resize-none"
                    rows={4}
                    maxLength={500}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="flex justify-between items-center">
                  <FormDescription>
                    Share a bit about yourself (max 500 characters)
                  </FormDescription>
                  <span className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/500
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Categories */}
          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  {loadingCategories ? (
                    <div className="col-span-2 flex items-center justify-center p-4">
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Loading categories...
                    </div>
                  ) : (
                    categories.map((category) => (
                      <FormField
                        key={category.id}
                        control={form.control}
                        name="categories"
                        render={({ field: checkboxField }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={checkboxField.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  const value = checkboxField.value || [];
                                  if (checked) {
                                    checkboxField.onChange([...value, category.id]);
                                  } else {
                                    checkboxField.onChange(
                                      value.filter((v) => v !== category.id)
                                    );
                                  }
                                }}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {category.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))
                  )}
                </div>
                <FormDescription>
                  Select 1-5 categories that best describe your content
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Social Links */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Social Links (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your social media profiles for cross-promotion
              </p>
            </div>

            <FormField
              control={form.control}
              name="socialLinks.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://twitter.com/yourhandle"
                      type="url"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinks.instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://instagram.com/yourhandle"
                      type="url"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinks.tiktok"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TikTok URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://tiktok.com/@yourhandle"
                      type="url"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
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
