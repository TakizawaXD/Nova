
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#050510]/80 backdrop-blur-3xl border-t border-white/5 md:hidden px-4 pb-safe">
      <div className="flex items-center justify-around h-20">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-2xl transition-all duration-300",
                isActive ? "text-primary bg-primary/10 shadow-[0_0_20px_theme(colors.primary.DEFAULT/0.1)]" : "text-muted-foreground hover:text-white"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-current animate-pulse")} />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
