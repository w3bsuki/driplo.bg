import { z } from 'zod';

// Completely isolated onboarding schemas - no external imports

// Username validation rule
const usernameRule = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

// Base validation rules
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

// Complete onboarding form schema - isolated
export const isolatedOnboardingSchema = z.object({
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

// Type exports
export type IsolatedOnboardingFormData = z.infer<typeof isolatedOnboardingSchema>;

// Default form values - isolated
export const isolatedOnboardingDefaults: Partial<IsolatedOnboardingFormData> = {
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

// Progress calculation helper - isolated
export const calculateIsolatedProgress = (data: Partial<IsolatedOnboardingFormData>): number => {
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