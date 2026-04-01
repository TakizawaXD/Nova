'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, LogIn, Github, Facebook } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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

  const loginWithProvider = async (providerName: 'google' | 'github' | 'facebook') => {
    let provider;
    if (providerName === 'google') provider = new GoogleAuthProvider();
    else if (providerName === 'github') provider = new GithubAuthProvider();
    else provider = new FacebookAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo iniciar sesión con ' + providerName,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-background to-accent/10 -z-10" />
      
      <Card className="w-full max-w-md glass border-white/10 rounded-[2.5rem] shadow-2xl animate-fade-in overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
        <CardHeader className="text-center pt-8">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-4 electric-glow rotate-6">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter uppercase">BIENVENIDO A NOVA</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Accede al futuro de la conexión social.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="tu@correo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50" 
                required
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50" 
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-widest gap-2">
              {loading ? 'Entrando...' : 'Iniciar Sesión'} <LogIn className="w-4 h-4" />
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-muted-foreground font-black tracking-widest">O continúa con</span></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" onClick={() => loginWithProvider('google')} className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 h-12 gap-2 font-bold text-xs uppercase">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" /> Google
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => loginWithProvider('github')} className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 h-12 gap-2 font-bold text-xs uppercase">
                <Github className="w-4 h-4" /> GitHub
              </Button>
              <Button variant="outline" onClick={() => loginWithProvider('facebook')} className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 h-12 gap-2 font-bold text-xs uppercase">
                <Facebook className="w-4 h-4 text-blue-500" /> Facebook
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            ¿No tienes cuenta? <Link href="/register" className="text-primary font-black hover:underline">Regístrate gratis</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}