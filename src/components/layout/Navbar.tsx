'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, Plus, Search, User, Sparkles, LayoutGrid, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
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
import { subscribeToNotifications, markNotificationAsRead, type Notification as AppNotification } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function Navbar() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadCount = useRef(0);

  const playNotificationSound = () => {
    try {
      if (typeof window !== 'undefined' && !(window as any)._novaUserInteracted) return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio autoplay silenciado
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const markInteracted = () => { (window as any)._novaUserInteracted = true; };
    window.addEventListener('click', markInteracted, { once: true });
    window.addEventListener('keydown', markInteracted, { once: true });
    window.addEventListener('touchstart', markInteracted, { once: true });

    if (!user) return;
    const unsub = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
      const newUnreadCount = data.filter(n => !n.read).length;
      if (newUnreadCount > prevUnreadCount.current && newUnreadCount > 0) {
        playNotificationSound();
        if ('Notification' in window && Notification.permission === 'granted') {
          const latest = data.filter(n => !n.read)[0];
          new window.Notification('NovaSphere', { 
            body: latest?.content || 'Tienes nuevas alertas en la red.',
            icon: '/icons/icon-192x192.png'
          });
        }
      }
      prevUnreadCount.current = newUnreadCount;
      setUnreadCount(newUnreadCount);
    });
    return () => {
        unsub();
        window.removeEventListener('click', markInteracted);
        window.removeEventListener('keydown', markInteracted);
        window.removeEventListener('touchstart', markInteracted);
    };
  }, [user]);

  const handleNotificationClick = async (n: AppNotification) => {
    await markNotificationAsRead(n.id!);
    router.push(n.link);
  };
 
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#050510]/80 backdrop-blur-3xl border-b border-white/5 px-6 h-20 flex items-center justify-between">
      <div className="flex items-center gap-12 flex-1">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-500 hover:rotate-3">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-white tracking-tighter hidden sm:block">
            NOVA
          </span>
        </Link>
        
        <div className="hidden lg:flex relative flex-1 max-w-xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-14 h-14 bg-white/5 border-white/5 focus:bg-white/10 focus:border-white/10 transition-all rounded-[1.25rem] placeholder:text-muted-foreground/50 text-base" 
            placeholder="Descubre el universo Nova..." 
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-3 mr-2 sm:mr-4">
          <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all w-10 h-10 sm:w-12 sm:h-12">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <Button onClick={() => router.push('/messages')} variant="ghost" size="icon" className="rounded-2xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all relative w-10 h-10 sm:w-12 sm:h-12">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all w-10 h-10 sm:w-12 sm:h-12 relative flex">
                <Bell className={cn("w-5 h-5 sm:w-6 sm:h-6", unreadCount > 0 && "animate-bounce text-primary")} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full border-[2px] border-[#050510] text-[10px] font-black text-white flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '+99' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px] bg-[#050510]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] mt-4 p-4 shadow-2xl">
              <DropdownMenuLabel className="font-black uppercase tracking-widest text-xs mb-4 flex justify-between items-center text-white">
                Frecuencias Entrantes
                {unreadCount > 0 && <span className="bg-primary/20 text-primary text-[9px] px-2 py-0.5 rounded-full">{unreadCount} NUEVAS</span>}
              </DropdownMenuLabel>
              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                {notifications.length === 0 && (
                  <p className="text-center py-8 text-xs text-muted-foreground uppercase font-black tracking-widest opacity-30">Paz absoluta en el núcleo</p>
                )}
                {notifications.map((n) => (
                  <DropdownMenuItem 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all",
                      n.read ? "opacity-60" : "bg-white/5 border border-white/5 focus:bg-white/10"
                    )}
                  >
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={n.senderAvatar} className="object-cover" />
                      <AvatarFallback>{n.senderName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-[11px] leading-tight">
                        <span className="font-black text-white">{n.senderName}</span>{" "}
                        <span className="text-muted-foreground">{n.content}</span>
                      </p>
                      <p className="text-[9px] text-primary/60 font-black uppercase tracking-widest">
                        {formatDistanceToNow(n.createdAt?.toDate ? n.createdAt.toDate() : new Date(), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-4 pl-4 border-l border-white/5 cursor-pointer group">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-base font-black group-hover:text-primary transition-colors">{profile?.displayName || 'Usuario'}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_theme(colors.green.500)]" />
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Conectado</span>
                </div>
              </div>
              <div className="relative group">
                <Avatar className="h-12 w-12 border border-white/5 group-hover:border-primary transition-all">
                  <AvatarImage src={profile?.photoURL} alt="Usuario" className="object-cover" />
                  <AvatarFallback className="bg-primary/20 text-primary font-black">{profile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="absolute top-0 right-0 w-4 h-4 bg-[#050510] rounded-full flex items-center justify-center border border-white/5">
                   <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-[#050510]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] mt-4 p-3 shadow-2xl">
            <DropdownMenuLabel className="font-black uppercase tracking-widest text-[11px] text-muted-foreground px-4 py-3 pb-1">Núcleo NovaSphere</DropdownMenuLabel>
            
            <div className="px-4 mb-4 mt-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-3 opacity-60">Sintonía de Frecuencia</p>
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {[
                  { name: 'light', label: 'Blanco / Día', color: 'bg-[#fafafa]' },
                  { name: 'nova-core', label: 'NovaCore', color: 'bg-[#8B5CF6]' },
                  { name: 'solo-leveling', label: 'Solo Leveling', color: 'bg-[#4F46E5]' },
                  { name: 'cyberpunk', label: 'Cyberpunk', color: 'bg-[#EC4899]' },
                  { name: 'matcha', label: 'Matcha', color: 'bg-[#84CC16]' },
                  { name: 'crimson-moon', label: 'Crimson', color: 'bg-[#E11D48]' },
                  { name: 'ocean', label: 'Océano', color: 'bg-[#06B6D4]' },
                  { name: 'golden-sun', label: 'Golden Sun', color: 'bg-[#F59E0B]' },
                  { name: 'dracula', label: 'Drácula', color: 'bg-[#A855F7]' },
                  { name: 'nord', label: 'Nord', color: 'bg-[#818CF8]' },
                  { name: 'monochrome', label: 'Monochrome', color: 'bg-[#555555]' },
                  { name: 'abyss', label: 'Abismo', color: 'bg-[#050510]' }
                ].map((th) => (
                  <button
                    key={th.name}
                    onClick={() => {
                        const root = document.getElementsByTagName('html')[0];
                        if (th.name === 'light') {
                          root.className = 'theme-light';
                        } else {
                          root.className = 'dark theme-' + th.name;
                        }
                        localStorage.setItem('nova-theme', th.name);
                    }}
                    className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all hover:scale-125 active:scale-95 border border-white/20 shadow-lg relative group",
                        th.color
                    )}
                    title={th.label}
                  >
                    <div className="absolute inset-0 rounded-full bg-black/20 group-hover:bg-transparent transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-2xl cursor-pointer py-3 px-4 focus:bg-primary/20 gap-3 font-bold text-base">
              <User className="w-5 h-5" /> Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-2xl cursor-pointer py-3 px-4 focus:bg-primary/20 gap-3 font-bold text-base">
              <LayoutGrid className="w-5 h-5" /> Ajustes
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 my-2" />
            <DropdownMenuItem onClick={handleLogout} className="rounded-2xl cursor-pointer py-3 px-4 focus:bg-red-500/20 text-red-500 gap-3 font-bold text-base">
              <LogOut className="w-5 h-5" /> Abandonar Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
