'use client';

import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { ProfileView } from '@/components/profile/ProfileView';

export default function MyProfilePage() {
  const { profile } = useAuth();

  if (!profile) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  return <ProfileView targetProfile={profile} isOwnProfile={true} />;
}