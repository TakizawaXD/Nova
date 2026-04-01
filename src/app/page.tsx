'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from './(dashboard)/layout';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostCard } from '@/components/feed/PostCard';
import { StoryList } from '@/components/stories/StoryList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Users, Zap, PlusCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { subscribeToPosts, Post } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { profile, user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Si la carga de auth terminó y no hay usuario, redirigir a login inmediatamente
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const unsubscribe = subscribeToPosts((newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    }, (error) => {
      setLoading(false); // Evitar carga infinita en caso de error
    });

    // Fallback de seguridad para no quedar en carga infinita
    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [user, authLoading, router]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feed Principal */}
        <div className="lg:col-span-8 animate-fade-in space-y-8">
          <div className="flex items-center justify-between mb-2 px-2">
            <h2 className="text-xl font-black tracking-tighter flex items-center gap-2">
              HISTORIAS
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </h2>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/10">Ver todas</Button>
          </div>
          <StoryList />
          <CreatePost />
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 px-2 mb-4">
              <Button variant="ghost" className="text-sm font-black text-primary border-b-2 border-primary rounded-none px-0">Para ti</Button>
              <Button variant="ghost" className="text-sm font-bold text-muted-foreground hover:text-white transition-all px-0">Siguiendo</Button>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-bold tracking-tighter uppercase text-xs">Sincronizando con el Universo Nova...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-24 glass rounded-[2.5rem] border-white/5 space-y-4 flex flex-col items-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-float">
                   <Sparkles className="w-10 h-10 text-primary opacity-50" />
                </div>
                <div>
                  <p className="text-lg font-black uppercase tracking-tighter">Tu feed está vacío</p>
                  <p className="text-sm text-muted-foreground">Sé el primero en compartir algo con el mundo.</p>
                </div>
                <Button className="rounded-xl mt-4 bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all">Seguir Exploradores</Button>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  id={post.id}
                  author={{
                    name: post.authorName,
                    handle: post.authorHandle,
                    avatar: post.authorAvatar
                  }}
                  content={post.content}
                  image={post.imageUrl}
                  timestamp={post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString('es-ES') : 'Recién publicado'}
                  likes={post.likes}
                  comments={post.comments}
                  shares={post.shares}
                  likedBy={post.likedBy}
                />
              ))
            )}
          </div>
        </div>

        {/* Widgets Laterales */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <Card className="glass border-white/10 rounded-[2rem] overflow-hidden group shadow-2xl">
            <div className="h-24 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 animate-pulse group-hover:scale-110 transition-transform duration-700" />
            <CardHeader className="p-6 relative">
              <div className="absolute -top-12 left-6">
                <Avatar className="h-20 w-20 border-4 border-background shadow-2xl electric-glow">
                  <AvatarImage src={profile?.photoURL} />
                  <AvatarFallback>{profile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </div>
              <div className="pt-8">
                <CardTitle className="text-2xl font-black tracking-tighter uppercase">{profile?.displayName || 'Ciudadano Nova'}</CardTitle>
                <p className="text-sm text-muted-foreground font-medium">@{profile?.username || 'usuario'}</p>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="flex gap-6">
                <div><p className="font-black text-lg">{profile?.followersCount || 0}</p><p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Seguidores</p></div>
                <div><p className="font-black text-lg">{profile?.followingCount || 0}</p><p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Siguiendo</p></div>
                <div><p className="font-black text-lg text-primary">Nova+</p><p className="text-[10px] text-primary uppercase font-bold tracking-widest">Miembro</p></div>
              </div>
              <Button 
                onClick={() => router.push('/profile')}
                className="w-full rounded-2xl bg-white/5 border border-white/10 hover:bg-primary hover:text-white transition-all font-black text-xs uppercase tracking-[0.2em] h-12"
              >
                Mi Perfil Completo
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 rounded-[2rem] p-6 electric-glow shadow-xl">
            <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter">
                <TrendingUp className="w-5 h-5 text-primary" />
                TENDENCIAS
              </CardTitle>
              <Zap className="w-4 h-4 text-accent animate-pulse" />
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              {[
                { topic: '#NovaSphere', count: '145.2k posts', color: 'text-primary' },
                { topic: '#Ciberpunk2030', count: '82.8k posts', color: 'text-accent' },
                { topic: 'IA Generativa', count: '58.4k posts', color: 'text-white' },
              ].map((trend, i) => (
                <div key={i} className="group cursor-pointer flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Tecnología</p>
                    <p className={cn("text-sm font-black transition-all group-hover:translate-x-1", trend.color)}>{trend.topic}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{trend.count}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                    <PlusCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-[10px] font-black text-white uppercase tracking-[0.3em] rounded-2xl transition-all border border-white/5">Explorar Tendencias</button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
