'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { monetizationSchema, MonetizationFormData } from '@/lib/onboarding/schemas';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface MonetizationStepProps {
  defaultValues?: Partial<MonetizationFormData>;
  onSubmit: (data: MonetizationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function MonetizationStep({
  defaultValues = {},
  onSubmit,
  isLoading = false,
}: MonetizationStepProps) {
  const form = useForm<MonetizationFormData>({
    resolver: zodResolver(monetizationSchema),
    defaultValues: {
      payoutMethod: defaultValues.payoutMethod || '',
      kycCompleted: defaultValues.kycCompleted || false,
      termsAccepted: defaultValues.termsAccepted || false,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Monetization Setup</h2>
        <p className="text-muted-foreground">
          Configure how you'll receive payouts and set up your account for payments.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Payout Method Selection */}
          <FormField
            control={form.control}
            name="payoutMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Payout Method</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payout method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer (ACH)</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose how you want to receive your earnings
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* KYC Checklist (Mock) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification Requirements</CardTitle>
              <CardDescription>
                Complete these steps to enable payouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="size-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Email Verified</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="size-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">→</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Identity Verification</p>
                    <p className="text-xs text-muted-foreground">
                      Required - Will be completed after onboarding
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <div className="size-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">→</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Tax Information (W-9/W-8)</p>
                    <p className="text-xs text-muted-foreground">
                      Required - Secure collection
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Acceptance */}
          <FormField
            control={form.control}
            name="termsAccepted"
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
                    I agree to the payment terms and platform monetization policy
                  </FormLabel>
                  <FormDescription>
                    Review our{' '}
                    <a href="#" className="underline hover:text-foreground">
                      terms of service
                    </a>
                    {' '}and{' '}
                    <a href="#" className="underline hover:text-foreground">
                      monetization policy
                    </a>
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Info Banner */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Note:</strong> You can update your payout method anytime in your account
              settings. Full KYC verification will be completed after onboarding.
            </p>
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
