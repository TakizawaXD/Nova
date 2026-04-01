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
        // Suscribirse al perfil en tiempo real
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(
          profileRef, 
          (snapshot) => {
            if (snapshot.exists()) {
              setProfile({ ...snapshot.data(), uid: firebaseUser.uid });
            } else {
              setProfile(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error al suscribirse al perfil:", error);
            // Si hay error de permisos o no existe, permitimos que la app cargue 
            // pero sin perfil completo.
            setProfile(null);
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