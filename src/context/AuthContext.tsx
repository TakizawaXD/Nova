'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Suscribirse al perfil en tiempo real de forma segura
        const profileRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeProfile = onSnapshot(
          profileRef, 
          (snapshot) => {
            if (snapshot.exists()) {
              setProfile({ ...snapshot.data(), uid: firebaseUser.uid });
            } else {
              // Si el documento no existe (recién registrado), evitamos dejarlo en null indefinidamente
              setProfile({
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || 'Ciudadano Nova',
                username: 'usuario_' + firebaseUser.uid.substring(0, 5),
                photoURL: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200/200`
              });
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error al suscribirse al perfil (posibles reglas):", error);
            // Fallback para no bloquear la UI si las reglas fallan
            setProfile({ uid: firebaseUser.uid, displayName: 'Usuario Nova' });
            setLoading(false);
          }
        );

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);