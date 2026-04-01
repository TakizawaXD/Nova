
'use client';

import { useState } from 'react';
import { Heart, MessageSquare, Share2, MoreHorizontal, Bookmark, Repeat, Send, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toggleLikePost, addComment, subscribeToComments, Comment } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PostCardProps {
  id?: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  likedBy?: string[];
}

export function PostCard({ id, author, content, image, timestamp, likes, comments: initialCommentsCount, shares, likedBy = [] }: PostCardProps) {
  const { user, profile } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(user ? likedBy.includes(user.uid) : false);

  const handleLike = async () => {
    if (!id || !user) return;
    try {
      await toggleLikePost(id, user.uid, isLiked);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like", error);
    }
  };

  const handleToggleComments = () => {
    if (!showComments && id) {
      subscribeToComments(id, (data) => setPostComments(data));
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!id || !user || !profile || !newComment.trim()) return;
    try {
      await addComment({
        postId: id,
        authorId: user.uid,
        authorName: profile.displayName,
        authorAvatar: profile.photoURL,
        text: newComment
      });
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment", error);
    }
  };

  return (
    <Card className="glass border-white/5 rounded-[2rem] overflow-hidden floating-card mb-6">
      <CardHeader className="flex flex-row items-center justify-between p-5 space-y-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm hover:text-primary transition-colors cursor-pointer">{author.name}</span>
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Verified</span>
            </div>
            <p className="text-xs text-muted-foreground">@{author.handle} • {timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-white/5">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent className="px-5 py-2 space-y-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        {image && (
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/5">
            <Image 
              src={image} 
              alt="Post content" 
              fill 
              className="object-cover"
              data-ai-hint="post image"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col border-t border-white/5 p-0">
        <div className="flex items-center justify-between p-4 w-full">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className={cn("gap-2 rounded-full transition-all px-4", isLiked ? "text-red-500 bg-red-500/10" : "hover:text-red-500 hover:bg-red-500/10 group")}
            >
              <Heart className={cn("w-4 h-4 transition-transform active:scale-150", isLiked && "fill-current")} />
              <span className="text-xs font-bold">{likes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleToggleComments}
              className={cn("gap-2 rounded-full transition-all px-4", showComments ? "text-primary bg-primary/10" : "hover:text-primary hover:bg-primary/10")}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-bold">{initialCommentsCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:text-green-500 hover:bg-green-500/10 px-4">
              <Repeat className="w-4 h-4" />
              <span className="text-xs font-bold">{shares}</span>
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full hover:text-primary transition-all">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:text-primary transition-all">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="w-full px-5 pb-5 animate-fade-in border-t border-white/5 pt-4">
            <div className="flex gap-3 mb-6">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.photoURL} />
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Escribe tu respuesta cuántica..." 
                  className="bg-white/5 border-white/10 rounded-xl h-10 text-xs"
                  onKeyPress={e => e.key === 'Enter' && handleAddComment()}
                />
                <Button onClick={handleAddComment} size="icon" className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/80 rounded-xl">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="max-h-[300px] pr-4">
              <div className="space-y-4">
                {postComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={comment.authorAvatar} />
                    </Avatar>
                    <div className="flex-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-black uppercase tracking-tighter">{comment.authorName}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { locale: es, addSuffix: true }) : 'Enviando...'}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
                {postComments.length === 0 && (
                  <p className="text-center text-[10px] text-muted-foreground uppercase font-black py-4">Sin comentarios todavía.</p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
