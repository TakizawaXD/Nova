
'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { subscribeToActiveStories, createStory, Story } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

export function StoryList() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToActiveStories((data) => {
      setStories(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddStory = async () => {
    if (!user || !profile) return;
    try {
      // Usamos una imagen de picsum por ahora como demostración
      const mockImage = `https://picsum.photos/seed/${Math.random()}/1080/1920`;
      await createStory(user.uid, profile.displayName, profile.photoURL, mockImage);
      toast({
        title: "Historia publicada",
        description: "Tu historia será visible por 24 horas.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo publicar la historia.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4 overflow-x-auto pb-4 scroll-hide">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 scroll-hide">
      <div 
        onClick={handleAddStory}
        className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
      >
        <div className="relative h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground p-0.5 group-hover:border-primary transition-all">
          <Avatar className="h-full w-full">
            <AvatarImage src={profile?.photoURL} alt="Mi historia" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-0.5 border-2 border-background">
            <Plus className="w-3 h-3" />
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">Añadir</span>
      </div>

      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
          <div className="h-16 w-16 rounded-full p-0.5 border-2 border-primary ring-2 ring-primary/20 transition-all">
            <Avatar className="h-full w-full">
              <AvatarImage src={story.authorAvatar} alt={story.authorName} />
              <AvatarFallback>{story.authorName[0]}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate w-16 text-center">
            {story.authorName.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  );
}
