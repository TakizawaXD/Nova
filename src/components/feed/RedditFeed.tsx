'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToActiveStories, Story, toggleLikeStory } from '@/lib/db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Share2, MoreHorizontal, ArrowBigUp, ArrowBigDown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function RedditFeed() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToActiveStories((data) => {
      setStories(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
     return (
        <div className="space-y-4">
            {[1, 2].map(v => (
                <div key={v} className="h-32 bg-white/5 rounded-3xl animate-pulse" />
            ))}
        </div>
     );
  }

  return (
    <div className="space-y-4">
      {stories.length === 0 ? (
        <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] p-10 text-center opacity-40">
            <Zap className="w-8 h-8 mx-auto mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sin Destellos Activos</p>
        </div>
      ) : (
        stories.map((story) => (
          <RedditPost key={story.id} story={story} userId={user?.uid} />
        ))
      )}
    </div>
  );
}

function RedditPost({ story, userId }: { story: Story, userId?: string }) {
  const isLiked = story.likedBy?.includes(userId || '');

  const handleLike = async () => {
    if (!userId || !story.id) return;
    await toggleLikeStory(story.id, userId, isLiked);
  };

  return (
    <div className="bg-[#0A0A15]/60 hover:bg-[#0F0F20]/80 border border-white/5 rounded-[2.2rem] transition-all duration-300 group flex">
      {/* Vote Rail (Reddit Style) */}
      <div className="w-12 bg-white/[0.02] flex flex-col items-center py-4 gap-1 border-r border-white/5">
        <button 
           onClick={handleLike}
           className={cn("p-1 rounded-md transition-colors", isLiked ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-white/10")}
        >
          <ArrowBigUp className={cn("w-6 h-6", isLiked && "fill-current")} />
        </button>
        <span className="text-[11px] font-black text-white px-1">
          {story.likes || 0}
        </span>
        <button className="p-1 rounded-md text-muted-foreground hover:bg-white/10 transition-colors">
          <ArrowBigDown className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Avatar className="h-6 w-6 border border-white/10">
                <AvatarImage src={story.authorAvatar} />
                <AvatarFallback className="text-[8px] bg-primary/20 text-primary">{story.authorName[0]}</AvatarFallback>
             </Avatar>
             <span className="text-[10px] font-black text-white/90 italic tracking-tight uppercase">
                {story.authorName} <span className="text-muted-foreground/40 font-medium ml-1">en Destellos</span>
             </span>
             <span className="text-muted-foreground/30">•</span>
             <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                {story.createdAt ? formatDistanceToNow(story.createdAt.toDate(), { locale: es }).replace('alrededor de', '') : 'Recién'}
             </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="space-y-4">
          {story.content && (
            <div className="relative rounded-xl border border-white/10 bg-black/20 shadow-inner">
               {story.type === 'video' ? (
                  <video 
                    src={story.content} 
                    controls 
                    className="w-full h-auto block" 
                  />
               ) : (
                  <img 
                    src={story.content} 
                    alt="Destello NOVAX" 
                    className="w-full h-auto block select-none" 
                  />
               )}
            </div>
          )}
          {story.title && (
            <p className="text-sm font-bold text-white leading-relaxed italic-nova">
              {story.title}
            </p>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-6 pt-2">
           <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Debatir</span>
           </button>
           <button className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Emitir</span>
           </button>
        </div>
      </div>
    </div>
  );
}
