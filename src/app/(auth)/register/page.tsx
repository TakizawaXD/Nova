'use client';

import { useState, useRef } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, UserPlus, ShieldCheck, Loader2, Info, Camera, Eye, EyeOff, AtSign, Mail, Lock, ArrowRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { isUsernameAvailable } from '@/lib/db';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { uploadToSupabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const validatePassword = (pass: string) => {
    return pass.length >= 8 && /[A-Z]/.test(pass) && /\d/.test(pass) && /[!@#$%^&*(),.?":{}|<>]/.test(pass);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Archivo muy grande', description: 'La imagen debe pesar menos de 5MB.' });
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(formData.password)) {
      toast({
        variant: 'destructive',
        title: 'Contraseña débil',
        description: 'Mínimo 8 caracteres, una mayúscula, un número y un símbolo.',
      });
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (!avatarPreview) {
      toast({ variant: 'destructive', title: 'Foto requerida', description: 'Debes subir una foto de perfil para continuar.' });
      return;
    }

    const cleanUsername = formData.username.toLowerCase().trim().replace(/\s/g, '_');

    setLoading(true);
    try {
      const available = await isUsernameAvailable(cleanUsername);
      if (!available) {
        toast({ variant: 'destructive', title: 'Username ocupado', description: 'Ese alias ya existe. Elige otro.' });
        setLoading(false);
        setStep(1);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      let photoURL = '';
      if (avatarFile) {
        try {
          photoURL = await uploadToSupabase(avatarFile, 'avatars', `${user.uid}/avatar`);
        } catch (uploadError: any) {
          console.error("Error subiendo avatar a Supabase:", uploadError);
          toast({ variant: 'destructive', title: 'Error de subida', description: 'No se pudo subir tu foto de perfil.' });
          setLoading(false);
          return;
        }
      }

      await updateProfile(user, { displayName: cleanUsername, photoURL });

      const profileData = {
        uid: user.uid,
        displayName: cleanUsername,
        username: cleanUsername,
        email: formData.email,
        photoURL,
        bannerURL: '',
        bio: '¡Nuevo en NOVAX! 🚀',
        location: 'NOVAX System',
        birthday: '',
        gender: 'otro',
        website: '',
        followersCount: 0,
        followingCount: 0,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), profileData);

      toast({ title: '¡Bienvenido a NOVAX!', description: 'Tu identidad fue sincronizada.' });
      router.push('/');
    } catch (error: any) {
      console.error("🚨 [Registro] Error crítico:", error);
      let msg = error.message || 'Error inesperado.';
      toast({ variant: 'destructive', title: 'Error de registro', description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030308] relative overflow-hidden px-4 py-20">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-primary/20 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-accent/20 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <Card className="glass border-white/10 rounded-[3.5rem] shadow-2xl overflow-hidden backdrop-blur-3xl bg-white/[0.02]">
          <div className="h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <CardContent className="p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_-10px_theme(colors.primary.DEFAULT)] -rotate-3 hover:rotate-0 transition-transform duration-500">
                <span className="text-white font-[1000] text-4xl tracking-tighter mt-1">NX</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter uppercase italic-nova text-white">ÚNETE A NOVAX</h1>
                <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.3em]">Protocolo de Identidad v4.0</p>
              </div>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-3 px-10">
              <div className={cn("flex-1 h-1.5 rounded-full transition-all duration-500", step >= 1 ? "bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" : "bg-white/10")} />
              <div className={cn("flex-1 h-1.5 rounded-full transition-all duration-500", step >= 2 ? "bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" : "bg-white/10")} />
            </div>

            {/* === STEP 1: Datos === */}
            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 ml-2">Alias Digital</Label>
                    <div className="relative group">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        name="username"
                        placeholder="tu_alias"
                        value={formData.username}
                        onChange={handleChange}
                        className="h-14 pl-12 bg-white/[0.03] border-white/5 rounded-2xl focus:border-primary/50 text-white placeholder:text-muted-foreground/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 ml-2">Correo de Red</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="email"
                        name="email"
                        placeholder="tu@frecuencia.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-14 pl-12 bg-white/[0.03] border-white/5 rounded-2xl focus:border-primary/50 text-white placeholder:text-muted-foreground/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60 ml-2">Encriptación de Acceso</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="h-14 pl-12 pr-12 bg-white/[0.03] border-white/5 rounded-2xl focus:border-primary/50 text-white placeholder:text-muted-foreground/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 px-2 pt-1 opacity-40">
                      <Info className="w-3 h-3 text-primary" />
                      <p className="text-[9px] font-black uppercase tracking-widest leading-none">Min 8 chars, 1 uppercase, 1 symbol</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                >
                  Continuar Sintonía <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-center text-xs text-muted-foreground/40 font-medium pt-2">
                  ¿Ya eres ciudadano?{' '}
                  <Link href="/login" className="text-primary font-black hover:underline ml-1">Inicia Sesión</Link>
                </p>
              </form>
            )}

            {/* === STEP 2: Foto === */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight italic-nova">VISUAL DE PERFIL</h2>
                  <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-bold">Cada nodo necesita un rostro</p>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative w-44 h-44 rounded-[3rem] border-2 border-dashed transition-all duration-500 group overflow-hidden shadow-2xl",
                      avatarPreview
                        ? "border-primary shadow-primary/20"
                        : "border-white/10 hover:border-primary/40 bg-white/[0.02]"
                    )}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                        <Camera className="w-10 h-10" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Sincronizar Imagen</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex items-center gap-3 p-4 bg-white/[0.03] rounded-2xl border border-white/5 w-full">
                    <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest leading-tight">Tu visual será encriptada en la base de datos de NOVAX</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="flex-1 h-14 rounded-2xl border border-white/5 text-muted-foreground/40 hover:text-white font-black text-xs uppercase tracking-widest bg-white/[0.02]"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Atrás
                  </Button>
                  <Button
                    type="button"
                    disabled={!avatarPreview || loading}
                    onClick={handleRegister}
                    className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                      <><UserPlus className="w-4 h-4 mr-2" /> Crear Ciudadanía</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.5em] mt-8">
          © 2026 NOVAX SYSTEM • IDENTITY PROTOCOL
        </p>
      </div>
    </div>
  );
}
