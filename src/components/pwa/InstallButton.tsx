
'use client';

import { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function InstallButton({ 
  inline = false, 
  variant = 'banner' 
}: { 
  inline?: boolean;
  variant?: 'banner' | 'icon' | 'inline';
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
        setIsVisible(true);
    }
      
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({ title: "NOVAX Instalada", description: "Bienvenido al ecosistema nativo." });
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible && variant === 'inline') {
      return (
          <div className="flex items-center justify-between p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-3xl opacity-50">
             <div className="flex items-center gap-4">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 opacity-60">
                    <img src="/icons/icon-192x192.png" className="w-full h-full object-cover grayscale" alt="Installed" />
                 </div>
                 <div>
                    <p className="font-black text-white italic text-sm sm:text-base tracking-tight italic-nova uppercase">App Sincronizada</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5">NOVAX nativo en ejecución.</p>
                 </div>
             </div>
          </div>
      );
  }

  if (!isVisible) return null;

  if (variant === 'icon') {
    return (
      <button 
        onClick={handleInstallClick}
        className="h-10 w-10 bg-primary/20 hover:bg-primary rounded-xl transition-all shadow-lg animate-pulse overflow-hidden border border-primary/30 group p-1"
      >
        <img src="/icons/icon-192x192.png" className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform" alt="Install" />
      </button>
    );
  }

  if (variant === 'inline') {
      return (
          <div className="flex items-center justify-between p-4 sm:p-6 bg-primary/10 border border-primary/20 rounded-3xl group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.3)] overflow-hidden border border-white/20">
                 <img src="/icons/icon-192x192.png" className="w-full h-full object-cover" alt="Install" />
              </div>
              <div className="truncate">
                 <p className="font-black text-white italic text-sm sm:text-base tracking-tight uppercase italic-nova">Sincronizar NOVAX</p>
                 <p className="text-[9px] sm:text-[10px] text-primary/80 uppercase font-black tracking-widest mt-0.5">Optimización PWA al núcleo.</p>
              </div>
             <Button onClick={handleInstallClick} className="rounded-xl bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-4 sm:px-6 shadow-xl transition-all h-10 border border-white/10">Descargar</Button>
          </div>
      );
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-1000 w-[92%] sm:w-auto">
      <div className="bg-[#050510]/95 backdrop-blur-3xl border border-white/10 p-3 pr-4 sm:pr-8 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-between shadow-[0_0_80px_-10px_rgba(139,92,246,0.3)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 opacity-50" />
        
        <div className="flex items-center gap-4 truncate relative z-10">
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-primary rounded-2xl flex shrink-0 items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] transform -rotate-3 group-hover:rotate-0 transition-transform duration-500 overflow-hidden border border-white/10">
              <img src="/icons/icon-192x192.png" className="w-full h-full object-cover" alt="NOVAX icon" />
            </div>
            <div className="flex flex-col truncate">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-primary/80 truncate">Sincronización Nativa</p>
              <p className="text-sm sm:text-lg font-black text-white italic truncate tracking-tight uppercase">Instalar NOVAX</p>
            </div>
        </div>

        <div className="flex shrink-0 items-center justify-end relative z-10 ml-4">
            <Button 
              onClick={handleInstallClick}
              className="h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-primary hover:text-white font-[1000] uppercase tracking-widest text-[9px] sm:text-[11px] px-5 sm:px-8 transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              DESCARGAR <Download className="w-4 h-4 ml-2 hidden sm:block" />
            </Button>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-white p-2 ml-2 sm:ml-4 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
}
