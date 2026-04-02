'use client';

import { useState, useRef } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, UserPlus, ShieldCheck, Loader2, Info, Camera, Eye, EyeOff, AtSign, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { isUsernameAvailable } from '@/lib/db';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { uploadToSupabase } from '@/lib/supabase';

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
  const [step, setStep] = useState<1 | 2>(1); // Step 1: datos, Step 2: foto
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

      // Subir avatar real a Supabase Storage
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
        bio: '¡Nuevo en Nova! 🚀',
        location: 'Nova City',
        birthday: '',
        gender: 'otro',
        website: '',
        followersCount: 0,
        followingCount: 0,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), profileData);

      toast({ title: '¡Bienvenido a Nova!', description: 'Tu identidad fue sincronizada.' });
      router.push('/');
    } catch (error: any) {
      console.error("🚨 [Registro] Error crítico:", error);
      let msg = error.message || 'Error inesperado.';
      if (error.code === 'auth/email-already-in-use') msg = 'Este correo ya tiene una cuenta.';
      if (error.code === 'auth/operation-not-allowed') msg = 'Registro desactivado. Actívalo en Firebase Console.';
      if (error.code === 'permission-denied') msg = 'Permisos insuficientes en base de datos (Firestore).';
      toast({ variant: 'destructive', title: 'Error de registro', description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030309] relative overflow-hidden px-4 py-10">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/8 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/30 mb-4 -rotate-6">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">ÚNETE A <span className="text-primary">NOVA</span></h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">Crea tu identidad digital</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className={cn("flex-1 h-1 rounded-full transition-all", step >= 1 ? "bg-primary" : "bg-white/10")} />
          <div className={cn("flex-1 h-1 rounded-full transition-all", step >= 2 ? "bg-primary" : "bg-white/10")} />
        </div>

        {/* === STEP 1: Datos === */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pl-1">Tu Alias</Label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="username"
                  placeholder="tu_alias_unico"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-white/[0.05] border-white/10 rounded-2xl focus-visible:ring-primary/50 text-white placeholder:text-muted-foreground/40"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pl-1">Correo</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-white/[0.05] border-white/10 rounded-2xl focus-visible:ring-primary/50 text-white placeholder:text-muted-foreground/40"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground pl-1">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 8 car., mayúscula, número, símbolo"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-12 h-12 bg-white/[0.05] border-white/10 rounded-2xl focus-visible:ring-primary/50 text-white placeholder:text-muted-foreground/40 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-1.5 px-1 mt-1">
                <Info className="w-3 h-3 text-primary/60 shrink-0" />
                <p className="text-[10px] text-muted-foreground/60">8+ chars, mayúscula, número y símbolo</p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 mt-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              Continuar →
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-1">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary font-black hover:underline">Inicia sesión</Link>
            </p>
          </form>
        )}

        {/* === STEP 2: Foto === */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Pon una foto</h2>
              <p className="text-sm text-muted-foreground">Es obligatoria. Así te reconocerán en Nova.</p>
            </div>

            {/* Avatar picker */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative w-32 h-32 rounded-[2.5rem] border-2 border-dashed transition-all group overflow-hidden",
                  avatarPreview
                    ? "border-primary"
                    : "border-white/20 hover:border-primary/50 bg-white/[0.03]"
                )}
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                    <Camera className="w-8 h-8" />
                    <span className="text-[10px] font-black uppercase tracking-wide">Subir foto</span>
                  </div>
                )}
                {avatarPreview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-7 h-7 text-white" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-[11px] text-muted-foreground/60 text-center">
                JPG, PNG o WEBP · Max 5 MB
              </p>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-2 p-3 bg-white/[0.03] rounded-2xl border border-white/[0.07]">
              <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
              <span className="text-[10px] text-muted-foreground font-medium">Protocolo de privacidad activo</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="flex-1 h-12 rounded-2xl border border-white/10 text-muted-foreground hover:text-white font-black text-xs uppercase tracking-widest"
              >
                ← Volver
              </Button>
              <Button
                type="button"
                disabled={!avatarPreview || loading}
                onClick={handleRegister}
                className="flex-1 h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:scale-100"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <><UserPlus className="w-4 h-4 mr-1.5" /> Crear cuenta</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
