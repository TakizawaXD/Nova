'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Sparkles, Zap, Shield, Globe, ArrowRight, MessageSquare, ShoppingCart, Users, Camera, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Aurora Background Engine */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[150px] animate-pulse" />
      </div>

      <main className="relative z-10 w-full overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] sm:min-h-screen flex flex-col items-center justify-center pt-10 sm:pt-20 px-6 sm:px-12">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center max-w-5xl mx-auto space-y-12"
          >
            {/* Tagline */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-primary border border-primary/30 text-primary text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] animate-float mx-auto">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Sintonizando la Nueva Era Digital
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter"
            >
              <span className="block opacity-80 italic tracking-[-0.08em]">REDEFINE EL</span>
              <span className="block text-gradient-primary text-neon-glow uppercase">HORIZONTE</span>
            </motion.h1>

            {/* Subheadline (The Motivator) */}
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-2xl text-muted-foreground/80 max-w-3xl mx-auto font-medium leading-relaxed"
            >
              No es solo una red. Es tu <span className="text-white font-bold italic underline decoration-primary/50 underline-offset-8">ecosistema ilimitado</span>. 
              Donde la inteligencia converge con la comunidad en un pulso digital infinito.
            </motion.p>

            {/* CTA Group */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
            >
              <Button 
                onClick={() => router.push('/register')}
                className="h-16 sm:h-20 px-12 rounded-[2rem] bg-primary text-white text-lg sm:text-xl font-black uppercase tracking-widest shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:shadow-[0_0_60px_rgba(147,51,234,0.6)] transition-all hover:scale-105 active:scale-95 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10 flex items-center gap-3 decoration-white/0">
                  Cruzar el Umbral <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>

              <Button 
                variant="outline"
                onClick={() => router.push('/login')}
                className="h-16 sm:h-20 px-12 rounded-[2rem] glass border-white/10 text-lg sm:text-xl font-black uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-105"
              >
                Acceder al Dashboard
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Visual Asset Icons */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700 hidden sm:flex"
          >
            {[
              { icon: MessageSquare, label: "Connect", color: "text-primary" },
              { icon: ShoppingCart, label: "Trade", color: "text-accent" },
              { icon: Camera, label: "Share", color: "text-primary" },
              { icon: Layout, label: "Build", color: "text-accent" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group cursor-default">
                <item.icon className={cn("w-6 h-6 transition-all group-hover:scale-125 group-hover:glow-sm", item.color)} />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] font-mono">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* FEATURES TEASER */}
        <section id="features" className="py-32 px-6 sm:px-12 relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter">
                Tecnología de <span className="text-primary italic">Siguiente Generación</span>
              </h2>
              <p className="text-muted-foreground/60 font-medium tracking-widest uppercase text-xs">El pulso de la nueva era digital</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <FeatureCard 
                icon={<Zap className="w-8 h-8 text-primary glow-sm" />}
                title="Módulos Elite"
                description="Mercado, Comunidades y Mensajería sintonizados en un ecosistema ultra-vibrante de alta fidelidad."
              />
              <FeatureCard 
                icon={<Globe className="w-8 h-8 text-accent glow-sm" />}
                title="Red Global"
                description="Sincronízate con ciudadanos de todo el planeta bajo protocolos de seguridad absoluta."
              />
              <FeatureCard 
                icon={<Shield className="w-8 h-8 text-primary glow-sm" />}
                title="Soberanía Digital"
                description="Tu huella es tu clave. Privacidad descentralizada y encriptación de grado militar en cada bit."
              />
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-20 border-t border-white/5 bg-black/40 backdrop-blur-xl mt-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-12">
            <div className="flex items-center gap-3 font-black text-2xl sm:text-4xl tracking-[0.4em] uppercase text-white/90">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Sparkles className="text-white w-6 h-6 animate-pulse" />
                </div>
                NovaSphere
            </div>
            <p className="text-muted-foreground/40 text-[10px] sm:text-xs font-black uppercase tracking-[0.6em] text-center max-w-md">
              Sintonizando realidades desde 2026. <br/>Bienvenidos al horizonte.
            </p>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .text-gradient-primary {
          background: linear-gradient(to right, #9333ea, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .italic-nova {
          font-family: 'Outfit', sans-serif;
          font-weight: 200;
        }
        .glow-sm {
            filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="p-10 rounded-[2.5rem] glass border border-white/5 space-y-8 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden"
    >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-[60px] group-hover:bg-primary/10 transition-all" />
        <div className="p-5 rounded-2xl bg-white/5 w-fit group-hover:bg-primary/20 transition-all relative z-10">
            {icon}
        </div>
        <div className="space-y-4 relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
            <p className="text-muted-foreground/60 leading-relaxed font-medium text-sm sm:text-base">{description}</p>
        </div>
        <div className="pt-4 relative z-10">
            <div className="h-1 w-12 bg-primary/20 rounded-full group-hover:w-full group-hover:bg-primary/40 transition-all duration-700" />
        </div>
    </motion.div>
  );
}
