'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Sparkles, Zap, Shield, Globe, ArrowRight } from 'lucide-react';

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
      transition: { duration: 0.8 }
    },
  };

  return (
    <div className="min-h-screen bg-[#030308] text-foreground overflow-x-hidden selection:bg-primary/30 font-sans">
      {/* Aurora Background Engine */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[150px] animate-pulse" />
      </div>

      <main className="relative z-10 w-full overflow-hidden">
        {/* HERO SECTION - ATMOSPHERIC SOUL */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 sm:px-12 overflow-hidden">
          
          {/* Immersive Background Soul Layer */}
          <div className="absolute inset-0 z-0 overflow-hidden">
             <motion.div 
               initial={{ scale: 1.2, opacity: 0, filter: 'blur(40px)' }}
               animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
               transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
               className="w-full h-full relative"
             >
                <img 
                  src="/novax_soul_bg_1775184506126.png" 
                  alt="Esencia Nova" 
                  className="w-full h-full object-cover opacity-30 mix-blend-screen animate-float-slow"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030308] via-transparent to-[#030308]/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030308] via-transparent to-[#030308]" />
             </motion.div>
             
             {/* NovaDust - Subtle Floating Particles */}
             <div className="absolute inset-0 z-10 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%", 
                        opacity: 0,
                        scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{ 
                        y: ["0%", "-30%"], 
                        opacity: [0, 0.3, 0],
                        transition: { 
                           duration: Math.random() * 15 + 15, 
                           repeat: Infinity, 
                           ease: "linear",
                           delay: Math.random() * 10 
                        } 
                    }}
                    className="absolute w-1 h-1 bg-primary/40 rounded-full blur-[1px]"
                  />
                ))}
             </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-5xl mx-auto space-y-12 relative z-20"
          >
            {/* Main Headline (Soulful Narrative) */}
            <div className="space-y-4">
                <motion.p 
                    variants={itemVariants}
                    className="text-primary font-black uppercase tracking-[0.5em] text-[10px] sm:text-xs mb-4"
                >
                    La evolución del tejido social
                </motion.p>
                <motion.h1 
                    variants={itemVariants}
                    className="text-[40px] sm:text-[60px] md:text-[80px] lg:text-[110px] font-black leading-[0.85] tracking-tighter text-white uppercase italic-nova"
                >
                    SINTONIZA <br/>
                    <span className="text-white/40">UNA NUEVA ERA</span>
                </motion.h1>
            </div>

            {/* Subheadline */}
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed px-4 italic-nova"
            >
              Donde la conexión trasciende el algoritmo. Un ecosistema diseñado para la resonancia humana, la comunidad y la soberanía digital.
            </motion.p>

            {/* CTA Group (Glass Styled Buttons) */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-8"
            >
              <Button 
                onClick={() => router.push('/register')}
                className="h-16 sm:h-20 px-12 rounded-full glass-btn text-white text-lg sm:text-xl font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                Iniciar Secuencia
              </Button>

              <Button 
                onClick={() => router.push('/login')}
                className="h-16 sm:h-20 px-12 rounded-full bg-transparent text-white/40 hover:text-white text-base sm:text-lg font-black uppercase tracking-[0.3em] transition-all border border-white/5 hover:border-white/20"
              >
                Entrar al Núcleo
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 3, duration: 2 }}
            className="absolute bottom-10 flex flex-col items-center gap-4"
          >
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Explorar Profundidad</span>
             <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent" />
          </motion.div>
        </section>

        {/* FEATURES TEASER */}
        <section id="features" className="py-32 px-6 sm:px-12 relative overflow-hidden bg-black/20">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-white">
                Pilares de la <span className="text-primary italic">Resonancia</span>
              </h2>
              <p className="text-muted-foreground/30 font-medium tracking-widest uppercase text-xs">Arquitectura de grado evolutivo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <FeatureCard 
                icon={<Zap className="w-8 h-8 text-primary glow-sm" />}
                title="Módulos Elite"
                description="Mercado, Comunidades y Mensajería sintonizados en un ecosistema ultra-vibrante."
              />
              <FeatureCard 
                icon={<Globe className="w-8 h-8 text-accent glow-sm" />}
                title="Sincronía"
                description="Conéctate con ciudadanos bajo protocolos de soberanía absoluta."
              />
              <FeatureCard 
                icon={<Shield className="w-8 h-8 text-primary glow-sm" />}
                title="Soberanía"
                description="Privacidad descentralizada y encriptación de grado militar en cada bit."
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
                NOVAX
            </div>
            <p className="text-muted-foreground/20 text-[10px] sm:text-xs font-black uppercase tracking-[0.6em] text-center max-w-md">
              Sintonizando realidades desde 2026. <br/>Bienvenidos al horizonte de la conciencia.
            </p>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </footer>
      </main>

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: scale(1.05) translate(0, 0); }
          50% { transform: scale(1.1) translate(-2%, -2%); }
        }
        .animate-float-slow {
           animation: float-slow 20s ease-in-out infinite;
        }
        .italic-nova {
          font-family: 'Outfit', sans-serif;
          font-weight: 200;
        }
        .glow-sm {
            filter: drop-shadow(0 0 8px currentColor);
        }
        .glass-btn {
           background: rgba(255, 255, 255, 0.03);
           backdrop-filter: blur(20px);
           border: 1px solid rgba(255, 255, 255, 0.08);
           box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.7);
        }
        .glass-btn:hover {
           background: rgba(255, 255, 255, 0.08);
           border: 1px solid rgba(255, 255, 255, 0.15);
           box-shadow: 0 25px 70px -10px rgba(0, 0, 0, 0.8), 0 0 30px -5px rgba(139, 92, 246, 0.3);
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
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h3>
            <p className="text-muted-foreground/30 leading-relaxed font-medium text-sm sm:text-base">{description}</p>
        </div>
        <div className="pt-4 relative z-10">
            <div className="h-1 w-12 bg-primary/20 rounded-full group-hover:w-full group-hover:bg-primary/40 transition-all duration-700" />
        </div>
    </motion.div>
  );
}
