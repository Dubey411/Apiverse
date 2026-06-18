import { Suspense } from 'react';
import LandingFooter from '@/app/landing-page/components/LandingFooter';
import LoginExperience from '@/app/login/LoginExperience';
import LandingNav from '@/components/LandingNav';

export const metadata = {
  title: 'Sign In — APIverse',
  description: 'Sign in to your APIverse workspace with Google, GitHub, or LinkedIn.',
};

export default function LoginPage() {
  // Route-level redirect (logged-in → dashboard) is handled by middleware.
  // No server-side cookie check needed here anymore.
  return (
    <div className="min-h-screen">
      <LandingNav />
      {/* Suspense is required because LoginExperience uses useSearchParams() */}
      <Suspense>
        <LoginExperience />
      </Suspense>
      <LandingFooter />
    </div>
  );
}
