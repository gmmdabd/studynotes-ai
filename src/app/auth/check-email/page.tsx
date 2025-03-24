'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function CheckEmail() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent you a confirmation email. Please check your inbox and click the verification link to complete your registration.
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <p className="text-gray-700 mb-6">
            After verification, you'll be able to sign in to your account.
          </p>
          
          <div className="mt-6">
            <Link href="/auth/login">
              <Button variant="primary" className="px-6">
                Go to login
              </Button>
            </Link>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Didn't receive an email?{' '}
              <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Try signing up again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 