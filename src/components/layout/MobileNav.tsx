
'use client';

import { Home, Compass, MessageCircle, Users, User, Clapperboard, Store, UserPlus, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const navItems = [
  { icon: Home, href: '/', label: 'Inicio' },
  { icon: Compass, href: '/explore', label: 'Explorar' },
  { icon: MessageCircle, href: '/messages', label: 'Mensajes' },
  { icon: Users, href: '/communities', label: 'Comunidades' },
  { icon: UserPlus, href: '/friends', label: 'Contactos' },
  { icon: Sparkles, href: '/stories', label: 'Historias' },
  { icon: Store, href: '/marketplace', label: 'Mercado' },
  { icon: User, href: '/profile', label: 'Perfil' },
  { icon: Settings, href: '/settings', label: 'Ajustes' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-20 z-40 w-full md:hidden bg-background/95 backdrop-blur-xl shadow-lg pb-1 pt-2 border-b border-white/5">
      <div className="w-full overflow-x-auto no-scrollbar scroll-smooth px-4">
        <nav className="flex items-center gap-4 w-max mx-auto md:mx-0 py-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                title={item.label}
                className="group flex flex-col items-center gap-1.5 snap-center shrink-0"
              >
                <div className={cn(
                  "flex items-center justify-center transition-all duration-500 ease-out",
                  "w-[3.25rem] h-[3.25rem] rounded-full border-2",
                  isActive 
                    ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_theme(colors.primary.DEFAULT)]" 
                    : "bg-white/5 border-transparent text-muted-foreground hover:bg-white/10 hover:text-white"
                )}>
                  <item.icon className={cn(
                    "w-6 h-6 transition-transform duration-300", 
                    isActive && "scale-110"
                  )} />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-white/80"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
