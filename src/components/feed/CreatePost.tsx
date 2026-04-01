import { Image as ImageIcon, MapPin, Smile, Send, Film, BarChart3 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function CreatePost() {
  const avatar = PlaceHolderImages.find(img => img.id === 'avatar-user');

  return (
    <div className="glass border-white/5 rounded-3xl p-4 mb-8">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarImage src={avatar?.imageUrl} alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea 
            placeholder="What's happening in your sphere?" 
            className="bg-transparent border-none focus-visible:ring-0 text-lg resize-none min-h-[100px] p-0 placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10">
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-accent hover:bg-accent/10">
                <Film className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary">
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary">
                <MapPin className="w-5 h-5" />
              </Button>
            </div>
            <Button className="rounded-full bg-primary hover:bg-primary/90 px-6 gap-2 font-bold shadow-lg shadow-primary/20">
              Post <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
