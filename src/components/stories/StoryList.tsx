import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function StoryList() {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'avatar-user');
  
  // Mock stories
  const stories = [
    { id: 1, name: 'Maya J.', avatar: 'https://picsum.photos/seed/s1/100/100', active: true },
    { id: 2, name: 'Leo K.', avatar: 'https://picsum.photos/seed/s2/100/100', active: true },
    { id: 3, name: 'Sarah S.', avatar: 'https://picsum.photos/seed/s3/100/100', active: false },
    { id: 4, name: 'David B.', avatar: 'https://picsum.photos/seed/s4/100/100', active: true },
    { id: 5, name: 'Emma W.', avatar: 'https://picsum.photos/seed/s5/100/100', active: true },
    { id: 6, name: 'Chris T.', avatar: 'https://picsum.photos/seed/s6/100/100', active: false },
    { id: 7, name: 'Sophie L.', avatar: 'https://picsum.photos/seed/s7/100/100', active: true },
  ];

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 scroll-hide">
      <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
        <div className="relative h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground p-0.5 group-hover:border-primary transition-all">
          <Avatar className="h-full w-full">
            <AvatarImage src={userAvatar?.imageUrl} alt="My story" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-0.5 border-2 border-background">
            <Plus className="w-3 h-3" />
          </div>
        </div>
        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">My Story</span>
      </div>

      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group">
          <div className={`h-16 w-16 rounded-full p-0.5 border-2 transition-all ${story.active ? 'border-primary ring-2 ring-primary/20' : 'border-muted-foreground/30 grayscale opacity-50'}`}>
            <Avatar className="h-full w-full">
              <AvatarImage src={story.avatar} alt={story.name} />
              <AvatarFallback>{story.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{story.name}</span>
        </div>
      ))}
    </div>
  );
}
