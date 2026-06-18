/**
 * Validation utilities for authentication forms
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationError | null {
  if (!email.trim()) {
    return { field: "email", message: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: "email", message: "Please enter a valid email address" };
  }

  return null;
}

/**
 * Validate password (minimum 8 characters)
 */
export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: "password", message: "Password is required" };
  }

  if (password.length < 8) {
    return { field: "password", message: "Password must be at least 8 characters" };
  }

  return null;
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(
  password: string,
  confirmation: string
): ValidationError | null {
  if (!confirmation) {
    return { field: "passwordConfirmation", message: "Please confirm your password" };
  }

  if (password !== confirmation) {
    return { field: "passwordConfirmation", message: "Passwords do not match" };
  }

  return null;
}

/**
 * Validate name/display name
 */
export function validateName(name: string, fieldName: string = "name"): ValidationError | null {
  if (!name.trim()) {
    return { field: fieldName, message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required` };
  }

  if (name.trim().length < 2) {
    return { field: fieldName, message: "Name must be at least 2 characters" };
  }

  if (name.trim().length > 100) {
    return { field: fieldName, message: "Name must be less than 100 characters" };
  }

  return null;
}

/**
 * Validate entire login form
 */
export function validateLoginForm(email: string, password: string): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  return errors;
}

/**
 * Validate entire signup form
 */
export function validateSignupForm(
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string
): ValidationError[] {
  const errors: ValidationError[] = [];

  const nameError = validateName(name);
  if (nameError) errors.push(nameError);

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  const confirmError = validatePasswordConfirmation(password, passwordConfirmation);
  if (confirmError) errors.push(confirmError);

  return errors;
}

/**
 * Get error message for a specific field
 */
export function getFieldError(errors: ValidationError[], field: string): string | null {
  return errors.find((e) => e.field === field)?.message || null;
}
