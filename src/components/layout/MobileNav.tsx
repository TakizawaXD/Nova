
'use client';

import { Home, Compass, MessageCircle, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, href: '/', label: 'Inicio' },
  { icon: Compass, href: '/explore', label: 'Explorar' },
  { icon: MessageCircle, href: '/messages', label: 'Mensajes' },
  { icon: ShoppingBag, href: '/marketplace', label: 'Tienda' },
  { icon: User, href: '/profile', label: 'Perfil' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
      <nav className="bg-[#050510]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] px-6 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 w-14 h-14 rounded-2xl transition-all duration-500 relative group",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-white"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-lg animate-pulse" />
                )}
                <item.icon className={cn("w-6 h-6 z-10 transition-transform duration-300", isActive && "scale-110")} />
                <span className={cn("text-[8px] font-black uppercase tracking-widest z-10", isActive ? "opacity-100" : "opacity-40")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
