'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CreatePost } from '@/components/feed/CreatePost';
import { subscribeToPosts, Post } from '@/lib/db';

export default function ExplorePage() {
  const [recommendations, setRecommendations] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPosts((posts) => {
      setRecommendations(posts);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-2 md:gap-3 leading-none uppercase italic">
            EXPLORA TU <span className="text-primary truncate">MUNDO</span>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-accent animate-pulse shrink-0" />
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">Mapeo de red curado por el núcleo Nova.</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          disabled={loading}
          variant="outline" 
          className="rounded-xl glass border-primary/20 text-primary hover:bg-primary/10 gap-2 h-12 md:h-auto text-xs md:text-sm font-black uppercase tracking-widest"
        >
          <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refrescar Red
        </Button>
      </div>

      <CreatePost />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass border-white/5 rounded-3xl h-[400px]">
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-[200px] w-full rounded-2xl" />
              </div>
            </Card>
          ))
        ) : (
          recommendations.map((post: Post) => (
            <Card key={post.id} className="glass border-white/5 rounded-3xl overflow-hidden floating-card group cursor-pointer flex flex-col">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                {post.imageUrl && !post.videoUrl && (
                  <img 
                    src={post.imageUrl} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    alt="Visual del post"
                  />
                )}
                {post.videoUrl && (
                  <video 
                    src={post.videoUrl} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    muted 
                    autoPlay 
                    loop 
                    playsInline
                  />
                )}
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">PULSO SOCIAL</span>
                </div>
              </div>
              <CardHeader className="p-6 flex-1">
                <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 uppercase italic tracking-tighter">
                  {post.content.substring(0, 40)}...
                </CardTitle>
                <CardDescription className="mt-4 line-clamp-3 text-sm font-medium border-l-2 border-accent pl-4 text-foreground/80">
                  "{post.content}"
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-white/10">
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate max-w-[100px]">@{post.authorHandle}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full gap-2 hover:bg-primary/10 hover:text-primary font-black text-[10px] uppercase tracking-widest">
                    Explorar <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
