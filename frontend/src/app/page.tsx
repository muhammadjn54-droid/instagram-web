'use client';

import React, { useEffect, useState } from 'react';
import AuthHero from '@/components/auth/AuthHero';
import AuthCard from '@/components/auth/AuthCard';
import AuthFooter from '@/components/auth/AuthFooter';
import LoggedInView from '@/components/feed/LoggedInView';
import { getAuthToken } from '@/lib/auth';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    setIsLoggedIn(!!token);
  }, []);

  // Avoid flash before hydration
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-[#0095F6] rounded-full animate-spin" />
      </div>
    );
  }

  // If already logged in, show Feed / Dashboard
  if (isLoggedIn) {
    return <LoggedInView onLogout={() => setIsLoggedIn(false)} />;
  }

  // Not logged in: Show Instagram Login/Register page matching design
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-[#0095F6]/20">
      {/* Main Split Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 md:py-12">
        <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Column: Hero Graphic and Headline */}
          <div className="flex justify-center lg:justify-start">
            <AuthHero />
          </div>

          {/* Right Column: Auth Card */}
          <div className="flex justify-center lg:justify-end">
            <AuthCard onSuccess={() => setIsLoggedIn(true)} />
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <AuthFooter />
    </div>
  );
}
