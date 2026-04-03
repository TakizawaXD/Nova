
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, Shield, Bell, Moon, Sun, Languages, 
  Trash2, Key, LogOut, Camera, Globe, 
  Smartphone, UserCheck, Mail, Sparkles, Bot 
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InstallButton } from '@/components/pwa/InstallButton';
import { uploadToSupabase } from '@/lib/supabase';

type SettingsTab = 'profile' | 'security' | 'privacy' | 'notifications' | 'theme' | 'language';

export default function SettingsPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(false);

  const [editProfile, setEditProfile] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    photoURL: profile?.photoURL || '',
    bannerURL: profile?.bannerURL || '',
    privacy: profile?.privacy || { showStatus: true, showProfile: true, allowDirectMessages: true }
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updates = { ...editProfile };

      // Upload banner if changed
      if (bannerFile) {
        updates.bannerURL = await uploadToSupabase(bannerFile, 'avatars', `${user.uid}/banner`);
      }

      // Upload avatar if changed
      if (avatarFile) {
        updates.photoURL = await uploadToSupabase(avatarFile, 'avatars', `${user.uid}/avatar`);
      }

      await updateDoc(doc(db, 'users', user.uid), updates);
      
      // Update local state and auth profile if needed (though AuthContext usually listens)
      setEditProfile(updates);
      setAvatarFile(null);
      setBannerFile(null);

      toast({ title: 'Perfil Sincronizado', description: 'Tus datos han sido actualizados en el núcleo.' });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (type === 'avatar') {
        setAvatarFile(file);
        setEditProfile(prev => ({ ...prev, photoURL: ev.target?.result as string }));
      } else {
        setBannerFile(file);
        setEditProfile(prev => ({ ...prev, bannerURL: ev.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass border-white/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
              <div className="h-24 sm:h-32 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 relative">
                {editProfile.bannerURL && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editProfile.bannerURL} alt="Banner" className="w-full h-full object-cover opacity-50" />
                )}
                <input 
                  type="file" 
                  ref={bannerInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'banner')}
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute bottom-4 right-4 bg-black/40 rounded-full text-white hover:bg-black/60"
                  onClick={() => bannerInputRef.current?.click()}
                >
                    <Camera className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-4 sm:p-8 pt-0 relative">
                <div className="flex justify-between items-end -translate-y-6 sm:-translate-y-8 mb-4">
                    <div className="relative group">
                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-2xl">
                            <AvatarImage src={editProfile.photoURL} alt={profile?.displayName} className="object-cover" />
                            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-black">{profile?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <input 
                          type="file" 
                          ref={avatarInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleFileChange(e, 'avatar')}
                        />
                        <div 
                          className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={() => avatarInputRef.current?.click()}
                        >
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <Button onClick={handleSaveProfile} disabled={loading} className="rounded-2xl bg-primary hover:bg-primary/80 font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-primary/20">
                        {loading ? 'Guardando...' : 'Actualizar Núcleo'}
                    </Button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Nombre Público</Label>
                            <Input 
                                value={editProfile.displayName} 
                                onChange={e => setEditProfile({...editProfile, displayName: e.target.value})}
                                className="bg-white/5 border-white/10 rounded-2xl h-14 font-medium" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Status Cuántico</Label>
                            <Input 
                                value={editProfile.photoURL.startsWith('data:') ? 'Imagen seleccionada...' : editProfile.photoURL} 
                                readOnly
                                className="bg-white/5 border-white/10 rounded-2xl h-14 font-medium opacity-50 cursor-not-allowed" 
                                placeholder="URL se generará al guardar"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Biografía Galáctica</Label>
                        <Textarea 
                            value={editProfile.bio} 
                            onChange={e => setEditProfile({...editProfile, bio: e.target.value})}
                            className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] resize-none font-medium p-6" 
                            placeholder="Cuéntanos sobre tu rol en el ecosistema..."
                        />
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'security':
        return (
          <Card className="glass border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 animate-fade-in">
            <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 mt-2 sm:mt-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Seguridad de Nodo
            </CardTitle>
            <div className="space-y-4 sm:space-y-8">
                <div className="flex sm:items-center flex-col sm:flex-row justify-between p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem] sm:rounded-3xl group gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black text-white italic">Protocolo de Contraseña</p>
                            <p className="text-xs text-muted-foreground uppercase font-medium mt-0.5">Último cambio: Hace 3 meses</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto rounded-xl border-white/10 hover:bg-white/5 h-10 px-6 font-black uppercase text-[10px] tracking-widest">Cambiar</Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem] sm:rounded-3xl group gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black text-white italic">2FA Factorización</p>
                            <p className="text-xs text-muted-foreground uppercase font-medium mt-0.5">Estado: Desactivado</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto rounded-xl border-white/10 hover:bg-white/5 h-10 px-6 font-black uppercase text-[10px] tracking-widest">Activar</Button>
                </div>
                <Separator className="bg-white/5" />
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Eliminación de Cuenta</h3>
                    <p className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-relaxed">Si decides eliminar tu cuenta, todos tus datos, posts y conexiones en NovaSphere se borrarán permanentemente del núcleo. Esta acción es irreversible.</p>
                    <Button variant="destructive" className="w-full h-12 sm:h-14 rounded-2xl gap-3 font-black uppercase tracking-widest text-[9px] sm:text-[11px] mt-2 group">
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:animate-bounce" /> Eliminar Identidad
                    </Button>
                </div>
            </div>
          </Card>
        );
      case 'privacy':
        return (
          <Card className="glass border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 animate-fade-in">
            <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 mt-2 sm:mt-0">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Privacidad del Nodo
            </CardTitle>
            <div className="space-y-6 sm:space-y-8 mt-4">
                <div className="space-y-6">
                    <PrivacyToggle 
                        title="Visibilidad de Señal" 
                        description="Hacer que tu estado (conectado/ausente) sea visible para otros." 
                        icon={Smartphone}
                        checked={editProfile.privacy.showStatus}
                        onChange={(val: boolean) => setEditProfile({...editProfile, privacy: {...editProfile.privacy, showStatus: val}})}
                    />
                    <Separator className="bg-white/5" />
                    <PrivacyToggle 
                        title="Perfil Público" 
                        description="Permitir que ciudadanos fuera de tu red vea tu biografía y posts." 
                        icon={User}
                        checked={editProfile.privacy.showProfile}
                        onChange={(val: boolean) => setEditProfile({...editProfile, privacy: {...editProfile.privacy, showProfile: val}})}
                    />
                    <Separator className="bg-white/5" />
                    <PrivacyToggle 
                        title="Transmisiones Directas" 
                        description="Permitir mensajes directos de usuarios que no sigues." 
                        icon={Mail}
                        checked={editProfile.privacy.allowDirectMessages}
                        onChange={(val: boolean) => setEditProfile({...editProfile, privacy: {...editProfile.privacy, allowDirectMessages: val}})}
                    />
                </div>
                <div className="mt-8 pt-8 border-t border-white/5">
                    <Button onClick={handleSaveProfile} disabled={loading} className="w-full rounded-2xl bg-primary hover:bg-primary/80 font-black uppercase tracking-widest text-[11px] h-14 shadow-xl shadow-primary/20">
                        {loading ? 'Sincronizando...' : 'Guardar Configuración de Privacidad'}
                    </Button>
                </div>
            </div>
          </Card>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <Card className="glass border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 animate-fade-in">
              <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-6 sm:mb-8 flex items-center gap-3 mt-2 sm:mt-0">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Avisos y Preferencias
              </CardTitle>
              <div className="space-y-6 sm:space-y-8">
                  <AIToggle />
                  <Separator className="bg-white/5" />
                  <NotificationToggle title="Interacciones" description="Likes, comentarios y menciones." icon={Sparkles} />
                  <NotificationToggle title="Mensajes Directos" description="Notificar nuevas transmisiones." icon={Mail} />
                  <NotificationToggle title="Conexiones" description="Cuando alguien te sigue." icon={UserCheck} />
                  <NotificationToggle title="Actualizaciones Nova" description="Noticias del núcleo y comunidad." icon={Globe} />
              </div>
            </Card>
            
            <Card className="glass border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 animate-fade-in">
               <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-6 sm:mb-8 flex items-center gap-3">
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Instalación Nativa PWA
               </CardTitle>
               <InstallButton inline={true} />
            </Card>
          </div>
        );
      case 'theme':
        return (
          <Card className="glass border-white/5 rounded-[2.5rem] p-8 animate-fade-in">
            <CardTitle className="text-xl font-black uppercase tracking-tighter mb-2 italic">Atmósferas Nova <span className="text-primary">•</span></CardTitle>
            <p className="text-sm text-muted-foreground mb-8">Personaliza la estética cuántica del ecosistema.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ThemeOption id="purple" name="Violet" color="bg-[#8b5cf6]" />
              <ThemeOption id="cyan" name="Synth" color="bg-[#06b6d4]" />
              <ThemeOption id="emerald" name="Echo" color="bg-[#10b981]" />
              <ThemeOption id="amber" name="Glow" color="bg-[#f59e0b]" />
              <ThemeOption id="rose" name="Rush" color="bg-[#f43f5e]" />
              <ThemeOption id="indigo" name="Flux" color="bg-[#6366f1]" />
              <ThemeOption id="slate" name="Void" color="bg-[#94a3b8]" />
            </div>
          </Card>
        );
      case 'language':
        return (
          <Card className="glass border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 animate-fade-in">
            <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-6 sm:mb-8 flex items-center gap-3 mt-2 sm:mt-0">
                <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Lenguaje de Interfaz
            </CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LanguageCard label="Español Latino" code="ES" active />
                <LanguageCard label="English / US" code="EN" />
                <LanguageCard label="Português / BR" code="PT" />
                <LanguageCard label="日本語 / JP" code="JP" />
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20 pt-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic leading-none">CONFIGURACIÓN <span className="text-primary truncate">NOVA</span></h1>
        <p className="text-muted-foreground mt-3 font-medium text-sm">Ajusta los parámetros de tu existencia digital en el núcleo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 flex overflow-x-auto lg:flex-col gap-2 pb-6 lg:pb-0 h-fit lg:sticky lg:top-24 hidden-scrollbar relative mt-4 lg:mt-0">
          <SettingsNavItem icon={User} label="Perfil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SettingsNavItem icon={Shield} label="Seguridad" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
          <SettingsNavItem icon={Globe} label="Privacidad" active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')} />
          <SettingsNavItem icon={Bell} label="Avisos" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
          <SettingsNavItem icon={Moon} label="Tema" active={activeTab === 'theme'} onClick={() => setActiveTab('theme')} />
          <SettingsNavItem icon={Languages} label="Idioma" active={activeTab === 'language'} onClick={() => setActiveTab('language')} />
          <Button 
              onClick={handleLogout}
              variant="ghost" 
              className="hidden lg:flex rounded-2xl gap-3 h-11 px-4 mt-4 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest text-[10px] transition-all border border-red-500/10 hover:border-red-500/20 w-full justify-start"
          >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
          </Button>
        </div>

        {/* Dynamic Content Area */}
        <div className="lg:col-span-9">
            {renderContent()}
        </div>
      </div>
    </div>
  );
}

function SettingsNavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <Button 
      variant="ghost" 
      onClick={onClick}
      className={cn(
        "flex-shrink-0 lg:w-full justify-center lg:justify-start gap-2 lg:gap-4 h-11 lg:h-14 rounded-full lg:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-[11px] transition-all px-5 lg:px-6 border",
        active 
            ? "bg-primary/10 text-primary border-primary/50 shadow-[0_0_20px_-10px_theme(colors.primary.DEFAULT)]" 
            : "border-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", active ? "text-primary flex-shrink-0" : "text-muted-foreground flex-shrink-0")} /> 
      <span className="whitespace-nowrap">{label}</span>
    </Button>
  );
}

function NotificationToggle({ title, description, icon: Icon }: any) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between group gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-xl shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-0.5">
                    <p className="font-black text-white italic text-sm sm:text-base tracking-tight">{title}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{description}</p>
                </div>
            </div>
            <Switch defaultChecked className="data-[state=checked]:bg-primary h-6 w-10 sm:h-7 sm:w-12 shrink-0 self-end sm:self-auto" />
        </div>
    );
}

function AIToggle() {
    const { toast } = useToast();
    const [disabled, setDisabled] = useState(false);
    useEffect(() => {
        setDisabled(localStorage.getItem('nova-ai-disabled') === 'true');
    }, []);
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between group gap-4 bg-primary/5 border border-primary/20 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] -z-10" />
            <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center text-white shadow-[0_0_15px_theme(colors.primary.DEFAULT)] shrink-0">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-0.5">
                    <p className="font-black text-white italic text-sm sm:text-base tracking-tight">Asistente NovaAI</p>
                    <p className="text-[9px] sm:text-[10px] text-primary/80 font-bold uppercase tracking-widest">Burbuja flotante cuántica</p>
                </div>
            </div>
            <Switch 
                checked={!disabled} 
                onCheckedChange={(c) => {
                    localStorage.setItem('nova-ai-disabled', (!c).toString());
                    setDisabled(!c);
                    window.dispatchEvent(new Event('nova-settings-changed'));
                    toast({ title: c ? "NovaAI Encendida" : "NovaAI Apagada", description: "Configuración actualizada en el núcleo." });
                }} 
                className="data-[state=checked]:bg-primary h-6 w-10 sm:h-7 sm:w-12 shrink-0 self-start sm:self-auto ml-auto" 
            />
        </div>
    );
}

