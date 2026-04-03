'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Sparkles, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function IdentitySyncModal() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mostrar modal si el usuario está logueado pero no ha completado el setup
    if (user && profile && profile.setupComplete === false) {
      setIsOpen(true);
      setName(profile.displayName || '');
      setBio(profile.bio || '');
    } else {
      setIsOpen(false);
    }
  }, [user, profile]);

  const handleSync = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: name,
        bio: bio,
        setupComplete: true
      });
      toast({
        title: "Identidad Sincronizada",
        description: "Tu huella digital ha sido grabada en el ecosistema.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Error de Enlace",
        description: "No se pudo sincronizar la identidad.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Deep Abyssal Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#030308]/90 backdrop-blur-3xl"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-[#0A0A1B] border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Header Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-8 sm:p-12 space-y-10">
            {/* Title Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white italic-nova">
                        MODIFICAR IDENTIDAD
                    </h2>
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_15px_theme(colors.primary.DEFAULT)]" />
                </div>
            </div>

            {/* Form Section */}
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-2">Nombre Público</label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre en el ecosistema"
                  className="h-16 bg-white/[0.03] border-white/5 rounded-2xl focus:border-primary/50 text-white text-lg placeholder:text-muted-foreground/20 px-6 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-2">Biografía</label>
                <Textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe tu propósito digital..."
                  className="min-h-[140px] bg-white/[0.03] border-white/5 rounded-3xl focus:border-primary/50 text-white text-base placeholder:text-muted-foreground/20 p-6 transition-all resize-none"
                />
              </div>
            </div>

            {/* Action Section */}
            <div className="pt-4">
              <Button 
                onClick={handleSync}
                disabled={loading || !name.trim()}
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40"
              >
                {loading ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
            </div>
          </div>

          {/* Decorative Corner Glow */}
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[60px]" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
