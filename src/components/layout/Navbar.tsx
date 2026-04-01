
'use client';

import { Bell, MessageSquare, Plus, Search, User, Sparkles, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export function Navbar() {
  const avatar = PlaceHolderImages.find(img => img.id === 'avatar-user');

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/10 px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center electric-glow rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent tracking-tighter">
            NOVA
          </span>
        </Link>
        
        <div className="hidden md:flex relative w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-12 h-11 bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 transition-all rounded-2xl" 
            placeholder="Descubre el universo Nova..." 
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/20 hover:text-primary transition-all w-11 h-11">
          <Plus className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/20 hover:text-primary transition-all relative w-11 h-11">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background animate-pulse" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/20 hover:text-primary transition-all w-11 h-11">
          <Bell className="w-5 h-5" />
        </Button>
        
        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />
        
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold group-hover:text-primary transition-colors">Alex Rivera</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Online</span>
            </div>
          </div>
          <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary transition-all ring-offset-background group-hover:ring-4 ring-primary/10">
            <AvatarImage src={avatar?.imageUrl} alt="Usuario" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
}
