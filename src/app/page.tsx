'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LandingPage from '@/components/landing/LandingPage';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si el usuario ya está logueado, lo enviamos al dashboard directamente
    if (!loading && user) {
      router.replace('/home');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030303]">
        <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostramos la Landing Page Elite
  if (!user) {
    return <LandingPage />;
  }

  // Fallback visual mientras se procesa el redirect si el usuario existe
  return (
    <div className="min-h-screen bg-[#030303]" />
  );
}
