'use client';

import { useEffect, useState } from 'react';
import { CreatePost } from '@/components/feed/CreatePost';
import { PostCard } from '@/components/feed/PostCard';
import { StoryList } from '@/components/stories/StoryList';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subscribeToPosts, Post } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { profile, user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const unsubscribe = subscribeToPosts((newPosts) => {
      setPosts(newPosts);
      setLoading(false);
    }, (error) => {
      setLoading(false);
    });

    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [user, authLoading, router]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303]">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-[1400px] mx-auto items-start justify-center">
        {/* Main Feed Column */}
        <div className="flex-1 max-w-3xl w-full space-y-8 animate-fade-in relative z-10">
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Destellos <span className="text-primary italic animate-pulse">•</span></h1>
                <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">En Vivo</span>
             </div>
             <StoryList />
          </div>

          <CreatePost />

          <div className="space-y-6">
            <div className="flex items-center gap-6 px-4 mb-4 border-b border-white/5 pb-2">
              <Button variant="ghost" className="text-[13px] font-black text-primary border-b-4 border-primary rounded-none px-0 h-10 hover:bg-transparent">Para ti</Button>
              <Button variant="ghost" className="text-[13px] font-black text-muted-foreground hover:text-white transition-all px-0 h-10 hover:bg-transparent uppercase tracking-tighter">Siguiendo</Button>
            </div>
            
            {loading ? (
              <div className="space-y-8">
                {[1, 2, 3].map((v) => (
                  <div key={v} className="bg-[#050510]/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-2xl bg-white/5" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-white/5" />
                        <Skeleton className="h-3 w-20 bg-white/5" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
                    <Skeleton className="h-[300px] w-full rounded-3xl bg-white/5" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-24 bg-[#050510]/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 space-y-6 flex flex-col items-center shadow-2xl">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-float relative">
                   <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                   <Sparkles className="w-12 h-12 text-primary opacity-80" />
                </div>
                <div>
                  <p className="text-2xl font-black uppercase tracking-tighter text-white">Tu feed está vacío</p>
                  <p className="text-sm text-muted-foreground font-medium mt-1">Conéctate con otros exploradores para ver qué está pasando.</p>
                </div>
                <Button 
                  onClick={() => router.push('/explore')}
                  className="rounded-2xl mt-4 bg-primary hover:bg-primary/80 text-white font-black uppercase tracking-widest text-[11px] h-12 px-8 shadow-xl shadow-primary/20"
                >
                  Explorar
                </Button>
              </div>
            ) : (
              posts.map((post, index) => (
                <PostCard 
                  key={post.id} 
                  id={post.id!}
                  priority={index < 2}
                  author={{
                    id: post.authorId || 'unknown',
                    name: post.authorName,
                    handle: post.authorHandle,
                    avatar: post.authorAvatar
                  }}
                  content={post.content}
                  image={post.imageUrl}
                  videoUrl={post.videoUrl}
                  poll={post.poll}
                  timestamp={post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : 'Recién publicado'}
                  likes={post.likes}
                  comments={post.comments}
                  shares={post.shares}
                  likedBy={post.likedBy}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="hidden lg:block">
           <RightSidebar />
        </div>
      </div>
  );
}
