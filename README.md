# NovaSphere | The Next-Gen Interactive Social Ecosystem 🌌

NovaSphere es una plataforma social de élite diseñada bajo estrictos principios de ergonomía móvil, interactividad cuántica en tiempo real, y una identidad visual premium inspirada en el *Cyberpunk* y el *Glassmorphism*.

No es solo una red social clónica; es un **organismo vivo** que sincroniza a los usuarios en tiempo real, permitiéndoles enviarse voz, encuestar a su público, alterar su interfaz y explorar identidades bajo un motor UI extremadamente fluido (acelerado por IA).

---

## 🚀 Innovaciones y Capacidades (Núcleo v24.0)

- **Comunicaciones Instantáneas y Notas de Voz**: Sistema de Chat privado avanzado con indicadores de *"Escribiendo..."* en tiempo real (`typing indicators`) y una grabadora de **Notas de Voz Nativas** acelerada por WebRTC incrustada directamente en el área de mensajería (almacenamiento escalable con Firebase Storage).
- **Personalización Extrema (10 Temas Dinámicos)**: Incluye un potente motor de temas (*Tema Clásico, Ruby, Forest, Cyberpunk, Velvet, Deep Ocean, Solo Leveling, Gold, High Contrast y Modo Luz*), alterando la apariencia de toda la plataforma instantáneamente para ajustarse a la identidad del usuario.
- **Asistente Inercial (NovaAI)**: Una IA flotante y arrastrable libremente por tu pantalla (gracias a *Framer Motion*) que provee asistencia técnica y que opera de manera hiper-ligera sin molestar la vista. Totalmente configurable desde la sección de ajustes (con su nuevo selector de píldoras móviles).
- **Notificaciones Universales (Native Desktop & Web Push)**: Motor de detección de alertas en Navbar que te enviará *pings* al Sistema Operativo tan pronto recibas interacciones, incluso si la plataforma se encuentra minimizada. Soporta Sonido Cuántico direccional con validación asíncrona por interacción física.
- **Feed y Sondeo (Encuestas)**: Sincronización inmediata (sin latencia de algoritmos) con soporte multimedia. Podrás levantar paneles de votación dentro de los posts con voto único per cápita.
- **Modo PWA (App Móvil Autónoma)**: Listo para instalación profunda en el SO. La plataforma carece de bordes de navegador si se instala directamente desde iOS/Android. Contiene menús compactos (*Mobile Nav*) rediseñados para pulgares y priorización de lectura.

## 🛠 Arquitectura Tecnológica & Stack

La plataforma se sostiene en un entorno *Serverless* totalmente escalable, eliminando cuellos de botella mediante una arquitectura limpia:

- **Frontend Core**: **Next.js 14**, React 18, TypeScript, TailwindCSS v3.
- **Micro-interacciones UI**: `shadcn/ui`, *Framer Motion*, *Lucide Icons*.
- **Backend as a Service (BaaS)**: Firebase Suite (Firestore DB, Authentication, Firebase Storage para *Media/Audios*).
- **Formatos Temporales**: `date-fns` adaptado al castellano con renderización temporal optimizada.
- **Compilador Crítico**: Turbopack activado para recargas (HMR) ultrarrápidas y Build en caché.

---

## 📦 Instalación y Despliegue

NovaSphere está preparada para producción instantánea.

### Requerimientos Previos
- Node.js (v18+)
- Claves del entorno de Firebase (`.env.local` configurado con tus credenciales maestras y base de datos lista y estructurada bajo las reglas pre-compiladas `firestore.rules`).

### Instrucciones Locales

```bash
# 1. Copiar y mapear dependencias
npm install

# 2. Inicializar entorno del reactor de desarrollo local
npm run dev
```
La terminal compilará los módulos a máxima velocidad con Turbopack y montará NovaSphere en `http://localhost:3000`.

### Building para Producción
Para compilar la estructura para despliegue final en Vercel, Netlify o Firebase App Hosting, ejecuta:
```bash
npm run build
```
Esto generará los activos estáticos minimizados en la carpeta `.next`, resolviendo de forma estricta los chequeos del motor TypeScript para otorgar un rendimiento de 100/100 en Lighthouse.

---
*Proyectado meticulosamente para satisfacer la exigencia técnica, la modernidad visual y el rendimiento óptimo del mañana.*
