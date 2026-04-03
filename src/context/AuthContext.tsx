'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Forzar persistencia local para asegurar continuidad entre redirecciones
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const initializeAuth = async () => {
      try {
        // Primero capturamos el resultado de cualquier redirección pendiente
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Resultado de redirección capturado en el núcleo:", result.user.email);
          // Al capturar un resultado, onAuthStateChanged se disparará después, así que no bajamos el loading aún
        }
      } catch (error) {
        console.error("Error global de redirección:", error);
      }

      // Suscribirse a cambios de estado de autenticación
      const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        
        // Si NO hay usuario tras el chequeo de redirect y onAuthStateChanged, bajamos el telón de carga
        if (!firebaseUser) {
          setProfile(null);
          setLoading(false);
        }
        // Si HAY usuario, el siguiente useEffect se encargará de cargar el perfil y bajar el loading
      });

      return unsubscribeAuth;
    };

    const authCleanup = initializeAuth();

    return () => {
      authCleanup.then(unsubscribe => unsubscribe && typeof unsubscribe === 'function' && (unsubscribe as any)());
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const profileRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(
      profileRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile({ ...snapshot.data(), uid: user.uid });
        } else {
          // Inicializar perfil si no existe (Social Login First Time)
          const name = user.displayName || 'Ciudadano NOVAX';
          const defaultProfile = {
            uid: user.uid,
            displayName: name,
            username: user.email?.split('@')[0] || user.uid.substring(0, 8),
            photoURL: user.photoURL || '',
            bio: 'Nuevo ciudadano en el ecosistema. 🚀',
            createdAt: new Date().toISOString(),
            followers: [],
            following: [],
            status: 'online',
            lastSeen: serverTimestamp(),
            setupComplete: false
          };
          
          setDoc(profileRef, defaultProfile).then(() => {
            setProfile(defaultProfile);
          }).catch(console.error);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error al suscribirse al perfil:", error);
        setProfile({ uid: user.uid, displayName: 'Usuario Nova' });
        setLoading(false);
      }
    );

    // Sistema de Presencia Avanzado con Detección de Actividad
    const lastActive = { current: Date.now() };
    
    const syncPresence = (status: 'online' | 'idle' | 'offline') => {
      setDoc(profileRef, { status, lastSeen: serverTimestamp() }, { merge: true }).catch(console.error);
    };

    const handleActivity = () => {
      if (lastActive.current < Date.now() - 30000) { // Solo sincronizar si han pasado 30s de la última actividad
         syncPresence('online');
      }
      lastActive.current = Date.now();
    };

    const handleVisibilityChange = () => {
      syncPresence(document.visibilityState === 'visible' ? 'online' : 'idle');
    };

    // Eventos de actividad
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat inicial
    syncPresence('online');

    // Timer para detectar IDLE (5 minutos de inactividad real)
    const presenceInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastActive.current > 5 * 60 * 1000) {
        syncPresence('idle');
      } else if (document.visibilityState === 'visible') {
        syncPresence('online');
      }
    }, 60000);

    const handleUnload = () => {
      syncPresence('offline');
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      unsubscribeProfile();
      clearInterval(presenceInterval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
      syncPresence('offline');
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);