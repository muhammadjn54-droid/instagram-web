'use client';

import React from 'react';
import AuthHero from '@/components/auth/AuthHero';
import AuthCard from '@/components/auth/AuthCard';
import AuthFooter from '@/components/auth/AuthFooter';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-[#0095F6]/20">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 md:py-12">
        <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="flex justify-center lg:justify-start">
            <AuthHero />
          </div>
          <div className="flex justify-center lg:justify-end">
            <AuthCard initialMode="register" onSuccess={() => router.push('/')} />
          </div>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}
