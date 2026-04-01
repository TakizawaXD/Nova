
'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Bell, Moon, Sun, Languages, Trash2, Key, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div>
        <h1 className="text-4xl font-black tracking-tighter uppercase">CONFIGURACIÓN</h1>
        <p className="text-muted-foreground mt-2">Ajusta tu experiencia en el núcleo de Nova.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar de Ajustes */}
        <div className="md:col-span-4 space-y-2">
          <SettingsNav icon={User} label="Perfil" active />
          <SettingsNav icon={Shield} label="Privacidad & Seguridad" />
          <SettingsNav icon={Bell} label="Notificaciones" />
          <SettingsNav icon={Moon} label="Apariencia" />
          <SettingsNav icon={Languages} label="Idioma" />
          <Separator className="my-6 bg-white/5" />
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="w-full justify-start gap-3 h-12 text-red-500 hover:bg-red-500/10 rounded-2xl font-bold transition-all"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </Button>
        </div>

        {/* Panel Principal */}
        <div className="md:col-span-8 space-y-6">
          <Card className="glass border-white/5 rounded-[2.5rem]">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Cuenta & Identidad</CardTitle>
              <CardDescription>Gestiona tus credenciales de acceso.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre de Usuario</Label>
                  <Input disabled value={profile?.username} className="bg-white/5 border-white/10 rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Correo Electrónico</Label>
                  <Input disabled value={profile?.email} className="bg-white/5 border-white/10 rounded-xl h-12" />
                </div>
              </div>
              <Button variant="outline" className="rounded-xl border-white/10 gap-2 h-12 font-bold w-full">
                <Key className="w-4 h-4" /> Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-white/5 rounded-[2.5rem]">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Privacidad de la Red</CardTitle>
              <CardDescription>Controla quién puede verte en NovaSphere.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Perfil Público</p>
                  <p className="text-xs text-muted-foreground">Cualquiera puede ver tus posts y reels.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Confirmación de Lectura</p>
                  <p className="text-xs text-muted-foreground">Muestra cuando has leído los mensajes.</p>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tighter text-red-500">Zona de Peligro</CardTitle>
              <CardDescription className="text-red-500/70">Estas acciones no se pueden deshacer.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Button variant="destructive" className="w-full h-12 rounded-xl gap-2 font-black uppercase tracking-widest">
                <Trash2 className="w-4 h-4" /> Eliminar Cuenta Definitivamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingsNav({ icon: Icon, label, active = false }: any) {
  return (
    <Button 
      variant="ghost" 
      className={cn(
        "w-full justify-start gap-3 h-12 rounded-2xl font-bold transition-all",
        active ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-white/5 text-muted-foreground hover:text-white"
      )}
    >
      <Icon className="w-5 h-5" /> {label}
    </Button>
  );
}