function LanguageCard({ label, code, active = false }: any) {
    return (
        <div className={cn(
            "p-6 rounded-3xl border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between group",
            active ? "border-primary bg-primary/10 shadow-xl shadow-primary/5" : "border-white/5 hover:border-white/10 bg-white/[0.02]"
        )}>
            <div className="space-y-1">
                <p className={cn("font-black text-lg transition-colors", active ? "text-white" : "text-muted-foreground group-hover:text-white")}>{label}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">{code} - Protocol active</p>
            </div>
            <div className={cn("w-3 h-3 rounded-full", active ? "bg-primary animate-pulse shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" : "bg-white/10")} />
        </div>
    );
}

function ThemeOption({ id, name, color }: { id: any; name: string; color: string }) {
  const { theme, setTheme } = useTheme();
  const isActive = theme === id;

  return (
    <button 
      onClick={() => setTheme(id)}
      className={cn(
        "flex flex-col items-center gap-4 p-5 rounded-[2rem] border-2 transition-all hover:scale-110 active:scale-95 group relative overflow-hidden",
        isActive 
            ? "border-primary bg-primary/10 shadow-2xl shadow-primary/20" 
            : "border-white/5 hover:border-white/10 bg-white/[0.02]"
      )}
    >
      <div className={cn("w-14 h-14 rounded-2xl shadow-2xl transition-all duration-500 group-hover:rotate-12", color)} />
      <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")}>{name}</span>
      {isActive && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />
      )}
    </button>
  );
}

function PrivacyToggle({ title, description, icon: Icon, checked, onChange }: any) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between group gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-xl shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-0.5">
                    <p className="font-black text-white italic text-sm sm:text-base tracking-tight">{title}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-relaxed max-w-sm">{description}</p>
                </div>
            </div>
            <Switch 
                checked={checked} 
                onCheckedChange={onChange}
                className="data-[state=checked]:bg-primary h-6 w-10 sm:h-7 sm:w-12 shrink-0 self-start sm:self-auto ml-auto" 
            />
        </div>
    );
}
