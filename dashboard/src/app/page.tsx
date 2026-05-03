'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-nature-50 dark:bg-dark-bg">
      <div className="animate-pulse text-nature-forest font-bold">Initializing KLB Connect...</div>
    </div>
  );
}
