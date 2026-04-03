
'use client';

import { Home, Compass, MessageCircle, PlayCircle, Users, ShoppingBag, Settings, ShieldCheck, UserCircle, History, Heart, PlusCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const menuItems = [
  { label: 'Inicio', icon: Home, href: '/home' },
  { label: 'Explorar', icon: Compass, href: '/explore' },
  { label: 'Mensajes', icon: MessageCircle, href: '/messages' },
  { label: 'Destellos', icon: History, href: '/stories' },
  { label: 'Comunidades', icon: Users, href: '/communities' },
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
    <aside className="fixed left-0 top-0 bottom-0 w-20 xl:w-72 bg-[#050510]/80 backdrop-blur-3xl border-r border-white/5 p-4 flex flex-col justify-between hidden md:flex z-40 transition-all duration-500 ease-in-out">
      <div className="space-y-10 mt-4">
        <Link href="/home" className="flex items-center gap-3 px-4 mb-4 group shrink-0">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 active:scale-95">
            <span className="text-white font-[1000] text-lg tracking-tighter mt-0.5">NX</span>
          </div>
          <span className="hidden xl:block text-2xl font-black text-white tracking-tighter uppercase italic-nova">
            NOVAX
          </span>
        </Link>
        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-300 group relative",
                pathname === item.href 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-white/5 text-muted-foreground hover:text-white"
              )}
            >
              <item.icon className={cn("w-6 h-6 shrink-0", pathname === item.href ? "" : "text-muted-foreground group-hover:text-white")} />
              <span className="hidden xl:block font-bold tracking-tight text-[15px]">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="space-y-4 pt-4 border-t border-white/5">
          <p className="hidden xl:block px-4 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">Sistema</p>
          <div className="space-y-3">
            {secondaryItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-300 group",
                  pathname === item.href 
                    ? "bg-primary text-white shadow-lg" 
                    : "hover:bg-white/5 text-muted-foreground hover:text-white"
                )}
              >
                <item.icon className={cn("w-6 h-6 shrink-0", pathname === item.href ? "" : "text-muted-foreground group-hover:text-white")} />
                <span className="hidden xl:block font-bold tracking-tight text-[15px]">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden xl:block p-6 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 backdrop-blur-3xl group overflow-hidden relative m-2 shadow-[0_0_30px_-10px_theme(colors.primary.DEFAULT)]">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl transition-all group-hover:scale-150 duration-700" />
        <p className="text-sm font-black text-primary uppercase mb-1 tracking-tighter flex items-center gap-2">
            <Zap className="w-4 h-4 fill-primary animate-pulse" /> NOVAX Pro
        </p>
        <p className="text-[11px] text-muted-foreground leading-snug mb-5 font-bold italic">Desbloquea el futuro con funciones exclusivas de IA.</p>
        <button className="w-full py-3 bg-primary text-white text-[11px] font-black rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/30 uppercase tracking-widest electric-glow">Upgrade</button>
      </div>
    </aside>
  );
}
