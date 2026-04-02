# 🕰 NovaSphere | Changelog (Registro de Evolución)

Todas las alteraciones notables en el código de NovaSphere se documentan en este archivo.

---

## [1.19.0] - "PWA & Social Evolution" - 2026-04-02

### 🛸 Progressive Web App (PWA)
- **Instalación Nativa**: Se implementó `manifest.json` y meta-tags para permitir la instalación de NovaSphere en iOS/Android.
- **Botón de Descarga**: Añadido componente flotante `InstallButton.tsx` con estética Cyberpunk para facilitar la adopción nativa.
- **Identidad Visual**: El nuevo logo vectorial se ha distribuido en los directorios de iconos de la App.

### 📸 Sistema de Destellos (Stories 2.0)
- **Agrupación Inteligente**: Las historias ahora se agrupan por autor (estilo WhatsApp/Instagram), optimizando el espacio del feed.
- **Anillo Segmentado**: El borde del avatar refleja dinámicamente la cantidad de historias activas del usuario.
- **Navegación Táctil**: Implementada navegación de izquierda/derecha en el visor de historias con indicadores de progreso segmentados.

### 🧬 Gestión de Contenido (CRUD)
- **Borrado de Post**: Corregida lógica de autoría; ahora la eliminación de publicaciones es 100% precisa vía UID.
- **Borrado de Comentarios**: Se añadió la capacidad de eliminar comentarios propios en los hilos de conversación.
- **Borrado de Mensajes**: Implementada función en el núcleo de la DB para eliminar mensajes directos.

### 🛡 Seguridad & Privacidad
- **Firestore Rules Reforzadas**: Los mensajes privados ahora están blindados; solo los participantes del chat tienen autorización de lectura.
- **Auditoría de Perfil**: Refinamiento de metadatos de usuario para asegurar la persistencia de estados y fotos.

### 📝 Documentación
- **GitHub Ready**: Creación de `README.md` profesional para la comunidad de desarrolladores y usuarios.

---

## [1.18.0] - "Marketplace Restoration" - 2026-04-01

### 🛒 Tienda Nova Credit
- **Reconstrucción Total**: Solución de errores JSX y restauración del diseño responsivo en `marketplace/page.tsx`.
- **Lógica Comercial**: Implementación de funciones `handlePurchase` y `handleDelete` para el inventario de productos.
- **UX/UI**: Skeletons de carga y gradientes dinámicos en las tarjetas de productos.

---

## [1.0.0] - [1.17.0] - "The Foundation"
- **Desarrollo del Dashboard Principal.**
- **Integración de NovaAI (Fase Experimental).**
- **Sistema de Autenticación Firebase.**
- **Navegación Móvil (Sidebar & Navbar).**

---

> Propulsado por **Nova Sphere Engine**. Mantén el pulso de la señal.
