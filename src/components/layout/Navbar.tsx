import { Bell, MessageSquare, Plus, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function Navbar() {
  const avatar = PlaceHolderImages.find(img => img.id === 'avatar-user');

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-white/5 px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tighter cursor-pointer">
          NOVASPHERE
        </div>
        <div className="hidden md:flex relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 bg-secondary/50 border-none focus-visible:ring-primary/30" 
            placeholder="Search the sphere..." 
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
          <Plus className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all relative">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
          <Bell className="w-5 h-5" />
        </Button>
        
        <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />
        
        <div className="flex items-center gap-3 ml-2 cursor-pointer group">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold group-hover:text-primary transition-colors">Alex Rivera</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Premium</span>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/20 group-hover:border-primary transition-all ring-offset-background group-hover:ring-2 ring-primary/20">
            <AvatarImage src={avatar?.imageUrl} alt="User" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}
