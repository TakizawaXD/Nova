
'use client';

import { Home, Compass, MessageCircle, Users, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, href: '/', label: 'Inicio' },
  { icon: Compass, href: '/explore', label: 'Explorar' },
  { icon: MessageCircle, href: '/messages', label: 'Mensajes' },
  { icon: Users, href: '/communities', label: 'Comunidades' },
  { icon: User, href: '/profile', label: 'Perfil' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-20 z-40 w-full md:hidden bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <nav className="w-full h-14 relative flex items-center justify-between px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center h-full relative group transition-all",
                isActive ? "text-primary" : "text-muted-foreground hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/5" />
              )}
              <item.icon className={cn("w-6 h-6 z-10 transition-transform duration-300", isActive && "scale-110")} />
              
              {/* Indicador Facebook-style (Línea inferior) */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full shadow-[0_0_8px_theme(colors.primary.DEFAULT)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
