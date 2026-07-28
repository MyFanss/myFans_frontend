'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { OnboardingFormData } from '@/types/onboarding';
import { Loader2, CheckCircle2, Edit2 } from 'lucide-react';

interface ReviewStepProps {
  data: Partial<OnboardingFormData>;
  onSubmit: () => Promise<void>;
  onEditStep: (step: number) => void;
  isLoading?: boolean;
}

export function ReviewStep({
  data,
  onSubmit,
  onEditStep,
  isLoading = false,
}: ReviewStepProps) {
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLaunch = async () => {
    if (!guidelinesAccepted) {
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmLaunch = async () => {
    await onSubmit();
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Your Profile</h2>
        <p className="text-muted-foreground">
          Take a final look at your profile information before launching. You can edit any
          section below.
        </p>
      </div>

      <div className="space-y-4">
        {/* Identity Section */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Identity</CardTitle>
              <CardDescription>Display name, handle, and avatar</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(1)}
              disabled={isLoading}
            >
              <Edit2 className="size-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Display Name</p>
              <p className="font-medium">{data.identity?.displayName || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Handle</p>
              <p className="font-medium">@{data.identity?.handle || '—'}</p>
            </div>
            {data.identity?.avatar && (
              <div>
                <p className="text-sm text-muted-foreground">Avatar</p>
                <p className="font-medium text-sm truncate">{data.identity.avatar}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Section */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Bio and content categories</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(2)}
              disabled={isLoading}
            >
              <Edit2 className="size-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.profile?.bio && (
              <div>
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="font-medium text-sm leading-relaxed">{data.profile.bio}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {data.profile?.categories?.map((category) => (
                  <span key={category} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            {data.profile?.socialLinks && Object.values(data.profile.socialLinks).some(v => v) && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Social Links</p>
                <div className="space-y-1 text-sm">
                  {data.profile.socialLinks.twitter && (
                    <p>🐦 <a href={data.profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{data.profile.socialLinks.twitter}</a></p>
                  )}
                  {data.profile.socialLinks.instagram && (
                    <p>📸 <a href={data.profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{data.profile.socialLinks.instagram}</a></p>
                  )}
                  {data.profile.socialLinks.tiktok && (
                    <p>🎵 <a href={data.profile.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{data.profile.socialLinks.tiktok}</a></p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monetization Section */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Monetization</CardTitle>
              <CardDescription>Payout method and terms</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(3)}
              disabled={isLoading}
            >
              <Edit2 className="size-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Payout Method</p>
              <p className="font-medium">
                {data.monetization?.payoutMethod === 'bank_transfer'
                  ? 'Bank Transfer (ACH)'
                  : data.monetization?.payoutMethod === 'paypal'
                    ? 'PayPal'
                    : '—'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              <span className="text-sm">
                {data.monetization?.termsAccepted ? 'Platform terms accepted' : 'Terms not accepted'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Content Section */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Content</CardTitle>
              <CardDescription>First post readiness</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(4)}
              disabled={isLoading}
            >
              <Edit2 className="size-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">
                {data.content?.hasDraft ? '✓ Ready to publish' : data.content?.skippedContent ? 'Skipped - will add later' : '—'}
              </p>
            </div>
            {data.content?.draftTitle && (
              <div>
                <p className="text-sm text-muted-foreground">First Post Title</p>
                <p className="font-medium text-sm">{data.content.draftTitle}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Guidelines */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-base">Platform Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">Before launching, please acknowledge:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>All content must comply with our community standards</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>You are responsible for all intellectual property rights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>Violations may result in account suspension</span>
            </li>
          </ul>

          <div className="pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={guidelinesAccepted}
                onCheckedChange={(checked) => setGuidelinesAccepted(checked as boolean)}
                disabled={isLoading}
                className="mt-1"
              />
              <span className="text-sm font-medium">
                I understand and agree to follow the platform guidelines
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Launch Button */}
      <Button
        onClick={handleLaunch}
        disabled={!guidelinesAccepted || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Launching...
          </>
        ) : (
          '🚀 Launch My Profile'
        )}
      </Button>

      {/* Launch Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Ready to Launch?</AlertDialogTitle>
          <AlertDialogDescription>
            Your profile will be live and visible to all users on the platform. You can edit
            your profile information at any time from your dashboard.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Review Again</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLaunch}>
              Yes, Launch Now
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
