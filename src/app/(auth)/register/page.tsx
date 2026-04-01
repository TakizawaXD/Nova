'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, UserPlus, ShieldCheck, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { isUsernameAvailable } from '@/lib/db';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const validatePassword = (pass: string) => {
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return pass.length >= 8 && hasUpperCase && hasNumbers && hasSpecialChar;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      toast({ 
        variant: 'destructive', 
        title: 'Contraseña débil', 
        description: 'Mínimo 8 caracteres, una mayúscula, un número y un símbolo.' 
      });
      return;
    }

    const cleanUsername = username.toLowerCase().trim().replace(/\s/g, '_');
    
    setLoading(true);
    try {
      const available = await isUsernameAvailable(cleanUsername);
      if (!available) {
        toast({ variant: 'destructive', title: 'Error', description: 'El nombre de usuario ya está en uso.' });
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const profileData = {
        uid: user.uid,
        displayName: name,
        username: cleanUsername,
        email: email,
        photoURL: `https://picsum.photos/seed/${user.uid}/400/400`,
        bannerURL: `https://picsum.photos/seed/${user.uid}banner/1200/400`,
        bio: '¡Hola! Soy un nuevo explorador de Nova.',
        location: '',
        website: '',
        followersCount: 0,
        followingCount: 0,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), profileData);

      toast({
        title: '¡Cuenta Creada!',
        description: 'Bienvenido al núcleo cuántico de Nova.',
      });
      
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de registro',
        description: error.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-accent/20 via-background to-primary/10 -z-10" />
      
      <Card className="w-full max-w-md glass border-white/10 rounded-[2.5rem] shadow-2xl animate-fade-in overflow-hidden relative">
        <div className="h-2 bg-gradient-to-r from-accent via-primary to-accent animate-pulse" />
        <CardHeader className="text-center pt-8">
          <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-4 electric-glow -rotate-6">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter uppercase">ÚNETE A NOVA</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Crea tu identidad digital avanzada.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Input 
                placeholder="Nombre Completo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                required
              />
            </div>
            <div className="space-y-2">
              <Input 
                placeholder="Nombre de usuario (ej: alex_nova)" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                required
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Correo Electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                required
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Contraseña Maestra" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                required
              />
              <div className="flex items-start gap-2 p-3 bg-accent/5 rounded-xl border border-accent/10">
                <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Encriptación Cuántica Activa</span>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-accent hover:bg-accent/90 text-background font-black text-xs uppercase tracking-widest gap-2 group transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sincronizar Identidad'}
              <UserPlus className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            ¿Ya tienes un núcleo activo? <Link href="/login" className="text-accent font-black hover:underline">Accede aquí</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}