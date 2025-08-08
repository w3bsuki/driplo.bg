import { z } from 'zod';

// Username validation rule
const usernameRule = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

// Base validation rules for onboarding
const onboardingRules = {
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
    
  bio: z.string()
    .max(160, 'Bio must be less than 160 characters')
    .trim()
    .optional(),
    
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .trim()
    .optional(),
    
  accountType: z.enum(['personal', 'brand'], {
    errorMap: () => ({ message: 'Please select a valid account type' })
  }),
  
  brandName: z.string()
    .min(2, 'Brand name must be at least 2 characters')
    .max(50, 'Brand name must be less than 50 characters')
    .trim(),
    
  brandDescription: z.string()
    .min(10, 'Brand description must be at least 10 characters')
    .max(500, 'Brand description must be less than 500 characters')
    .trim(),
    
  socialMediaUrl: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
    
  paymentTag: z.string()
    .regex(/^@[a-zA-Z0-9_]+$/, 'Tag must start with @ and contain only letters, numbers, and underscores')
    .min(2, 'Tag must be at least 2 characters')
    .max(20, 'Tag must be less than 20 characters')
    .optional()
    .or(z.literal(''))
};

// Individual step schemas for progressive validation
export const onboardingSchemas = {
  // Step 1: Username (conditional)
  username: z.object({
    username: usernameRule
  }),
  
  // Step 2: Account Type
  accountType: z.object({
    accountType: onboardingRules.accountType
  }),
  
  // Step 3: Avatar (optional - handled via file upload)
  avatar: z.object({
    avatarUrl: z.string().url().optional(),
    customAvatarFile: z.instanceof(File).optional()
  }),
  
  // Step 4: Personal Information
  personalInfo: z.object({
    fullName: onboardingRules.fullName,
    bio: onboardingRules.bio,
    location: onboardingRules.location
  }),
  
  // Step 5: Payment Methods (optional)
  paymentMethods: z.object({
    selectedMethods: z.array(z.string()).optional(),
    revolut_tag: onboardingRules.paymentTag,
    paypal_tag: onboardingRules.paymentTag
  }),
  
  // Step 6: Brand Information (conditional)
  brandInfo: z.object({
    brandName: onboardingRules.brandName,
    brandDescription: onboardingRules.brandDescription,
    socialMediaAccounts: z.array(z.object({
      platform: z.enum(['instagram', 'facebook', 'twitter', 'tiktok']),
      username: z.string().min(1, 'Username is required'),
      url: onboardingRules.socialMediaUrl
    })).optional()
  })
};

// Complete onboarding form schema
export const completeOnboardingSchema = z.object({
  // Required fields
  username: usernameRule.optional(), // Only if needs_username_setup
  accountType: onboardingRules.accountType,
  fullName: onboardingRules.fullName,
  
  // Optional fields
  bio: onboardingRules.bio,
  location: onboardingRules.location,
  avatarUrl: z.string().url().optional(),
  
  // Payment methods (optional)
  paymentMethods: z.array(z.string()).optional(),
  revolut_tag: onboardingRules.paymentTag,
  paypal_tag: onboardingRules.paymentTag,
  
  // Brand fields (conditional on accountType)
  brandName: onboardingRules.brandName.optional(),
  brandDescription: onboardingRules.brandDescription.optional(),
  socialMediaAccounts: z.array(z.object({
    platform: z.enum(['instagram', 'facebook', 'twitter', 'tiktok']),
    username: z.string(),
    url: onboardingRules.socialMediaUrl
  })).optional()
}).refine(
  (data) => {
    // If account type is brand, require brand fields
    if (data.accountType === 'brand') {
      return data.brandName && data.brandDescription;
    }
    return true;
  },
  {
    message: 'Brand name and description are required for brand accounts',
    path: ['brandName']
  }
);

// Form field validators for real-time validation
export const onboardingValidators = {
  username: (value: string) => {
    const result = usernameRule.safeParse(value);
    return result.success ? null : result.error.issues[0]?.message || 'Invalid username';
  },
  
  fullName: (value: string) => {
    const result = onboardingRules.fullName.safeParse(value);
    return result.success ? null : result.error.issues[0]?.message || 'Invalid name';
  },
  
  bio: (value: string) => {
    const result = onboardingRules.bio.safeParse(value);
    return result.success ? null : result.error.issues[0]?.message || 'Invalid bio';
  },
  
  brandName: (value: string) => {
    const result = onboardingRules.brandName.safeParse(value);
    return result.success ? null : result.error.issues[0]?.message || 'Invalid brand name';
  },
  
  brandDescription: (value: string) => {
    const result = onboardingRules.brandDescription.safeParse(value);
    return result.success ? null : result.error.issues[0]?.message || 'Invalid description';
  },
  
  paymentTag: (value: string) => {
    if (!value) return null; // Optional field
    const result = onboardingRules.paymentTag.safeParse(value);
    return result.success ? null : result.error.issues[0]?.message || 'Invalid payment tag';
  },
  
  socialMediaUrl: (value: string) => {
    if (!value) return null; // Optional field
    const result = onboardingRules.socialMediaUrl.safeParse(value);
    return result.success ? null : result.error.issues[0]?.message || 'Invalid URL';
  }
};

// Type exports for TypeScript
export type OnboardingFormData = z.infer<typeof completeOnboardingSchema>;
export type UsernameFormData = z.infer<typeof onboardingSchemas.username>;
export type AccountTypeFormData = z.infer<typeof onboardingSchemas.accountType>;
export type PersonalInfoFormData = z.infer<typeof onboardingSchemas.personalInfo>;
export type PaymentMethodsFormData = z.infer<typeof onboardingSchemas.paymentMethods>;
export type BrandInfoFormData = z.infer<typeof onboardingSchemas.brandInfo>;

// Default form values
export const defaultOnboardingValues: Partial<OnboardingFormData> = {
  username: '',
  accountType: 'personal',
  fullName: '',
  bio: '',
  location: '',
  avatarUrl: null,
  paymentMethods: [],
  revolut_tag: '',
  paypal_tag: '',
  socialMediaAccounts: []
};

// Form step validation helpers
export const validateStep = {
  username: (data: unknown) => onboardingSchemas.username.safeParse(data),
  accountType: (data: unknown) => onboardingSchemas.accountType.safeParse(data),
  personalInfo: (data: unknown) => onboardingSchemas.personalInfo.safeParse(data),
  paymentMethods: (data: unknown) => onboardingSchemas.paymentMethods.safeParse(data),
  brandInfo: (data: unknown) => onboardingSchemas.brandInfo.safeParse(data)
};

// Progress calculation helper
export const calculateProgress = (data: Partial<OnboardingFormData>): number => {
  let completed = 0;
  let total = 3; // accountType, fullName are always required, avatar is always optional
  
  // Required steps
  if (data.accountType) completed++;
  if (data.fullName && data.fullName.length >= 2) completed++;
  
  // Always count avatar as completed (it's optional)
  completed++;
  
  // Conditional brand step
  if (data.accountType === 'brand') {
    total++;
    if (data.brandName && data.brandDescription) completed++;
  }
  
  return Math.round((completed / total) * 100);
};

// Export all schemas and utilities
export default {
  schemas: onboardingSchemas,
  complete: completeOnboardingSchema,
  validators: onboardingValidators,
  defaults: defaultOnboardingValues,
  validateStep,
  calculateProgress
};