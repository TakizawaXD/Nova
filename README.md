# Nova | El Futuro de la Conexión Social

Nova es una plataforma social "todo-en-uno" diseñada con una estética futurista, construida para ser rápida, adictiva y completamente funcional desde el primer día.

## 🚀 Estado del Proyecto: TODO FUNCIONAL

### 🧠 Inteligencia Artificial (NovaAI)
- **Motor**: Impulsado por Google Gemini a través de Genkit.
- **NovaAI**: Asistente flotante con "núcleo cuántico" que ofrece sugerencias en tiempo real, redacta posts y resume el feed.
- **Exploración Inteligente**: Sistema de recomendación de contenido basado en IA que analiza posts populares para el usuario.

### 🔐 Sistema de Usuarios y Seguridad
- **Autenticación**: Firebase Auth integrado (Email/Password y Google).
- **Perfiles**: Creación automática de perfiles en Firestore al registrarse.
- **Seguridad**: Reglas de Firestore (`firestore.rules`) configuradas para proteger la privacidad de posts y mensajes.

### 📱 Funcionalidades Core
- **Feed Dinámico**: Suscripción en tiempo real a publicaciones. Soporte para texto e imágenes.
- **Historias (Stories)**: Sistema de contenido efímero con expiración automática de 24 horas.
- **Chat Real-time**: Mensajería privada instantánea con historial y estados de conexión.
- **Marketplace P2P**: Tienda comunitaria funcional con categorías y búsqueda.
- **Explorar**: Descubrimiento de contenido curado por IA.

### 🎨 Diseño y Estética
- **Estilo**: Glassmorphism premium (desenfoques, transparencias y bordes redondeados).
- **Colores**: Dark Mode por defecto con acentos en Violeta Eléctrico y Azul Neón.
- **Interactividad**: Animaciones suaves con Tailwind CSS y efectos de "flotación" en tarjetas.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
- **UI Components**: Shadcn UI, Lucide Icons.
- **Backend/DB**: Firebase (Auth, Firestore).
- **AI Framework**: Genkit 1.x.

## 🏃 Cómo ejecutar
1. Instalar dependencias: `npm install`
2. Configurar variables de entorno en `.env`.
3. Ejecutar desarrollo: `npm run dev`
4. Ejecutar Genkit: `npm run genkit:dev`

---
*Nova: Construyendo la red social del 2030, hoy.*
