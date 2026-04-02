'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldHomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirección de seguridad para evitar conflictos de ruta
    router.replace('/home');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#030303]" />
  );
}
