'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function QuantumLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-20">
      <div className="relative w-24 h-24">
        {/* Orbital Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary shadow-[0_0_15px_theme(colors.primary.DEFAULT)]"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border-2 border-accent/20 border-b-accent shadow-[0_0_15px_theme(colors.accent.DEFAULT)]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-primary blur-[1px]" />
        </motion.div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Sincronizando con el Núcleo</p>
        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50">Transmisión de Datos Cuántica v22.0</p>
      </div>
    </div>
  );
}
