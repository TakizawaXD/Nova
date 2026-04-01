'use client';

import { Home, Compass, MessageCircle, PlayCircle, Users, ShoppingBag, Settings, ShieldCheck, UserCircle, History } from 'lucide-react';
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
];

const secondaryItems = [
  { label: 'Perfil', icon: UserCircle, href: '/profile' },
  { label: 'Ajustes', icon: Settings, href: '/settings' },
  { label: 'Admin', icon: ShieldCheck, href: '/admin' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-20 xl:w-64 glass border-r border-white/5 p-4 flex flex-col justify-between hidden md:flex transition-all duration-300">
      <div className="space-y-6">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all group",
                pathname === item.href 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-primary/10 hover:text-primary"
              )}
            >
              <item.icon className={cn("w-6 h-6", pathname === item.href ? "" : "text-muted-foreground group-hover:text-primary")} />
              <span className="hidden xl:block font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="h-px bg-white/5 xl:mx-4" />

        <div className="space-y-1">
          <p className="hidden xl:block px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Cuenta</p>
          {secondaryItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all group",
                pathname === item.href 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-primary/10 hover:text-primary"
              )}
            >
              <item.icon className={cn("w-6 h-6", pathname === item.href ? "" : "text-muted-foreground group-hover:text-primary")} />
              <span className="hidden xl:block font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="hidden xl:block p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
        <p className="text-xs font-bold text-primary uppercase mb-1">Nova Plus</p>
        <p className="text-[10px] text-muted-foreground leading-tight mb-3">Verifícate y accede a funciones exclusivas.</p>
        <button className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">Mejorar Ahora</button>
      </div>
    </aside>
  );
}
