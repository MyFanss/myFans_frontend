import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReviewStep } from '../ReviewStep';
import { OnboardingFormData } from '@/types/onboarding';

describe('ReviewStep', () => {
  const mockData: Partial<OnboardingFormData> = {
    identity: {
      displayName: 'John Doe',
      handle: 'johndoe',
      avatar: 'https://example.com/avatar.jpg',
    },
    profile: {
      bio: 'I create awesome content',
      categories: ['music', 'gaming'],
      socialLinks: {
        twitter: 'https://twitter.com/johndoe',
        instagram: 'https://instagram.com/johndoe',
      },
    },
    monetization: {
      payoutMethod: 'bank_transfer',
      kycCompleted: false,
      termsAccepted: true,
    },
    content: {
      hasDraft: true,
      draftTitle: 'My First Post',
      skippedContent: false,
    },
  };

  it('should render all data sections', () => {
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();

    render(
      <ReviewStep
        data={mockData}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
      />
    );

    // Identity section
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();

    // Profile section
    expect(screen.getByText('I create awesome content')).toBeInTheDocument();
    expect(screen.getByText('music')).toBeInTheDocument();
    expect(screen.getByText('gaming')).toBeInTheDocument();

    // Monetization section
    expect(screen.getByText('Bank Transfer (ACH)')).toBeInTheDocument();

    // Content section
    expect(screen.getByText('✓ Ready to publish')).toBeInTheDocument();
    expect(screen.getByText('My First Post')).toBeInTheDocument();
  });

  it('should display edit buttons for each section', () => {
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();

    render(
      <ReviewStep
        data={mockData}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
      />
    );

    const editButtons = screen.getAllByText(/Edit/i);
    expect(editButtons.length).toBe(4); // One for each section
  });

  it('should call onEditStep when edit button clicked', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();

    render(
      <ReviewStep
        data={mockData}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
      />
    );

    // Get all edit buttons
    const editButtons = screen.getAllByText(/Edit/i);

    // Click first edit button (Identity)
    await user.click(editButtons[0]);

    expect(mockOnEditStep).toHaveBeenCalledWith(1);
  });

  it('should require guidelines acceptance before launch', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();

    render(
      <ReviewStep
        data={mockData}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
      />
    );

    // Launch button should be disabled
    const launchButton = screen.getByRole('button', { name: /Launch My Profile/i });
    expect(launchButton).toBeDisabled();

    // Find and check the guidelines checkbox
    const guidelinesCheckbox = screen.getByRole('checkbox');
    fireEvent.click(guidelinesCheckbox);

    // Button should now be enabled
    await waitFor(() => {
      expect(launchButton).not.toBeDisabled();
    });
  });

  it('should show launch confirmation dialog', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();

    render(
      <ReviewStep
        data={mockData}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
      />
    );

    // Accept guidelines
    const guidelinesCheckbox = screen.getByRole('checkbox');
    await user.click(guidelinesCheckbox);

    // Click launch
    const launchButton = screen.getByRole('button', { name: /Launch My Profile/i });
    await user.click(launchButton);

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Ready to Launch?')).toBeInTheDocument();
    });
  });

  it('should call onSubmit when launch confirmed', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();

    render(
      <ReviewStep
        data={mockData}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
      />
    );

    // Accept guidelines
    const guidelinesCheckbox = screen.getByRole('checkbox');
    await user.click(guidelinesCheckbox);

    // Click launch
    const launchButton = screen.getByRole('button', { name: /Launch My Profile/i });
    await user.click(launchButton);

    // Wait for dialog
    await waitFor(() => {
      expect(screen.getByText('Ready to Launch?')).toBeInTheDocument();
    });

    // Confirm launch
    const confirmButton = screen.getByRole('button', { name: /Yes, Launch Now/i });
    await user.click(confirmButton);

    // Should call onSubmit
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('should display PayPal payout method', () => {
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();

    const dataWithPayPal = {
      ...mockData,
      monetization: {
        ...mockData.monetization,
        payoutMethod: 'paypal' as const,
      },
    };

    render(
      <ReviewStep
        data={dataWithPayPal}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
      />
    );

    expect(screen.getByText('PayPal')).toBeInTheDocument();
  });

  it('should display skipped content status', () => {
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();

    const dataWithSkipped = {
      ...mockData,
      content: {
        hasDraft: false,
        skippedContent: true,
      },
    };

    render(
      <ReviewStep
        data={dataWithSkipped}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
      />
    );

    expect(screen.getByText('Skipped - will add later')).toBeInTheDocument();
  });

  it('should handle empty optional fields gracefully', () => {
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();

    const minimalData: Partial<OnboardingFormData> = {
      identity: {
        displayName: 'John Doe',
        handle: 'johndoe',
      },
      profile: {
        bio: '',
        categories: ['music'],
        socialLinks: {},
      },
      monetization: {
        payoutMethod: 'bank_transfer',
        termsAccepted: true,
      },
      content: {
        hasDraft: false,
        skippedContent: true,
      },
    };

    render(
      <ReviewStep
        data={minimalData}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
      />
    );

    // Should not crash and render successfully
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
  });

  it('should disable launch button while loading', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();
    const { rerender } = render(
      <ReviewStep
        data={mockData}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
        isLoading={false}
      />
    );

    // Accept guidelines
    const guidelinesCheckbox = screen.getByRole('checkbox');
    fireEvent.click(guidelinesCheckbox);

    let launchButton = screen.getByRole('button', { name: /Launch My Profile/i });
    expect(launchButton).not.toBeDisabled();

    // Re-render with loading state
    rerender(
      <ReviewStep
        data={mockData}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
        isLoading={true}
      />
    );

    launchButton = screen.getByRole('button', { name: /Launching/i });
    expect(launchButton).toBeDisabled();
  });

  it('should display social links as clickable', () => {
    const mockOnSubmit = vi.fn();
    const mockOnEditStep = vi.fn();

    render(
      <ReviewStep
        data={mockData}
        onSubmit={mockOnSubmit}
        onEditStep={mockOnEditStep}
      />
    );

    const twitterLink = screen.getByRole('link', {
      name: /twitter.com/i,
    }) as HTMLAnchorElement;
    expect(twitterLink.href).toBe('https://twitter.com/johndoe');
    expect(twitterLink.target).toBe('_blank');

    const instagramLink = screen.getByRole('link', {
      name: /instagram.com/i,
    }) as HTMLAnchorElement;
    expect(instagramLink.href).toBe('https://instagram.com/johndoe');
    expect(instagramLink.target).toBe('_blank');
  });
});
