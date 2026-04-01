
'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: name,
        username: username.toLowerCase().replace(/\s/g, '_'),
        email: email,
        photoURL: `https://picsum.photos/seed/${user.uid}/200/200`,
        bio: '¡Hola! Soy nuevo en Nova.',
        createdAt: new Date().toISOString(),
      });

      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al registrar',
        description: error.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-accent/20 via-background to-primary/10 -z-10" />
      
      <Card className="w-full max-w-md glass border-white/10 rounded-[2.5rem] shadow-2xl animate-fade-in overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-accent via-primary to-accent animate-pulse" />
        <CardHeader className="text-center pt-8">
          <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-4 electric-glow -rotate-6">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter uppercase">ÚNETE A NOVA</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Crea tu identidad digital hoy mismo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Input 
                placeholder="Nombre completo" 
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
                placeholder="tu@correo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                required
              />
            </div>
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="Contraseña (mín. 8 caracteres)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl bg-accent hover:bg-accent/90 text-background font-black text-xs uppercase tracking-widest gap-2">
              {loading ? 'Creando...' : 'Crear Cuenta'} <UserPlus className="w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            ¿Ya tienes cuenta? <Link href="/login" className="text-accent font-black hover:underline">Inicia sesión aquí</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
