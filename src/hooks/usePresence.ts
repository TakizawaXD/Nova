'use client';

import { useEffect, useRef } from 'react';
import { updateUserPresence } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';

export function usePresence() {
  const { user } = useAuth();
  const lastActive = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    // Actualizar a ONLINE al montar
    updateUserPresence(user.uid, 'online').catch(console.error);

    const handleActivity = () => {
      lastActive.current = Date.now();
      // Si antes estábamos en IDLE, volver a ONLINE
      // Pero para evitar demasiadas escrituras, lo hacemos solo si ha pasado cierto tiempo
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateUserPresence(user.uid, 'online').catch(console.error);
      } else {
        updateUserPresence(user.uid, 'idle').catch(console.error);
      }
    };

    // Monitorizar actividad
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    // Timer para detectar IDLE (5 minutos)
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const diff = now - lastActive.current;
      if (diff > 5 * 60 * 1000) { // 5 minutos
        updateUserPresence(user.uid, 'idle').catch(console.error);
      } else if (document.visibilityState === 'visible') {
        // Asegurar que estamos online si hubo actividad reciente
        updateUserPresence(user.uid, 'online').catch(console.error);
      }
    }, 60000); // Revisar cada minuto

    // Cleanup al cerrar o desmontar
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Intentar marcar como offline (opcional, Firebase tiene mejores maneras pero esto ayuda)
      updateUserPresence(user.uid, 'offline').catch(console.error);
    };
  }, [user]);
}
