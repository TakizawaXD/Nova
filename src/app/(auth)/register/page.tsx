'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, UserPlus, ShieldCheck, Loader2, Info, Calendar as CalendarIcon, MapPin, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { isUsernameAvailable } from '@/lib/db';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    birthday: '',
    city: '',
    gender: 'otro'
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const validatePassword = (pass: string) => {
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return pass.length >= 8 && hasUpperCase && hasNumbers && hasSpecialChar;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
      toast({ 
        variant: 'destructive', 
        title: 'Contraseña débil', 
        description: 'Mínimo 8 caracteres, una mayúscula, un número y un símbolo.' 
      });
      return;
    }

    const cleanUsername = formData.username.toLowerCase().trim().replace(/\s/g, '_');
    
    setLoading(true);
    try {
      const available = await isUsernameAvailable(cleanUsername);
      if (!available) {
        toast({ variant: 'destructive', title: 'Error', description: 'El nombre de usuario ya está en uso.' });
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.name });

      const profileData = {
        uid: user.uid,
        displayName: formData.name,
        username: cleanUsername,
        email: formData.email,
        photoURL: `https://picsum.photos/seed/${user.uid}/400/400`,
        bannerURL: `https://picsum.photos/seed/${user.uid}banner/1200/400`,
        bio: '¡Hola! Soy un nuevo explorador de Nova.',
        location: formData.city || 'Nova City',
        birthday: formData.birthday,
        gender: formData.gender,
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden py-12">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-accent/20 via-background to-primary/10 -z-10" />
      
      <Card className="w-full max-w-lg glass border-white/10 rounded-[2.5rem] shadow-2xl animate-fade-in overflow-hidden relative">
        <div className="h-2 bg-gradient-to-r from-accent via-primary to-accent animate-pulse" />
        <CardHeader className="text-center pt-8">
          <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-4 electric-glow -rotate-6">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter uppercase">ÚNETE A NOVA</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Crea tu identidad digital avanzada y completa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest ml-1">Nombre Real</Label>
                <div className="relative">
                   <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input 
                    name="name"
                    placeholder="Ej: Alex Rivera" 
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest ml-1">Username Único</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">@</span>
                  <Input 
                    name="username"
                    placeholder="alex_nova" 
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-8 h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest ml-1">Correo Electrónico</Label>
              <Input 
                type="email" 
                name="email"
                placeholder="tu@correo.com" 
                value={formData.email}
                onChange={handleChange}
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest ml-1">Fecha de Nacimiento</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest ml-1">Ciudad de Origen</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    name="city"
                    placeholder="Nova City" 
                    value={formData.city}
                    onChange={handleChange}
                    className="pl-10 h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest ml-1">Contraseña Cuántica</Label>
              <Input 
                type="password" 
                name="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                className="h-12 bg-white/5 border-white/10 rounded-2xl focus:border-accent/50" 
                required
              />
              <div className="flex items-start gap-2 p-3 bg-accent/5 rounded-xl border border-accent/10">
                <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Debe tener 8+ caracteres, mayúscula, número y símbolo especial para máxima protección.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Protocolo de Privacidad Activo</span>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/90 text-background font-black text-xs uppercase tracking-widest gap-2 group transition-all shadow-lg shadow-accent/20 mt-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SINCRONIZAR IDENTIDAD'}
              <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            ¿Ya eres ciudadano de Nova? <Link href="/login" className="text-accent font-black hover:underline">Accede a tu núcleo</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
