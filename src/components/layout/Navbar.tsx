'use client';

import { Bell, MessageSquare, Plus, Search, User, Sparkles, LayoutGrid, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { profile, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/10 px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8 lg:gap-12">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center electric-glow rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-primary/40">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-white via-primary to-accent bg-clip-text text-transparent tracking-tighter">
            NOVA
          </span>
        </Link>
        
        <div className="hidden md:flex relative w-64 lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-12 h-11 bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 transition-all rounded-2xl placeholder:text-muted-foreground/40 text-sm" 
            placeholder="Descubre el universo Nova..." 
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/20 hover:text-primary transition-all w-11 h-11 hidden sm:flex">
          <Plus className="w-5 h-5" />
        </Button>
        <Button onClick={() => router.push('/messages')} variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/20 hover:text-primary transition-all relative w-11 h-11">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background animate-pulse" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/20 hover:text-primary transition-all w-11 h-11">
          <Bell className="w-5 h-5" />
        </Button>
        
        <div className="h-8 w-px bg-white/10 mx-1 sm:mx-2 hidden sm:block" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 pl-2 cursor-pointer group">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-bold group-hover:text-primary transition-colors">{profile?.displayName?.split(' ')[0] || 'Usuario'}</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Conectado</span>
                </div>
              </div>
              <Avatar className="h-10 w-10 border-2 border-primary/20 group-hover:border-primary transition-all ring-offset-background group-hover:ring-4 ring-primary/10">
                <AvatarImage src={profile?.photoURL} alt="Usuario" />
                <AvatarFallback>{profile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass border-white/10 rounded-2xl mt-2 p-2">
            <DropdownMenuLabel className="font-black uppercase tracking-widest text-[10px] text-muted-foreground px-3 py-2">Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-xl cursor-pointer py-2 px-3 focus:bg-primary/20 gap-3 font-bold">
              <User className="w-4 h-4" /> Ver Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-xl cursor-pointer py-2 px-3 focus:bg-primary/20 gap-3 font-bold">
              <LayoutGrid className="w-4 h-4" /> Ajustes
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10 my-1" />
            <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer py-2 px-3 focus:bg-red-500/20 text-red-500 gap-3 font-bold">
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
