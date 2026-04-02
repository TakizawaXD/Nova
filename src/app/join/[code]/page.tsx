'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGroupByInviteCode, joinGroup, Group } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, ShieldCheck, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      if (!params.code) return;
      try {
        const g = await getGroupByInviteCode(params.code as string);
        setGroup(g);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadGroup();
  }, [params.code]);

  const handleJoin = async () => {
    if (!user) {
      toast({ title: 'Autenticación Requerida', description: 'Inicia sesión para unirte a esta comunidad.' });
      router.push('/login');
      return;
    }
    if (!group?.id) return;

    setJoining(true);
    try {
      await joinGroup(group.id, user.uid);
      toast({ title: '¡Bienvenido!', description: `Te has unido a ${group.name}` });
      router.push('/communities');
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo procesar la integración.' });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 text-center gap-6">
        <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase">Señal Perdida</h1>
        <p className="text-muted-foreground text-xl max-w-md">Este código de invitación no apunta a ningún núcleo activo en el mapa de NovaSphere.</p>
        <Button onClick={() => router.push('/')} variant="ghost" className="text-primary font-black uppercase tracking-widest text-xs">
          Regresar a la Base
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-sans relative overflow-hidden flex items-center justify-center p-6">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.1),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <div className="w-full max-w-xl bg-[#050510]/80 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 relative z-10 shadow-2xl overflow-hidden group">
        {/* Banner Area */}
        <div className="absolute top-0 left-0 w-full h-40 overflow-hidden -z-10 opacity-40">
           <img src={group.bannerUrl} alt="Banner" className="w-full h-full object-cover blur-sm group-hover:scale-110 transition-transform duration-1000" />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050510]" />
        </div>

        <div className="flex flex-col items-center text-center space-y-8 mt-12">
          <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl ring-4 ring-primary/5">
             <AvatarImage src={group.avatar} alt={group.name} className="object-cover" />
             <AvatarFallback className="bg-primary/10 text-primary text-5xl font-black">{group.name[0]}</AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">{group.name}</h1>
            <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-primary">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {group.membersCount} CIUDADANOS</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-green-500"><ShieldCheck className="w-4 h-4" /> NÚCLEO VERIFICADO</span>
            </div>
          </div>

          <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-md">
            {group.description || "Has sido invitado a formar parte de esta comunidad en expansión."}
          </p>

          <div className="w-full pt-8 space-y-4">
            <Button 
                onClick={handleJoin}
                disabled={joining}
                className="w-full h-20 rounded-2xl bg-primary text-white font-black uppercase italic tracking-widest text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 overflow-hidden relative group/btn"
            >
              {joining ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <Sparkles className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
                  Sincronizar con el Núcleo
                  <ChevronRight className="w-6 h-6" />
                </>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
              Al unirte aceptas los protocolos de convivencia de NovaSphere
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
