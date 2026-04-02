'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, UserX } from 'lucide-react';
import { ProfileView } from '@/components/profile/ProfileView';
import { getUserProfile, UserProfile } from '@/lib/db';
import { Card } from '@/components/ui/card';

export default function UserProfilePage() {
  const params = useParams();
  const uid = params?.uid as string;
  const { user } = useAuth();
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uid) {
      getUserProfile(uid)
        .then(setTargetProfile)
        .finally(() => setLoading(false));
    }
  }, [uid]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );

  if (!targetProfile) return (
    <div className="flex items-center justify-center h-screen px-6">
      <Card className="glass border-white/5 p-12 rounded-[3rem] text-center max-w-lg space-y-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <UserX className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Nodo Inexistente</h1>
        <p className="text-muted-foreground font-medium">El usuario con ID #{uid.substring(0,6).toUpperCase()} no ha sido localizado en la red NovaSphere.</p>
      </Card>
    </div>
  );

  return (
    <ProfileView 
      targetProfile={targetProfile} 
      isOwnProfile={user?.uid === targetProfile.uid} 
    />
  );
}
