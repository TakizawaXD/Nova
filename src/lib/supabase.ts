import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing. Media uploads will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Función universal para subir archivos a Supabase Storage con deduplicación por timestamp
 */
export async function uploadToSupabase(
  file: File | Blob,
  bucket: string,
  path: string
): Promise<string> {
  // Generar un nombre único para evitar colisiones si el path es genérico
  const fileExt = file instanceof File ? file.name.split('.').pop() : 'webm';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const fullPath = path.includes('.') ? path : `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('❌ Error subiendo a Supabase:', error);
    throw error;
  }

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fullPath);

  return publicUrl;
}
