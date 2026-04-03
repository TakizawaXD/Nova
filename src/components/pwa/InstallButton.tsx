
'use client';

import { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function InstallButton({ inline = false }: { inline?: boolean }) {
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

  if (!isVisible && inline) {
      return (
          <div className="flex items-center justify-between p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-3xl opacity-50">
             <div className="flex items-center gap-4">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground">
                    <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
                 </div>
                 <div>
                    <p className="font-black text-white italic text-sm sm:text-base">App Instalada</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium mt-0.5">NOVAX nativo en ejecución.</p>
                 </div>
             </div>
          </div>
      );
  }

  if (!isVisible) return null;

  if (inline) {
      return (
          <div className="flex items-center justify-between p-4 sm:p-6 bg-primary/10 border border-primary/20 rounded-3xl group">
             <div className="flex items-center gap-3 sm:gap-4">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                    <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                 </div>
                 <div>
                    <p className="font-black text-white italic text-sm sm:text-base">Instalar NOVAX</p>
                    <p className="text-[10px] sm:text-xs text-primary/80 uppercase font-bold mt-0.5">Optimización PWA al núcleo.</p>
                 </div>
             </div>
             <Button onClick={handleInstallClick} className="rounded-xl bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[9px] sm:text-[10px] px-4 sm:px-6 shadow-xl transition-all h-10 border border-white/10">Descargar</Button>
          </div>
      );
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-700 w-[90%] sm:w-auto">
      <div className="bg-[#050510]/80 backdrop-blur-3xl border border-primary/30 p-2 pr-4 sm:pr-6 rounded-3xl sm:rounded-[2rem] flex items-center justify-between shadow-[0_0_50px_rgba(139,92,246,0.2)]">
        <div className="flex items-center gap-3 sm:gap-4 truncate">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary rounded-xl sm:rounded-2xl flex shrink-0 items-center justify-center shadow-lg transform rotate-3">
            <Sparkles className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col truncate">
            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-primary truncate">Disponible Nativo</p>
            <p className="text-xs sm:text-sm font-black text-white italic truncate">INSTALAR NOVAX</p>
            </div>
        </div>
        <div className="flex shrink-0 items-center justify-end">
            <Button 
            onClick={handleInstallClick}
            className="ml-2 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[8px] sm:text-[10px] px-3 sm:px-6 transition-all"
            >
            Descargar <Download className="w-3 h-3 ml-2 hidden sm:block" />
            </Button>
            <button 
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-white p-1 ml-1 sm:ml-2"
            >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </div>
      </div>
    </div>
  );
}
