
'use client';

import { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
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
      toast({ title: "NovaSphere Instalada", description: "Bienvenido al ecosistema nativo." });
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="bg-[#050510]/80 backdrop-blur-3xl border border-primary/30 p-2 pr-6 rounded-[2rem] flex items-center gap-4 shadow-[0_0_50px_rgba(139,92,246,0.2)]">
        <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Disponible Nativo</p>
          <p className="text-sm font-black text-white italic">INSTALAR NOVASPHERE</p>
        </div>
        <Button 
          onClick={handleInstallClick}
          className="ml-2 h-10 rounded-xl bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[10px] px-6 transition-all"
        >
          Descargar <Download className="w-3 h-3 ml-2" />
        </Button>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
