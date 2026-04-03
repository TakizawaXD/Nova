'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // La lógica de getRedirectResult ha sido movida al AuthContext para manejo global

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de acceso',
        description: 'Credenciales incorrectas o problema de conexión.',
      });
    } finally {
      setLoading(false);
    }
  };

  const loginWithProvider = async (providerName: 'google') => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      // Intentar Pop-up primero (mejor para desktop)
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        // Respaldo a Redirect para móviles o si el popup está bloqueado
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Error en login social:", error);
        toast({
          variant: 'destructive',
          title: 'Error de Red',
          description: 'No se pudo iniciar el protocolo. Intenta de nuevo.',
        });
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030308] relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[150px] animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <Card className="glass border-white/10 rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-3xl bg-white/[0.02]">
          <div className="h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <CardHeader className="text-center pt-10 pb-6">
            <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_-10px_theme(colors.primary.DEFAULT)] rotate-3 hover:rotate-0 transition-transform duration-500">
              <span className="text-white font-[1000] text-4xl tracking-tighter mt-1">NX</span>
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter uppercase italic-nova text-white">
              BIENVENIDO
            </CardTitle>
            <CardDescription className="text-muted-foreground/70 font-medium text-sm uppercase tracking-widest mt-2">
              Sintoniza con NOVAX
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pb-12 px-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="Correo Electrónico" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-white/[0.03] border-white/5 rounded-2xl focus:border-primary/50 text-white placeholder:text-muted-foreground/30 transition-all" 
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 bg-white/[0.03] border-white/5 rounded-2xl focus:border-primary/50 text-white placeholder:text-muted-foreground/30 transition-all" 
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-[0.2em] gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                {loading ? 'Procesando...' : 'Entrar al Núcleo'} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]"><span className="bg-[#030308] px-4 text-muted-foreground/40">Sincronización Social</span></div>
            </div>

            <Button 
                variant="outline" 
                onClick={() => loginWithProvider('google')} 
                className="w-full rounded-2xl border-white/5 bg-white/[0.03] hover:bg-white/[0.08] h-14 gap-3 font-black text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" /> Iniciar con Protocolo Google
            </Button>

            <p className="text-center text-xs text-muted-foreground/60 font-medium pt-2">
              ¿Eres nuevo aquí? <Link href="/register" className="text-primary font-black hover:underline ml-1">Crea tu identidad</Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.5em] mt-8">
          © 2026 NOVAX SYSTEM • PRIVACY SECURED
        </p>
      </div>
    </div>
  );
}