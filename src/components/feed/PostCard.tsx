import { Heart, MessageSquare, Share2, MoreHorizontal, Bookmark, Repeat } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import Image from 'next/image';

interface PostCardProps {
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
}

export function PostCard({ author, content, image, timestamp, likes, comments, shares }: PostCardProps) {
  return (
    <Card className="glass border-white/5 rounded-3xl overflow-hidden floating-card mb-6">
      <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm hover:text-primary transition-colors cursor-pointer">{author.name}</span>
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">VERIFICADO</span>
            </div>
            <p className="text-xs text-muted-foreground">@{author.handle} • {timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent className="px-4 py-2 space-y-4">
        <p className="text-sm leading-relaxed">{content}</p>
        {image && (
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/5">
            <Image 
              src={image} 
              alt="Contenido del post" 
              fill 
              className="object-cover"
              data-ai-hint="post image"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between p-4 border-t border-white/5">
        <div className="flex items-center gap-1 sm:gap-4">
          <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:text-red-500 hover:bg-red-500/10 group">
            <Heart className="w-4 h-4 group-hover:fill-current" />
            <span className="text-xs font-medium">{likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:text-primary hover:bg-primary/10">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-medium">{comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:text-green-500 hover:bg-green-500/10">
            <Repeat className="w-4 h-4" />
            <span className="text-xs font-medium">{shares}</span>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full hover:text-primary">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:text-primary">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
