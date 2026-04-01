
'use client';

import { Home, Compass, MessageCircle, PlayCircle, Users, ShoppingBag, Settings, ShieldCheck, UserCircle, History, Heart, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const menuItems = [
  { label: 'Inicio', icon: Home, href: '/' },
  { label: 'Explorar', icon: Compass, href: '/explore' },
  { label: 'Mensajes', icon: MessageCircle, href: '/messages' },
  { label: 'Historias', icon: History, href: '/stories' },
  { label: 'Reels', icon: PlayCircle, href: '/reels' },
  { label: 'Grupos', icon: Users, href: '/groups' },
  { label: 'Tienda', icon: ShoppingBag, href: '/marketplace' },
  { label: 'Amigos', icon: Heart, href: '/friends' },
];

const secondaryItems = [
  { label: 'Perfil', icon: UserCircle, href: '/profile' },
  { label: 'Ajustes', icon: Settings, href: '/settings' },
  { label: 'Admin', icon: ShieldCheck, href: '/admin' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-20 xl:w-64 glass border-r border-white/5 p-4 flex flex-col justify-between hidden md:flex z-40 transition-all duration-500 ease-in-out">
      <div className="space-y-8">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group relative",
                pathname === item.href 
                  ? "bg-primary text-white shadow-lg shadow-primary/40 electric-glow" 
                  : "hover:bg-primary/10 hover:text-primary"
              )}
            >
              <item.icon className={cn("w-6 h-6 shrink-0", pathname === item.href ? "animate-pulse" : "text-muted-foreground group-hover:text-primary")} />
              <span className="hidden xl:block font-bold tracking-tight">{item.label}</span>
              {pathname === item.href && (
                <div className="absolute left-0 w-1 h-8 bg-accent rounded-full -translate-x-4 hidden xl:block" />
              )}
            </Link>
          ))}
        </div>

        <div className="h-px bg-white/10 xl:mx-4" />

        <div className="space-y-2">
          <p className="hidden xl:block px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Sistema</p>
          {secondaryItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group",
                pathname === item.href 
                  ? "bg-secondary text-primary shadow-md" 
                  : "hover:bg-primary/10 hover:text-primary"
              )}
            >
              <item.icon className={cn("w-6 h-6 shrink-0", pathname === item.href ? "" : "text-muted-foreground group-hover:text-primary")} />
              <span className="hidden xl:block font-bold tracking-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="hidden xl:block p-5 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-accent/20 border border-white/10 backdrop-blur-xl group overflow-hidden relative">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all" />
        <p className="text-sm font-black text-primary uppercase mb-1 tracking-tighter">Nova Pro</p>
        <p className="text-[11px] text-muted-foreground leading-snug mb-4">Desbloquea el futuro con funciones exclusivas de IA.</p>
        <button className="w-full py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary/80 transition-all shadow-lg shadow-primary/20 uppercase tracking-widest">Upgrade</button>
      </div>
    </aside>
  );
}
