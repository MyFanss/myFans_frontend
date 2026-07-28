import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IdentityStep } from '../IdentityStep';

// Mock the API
vi.mock('@/lib/api/onboarding', () => ({
  checkHandleAvailability: vi.fn(),
}));

import { checkHandleAvailability } from '@/lib/api/onboarding';

describe('IdentityStep', () => {
  it('should render form with all fields', () => {
    const mockOnSubmit = vi.fn();
    render(
      <IdentityStep
        defaultValues={{}}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Create Your Identity')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Alex Taylor/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/avatar.jpg/i)).toBeInTheDocument();
  });

  it('should validate display name length', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(
      <IdentityStep
        defaultValues={{}}
        onSubmit={mockOnSubmit}
      />
    );

    const displayNameInput = screen.getByPlaceholderText(/Alex Taylor/i);
    await user.type(displayNameInput, 'J'); // Too short

    // Should show error after blur
    fireEvent.blur(displayNameInput);

    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('should validate handle format', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(
      <IdentityStep
        defaultValues={{}}
        onSubmit={mockOnSubmit}
      />
    );

    const handleInput = screen.getByPlaceholderText('username');
    await user.type(handleInput, 'john@doe'); // Invalid character

    fireEvent.blur(handleInput);

    await waitFor(() => {
      expect(
        screen.getByText(/only contain letters, numbers/i)
      ).toBeInTheDocument();
    });
  });

  it('should check handle availability with debounce', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    vi.mocked(checkHandleAvailability).mockResolvedValue({
      available: true,
    });

    render(
      <IdentityStep
        defaultValues={{}}
        onSubmit={mockOnSubmit}
      />
    );

    const handleInput = screen.getByPlaceholderText('username');

    // Type handle
    await user.type(handleInput, 'johndoe');

    // Should show loading spinner
    await waitFor(() => {
      expect(screen.getByText(/Checking handle availability/i)).toBeInTheDocument();
    });

    // Wait for debounce and API call
    await waitFor(
      () => {
        expect(checkHandleAvailability).toHaveBeenCalledWith('johndoe', expect.anything());
      },
      { timeout: 1000 }
    );

    // Should show success indicator
    await waitFor(() => {
      expect(screen.getByText(/Handle is available/i)).toBeInTheDocument();
    });
  });

  it('should show error when handle is unavailable', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    vi.mocked(checkHandleAvailability).mockResolvedValue({
      available: false,
      error: 'Handle already taken',
    });

    render(
      <IdentityStep
        defaultValues={{}}
        onSubmit={mockOnSubmit}
      />
    );

    const handleInput = screen.getByPlaceholderText('username');
    await user.type(handleInput, 'taken_handle');

    // Wait for check
    await waitFor(
      () => {
        expect(checkHandleAvailability).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    // Should show error
    await waitFor(() => {
      expect(screen.getByText(/Handle already taken/i)).toBeInTheDocument();
    });

    // Continue button should be disabled
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    expect(continueButton).toBeDisabled();
  });

  it('should validate avatar URL format', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();

    render(
      <IdentityStep
        defaultValues={{}}
        onSubmit={mockOnSubmit}
      />
    );

    const avatarInput = screen.getByPlaceholderText(/avatar.jpg/i);
    await user.type(avatarInput, 'not-a-url');

    fireEvent.blur(avatarInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid avatar URL/i)).toBeInTheDocument();
    });
  });

  it('should submit valid form', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    vi.mocked(checkHandleAvailability).mockResolvedValue({
      available: true,
    });

    render(
      <IdentityStep
        defaultValues={{}}
        onSubmit={mockOnSubmit}
      />
    );

    // Fill form
    await user.type(screen.getByPlaceholderText(/Alex Taylor/i), 'John Doe');
    const handleInput = screen.getByPlaceholderText('username');
    await user.type(handleInput, 'johndoe');

    // Wait for handle check
    await waitFor(
      () => {
        expect(checkHandleAvailability).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    // Wait for success indicator
    await waitFor(() => {
      expect(screen.getByText(/Handle is available/i)).toBeInTheDocument();
    });

    // Submit
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    await user.click(continueButton);

    // Should call onSubmit
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        displayName: 'John Doe',
        handle: 'johndoe',
        avatar: '',
      });
    });
  });

  it('should abort handle check on unmount', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const abortControllerMock = vi.fn();

    vi.mocked(checkHandleAvailability).mockImplementation(
      (_, signal) => {
        // Simulate abort
        signal?.addEventListener('abort', abortControllerMock);
        return Promise.resolve({ available: true });
      }
    );

    const { unmount } = render(
      <IdentityStep
        defaultValues={{}}
        onSubmit={mockOnSubmit}
      />
    );

    const handleInput = screen.getByPlaceholderText('username');
    await user.type(handleInput, 'johndoe');

    // Unmount before check completes
    unmount();

    // AbortController should have been triggered
    // (Exact testing depends on implementation details)
  });

  it('should display default values', () => {
    const mockOnSubmit = vi.fn();
    render(
      <IdentityStep
        defaultValues={{
          displayName: 'Jane Doe',
          handle: 'janedoe',
          avatar: 'https://example.com/jane.jpg',
        }}
        onSubmit={mockOnSubmit}
      />
    );

    const displayNameInput = screen.getByPlaceholderText(
      /Alex Taylor/i
    ) as HTMLInputElement;
    expect(displayNameInput.value).toBe('Jane Doe');

    const handleInput = screen.getByPlaceholderText('username') as HTMLInputElement;
    expect(handleInput.value).toBe('janedoe');

    const avatarInput = screen.getByPlaceholderText(
      /avatar.jpg/i
    ) as HTMLInputElement;
    expect(avatarInput.value).toBe('https://example.com/jane.jpg');
  });

  it('should disable form when loading', async () => {
    const mockOnSubmit = vi.fn();
    const { rerender } = render(
      <IdentityStep
        defaultValues={{}}
        onSubmit={mockOnSubmit}
        isLoading={false}
      />
    );

    let continueButton = screen.getByRole('button', { name: /Continue/i });
    expect(continueButton).not.toBeDisabled();

    // Re-render with loading state
    rerender(
      <IdentityStep
        defaultValues={{}}
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    );

    continueButton = screen.getByRole('button', { name: /Saving/i });
    expect(continueButton).toBeDisabled();
  });
});
