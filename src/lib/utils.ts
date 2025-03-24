import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    description: 'Basic note generation with limits',
    price: 0,
    features: [
      'Generate up to 5 notes per day',
      'Basic subjects and topics',
      'Access to basic AI models',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    description: 'Enhanced note generation with more options',
    price: 9.99,
    features: [
      'Generate up to 50 notes per day',
      'All subjects and topics',
      'Access to advanced AI models',
      'Practice paper generation',
    ],
  },
  PRO: {
    name: 'Professional',
    description: 'Unlimited note generation with all features',
    price: 19.99,
    features: [
      'Unlimited note generation',
      'All subjects and topics',
      'Access to all AI models',
      'Customizable practice papers',
      'Priority support',
    ],
  },
};

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds
 * @returns The original promise result or rejects with timeout error
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
} 