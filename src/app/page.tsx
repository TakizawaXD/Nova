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
      <div className="max-w-2xl mx-auto w-full my-8 animate-fade-in space-y-8">
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
    </DashboardLayout>
  );
}
