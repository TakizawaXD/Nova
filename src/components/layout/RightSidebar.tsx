'use client';

import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, MoreHorizontal, Sparkles, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { subscribeToUserFollowing, UserProfile } from '@/lib/db';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function RightSidebar() {
  const { profile } = useAuth();
  const router = useRouter();
  const [following, setFollowing] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (profile?.uid) {
      const unsub = subscribeToUserFollowing(profile.uid, setFollowing);
      return () => unsub();
    }
  }, [profile?.uid]);

  const trends = [
    { category: 'TECNOLOGÍA', tag: '#NOVAX', posts: '145.2k' },
    { category: 'TECNOLOGÍA', tag: '#Ciberpunk2030', posts: '82.8k' },
    { category: 'TECNOLOGÍA', tag: 'IA Generativa', posts: '58.4k' },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-80 shrink-0 sticky top-24 h-fit pb-12">
      {/* 1. Profile Minicard */}
      <Card className="bg-[#050510]/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden p-6 pt-12 relative group transition-all hover:border-primary/20">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-transparent -z-10" />
        
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-[#050510] shadow-2xl mb-4 group-hover:scale-105 transition-transform">
            <AvatarImage src={profile?.photoURL} className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-black uppercase tracking-tighter text-white mb-1">
            {profile?.displayName || 'Explorador NOVAX'}
          </h2>
          <p className="text-sm text-muted-foreground font-medium mb-6">
            @{profile?.username || 'usuario'}
          </p>
          
          <Button 
            onClick={() => router.push('/profile')}
            className="w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-[1.25rem] border border-white/5"
          >
            </Button>
        </div>
      </Card>

      {/* 1.5. Nodos / Amigos Widget (Dynamic) */}
      <Card className="bg-[#050510]/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 transition-all hover:border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Nodos <span className="text-primary">/ Amigos</span></h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">{following.length} Conectados</p>
          </div>
          <Button variant="link" onClick={() => router.push('/friends')} className="text-primary font-black uppercase tracking-widest text-[9px] p-0 h-auto hover:no-underline hover:text-primary/70">Todos</Button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {following.length > 0 ? following.slice(0, 9).map((f) => (
            <Link key={f.uid} href={`/profile/${f.uid}`} className="space-y-1.5 group/node cursor-pointer text-center">
              <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 group-hover/node:border-primary/50 group-hover/node:shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={f.photoURL} alt={f.displayName} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-black">{f.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div className={cn(
                    "absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-black",
                    f.status === 'online' ? "bg-green-500" : 
                    f.status === 'idle' ? "bg-amber-500" : 
                    "bg-zinc-500"
                )} />
              </div>
              <p className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground truncate group-hover/node:text-white transition-colors">{f.displayName}</p>
            </Link>
          )) : (
            [1,2,3,4,5,6].map((i) => (
              <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center opacity-10">
                <PlusCircle className="w-4 h-4" />
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 2. Trending Card */}
      <Card className="bg-[#050510]/60 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-6 transition-all hover:border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Tendencias</h2>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {trends.map((trend, i) => (
            <div key={i} className="group cursor-pointer">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{trend.category}</p>
              <h3 className="text-sm font-black text-white group-hover:text-primary transition-colors">{trend.tag}</h3>
              <p className="text-[10px] text-muted-foreground font-bold mt-0.5">{trend.posts} posts</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Footer Links (Nova Style) */}
      <div className="px-6 space-y-2 opacity-30 group hover:opacity-100 transition-opacity">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
          <a href="#" className="hover:text-primary">Privacidad</a>
          <a href="#" className="hover:text-primary">Términos</a>
          <a href="#" className="hover:text-primary">Cookies</a>
          <a href="#" className="hover:text-primary">Más</a>
        </div>
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">© 2026 NOVAX Ecosystem</p>
      </div>
    </aside>
  );
}
