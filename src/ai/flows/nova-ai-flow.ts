
'use server';
/**
 * @fileOverview Flujo central de NovaAI para asistencia inteligente.
 *
 * - novaAssistant - Función principal para procesar consultas de usuarios.
 * - NovaAssistantInput - Esquema de entrada.
 * - NovaAssistantOutput - Esquema de salida.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NovaAssistantInputSchema = z.object({
  userMessage: z.string().describe('El mensaje enviado por el usuario.'),
  userName: z.string().describe('El nombre del usuario actual.'),
  context: z.string().optional().describe('Contexto adicional como la página actual o el feed del usuario.'),
});
export type NovaAssistantInput = z.infer<typeof NovaAssistantInputSchema>;

const NovaAssistantOutputSchema = z.object({
  response: z.string().describe('La respuesta detallada de la IA.'),
  suggestions: z.array(z.string()).describe('Lista de acciones sugeridas basadas en la charla.'),
});
export type NovaAssistantOutput = z.infer<typeof NovaAssistantOutputSchema>;

export async function novaAssistant(input: NovaAssistantInput): Promise<NovaAssistantOutput> {
  return novaAssistantFlow(input);
}

const novaAssistantPrompt = ai.definePrompt({
  name: 'novaAssistantPrompt',
  input: { schema: NovaAssistantInputSchema },
  output: { schema: NovaAssistantOutputSchema },
  prompt: `Eres NovaAI, el núcleo de inteligencia cuántica de la red social Nova. 
Tu personalidad es futurista, eficiente, servicial y un poco carismática. 

Usuario: {{userName}}
Contexto: {{context}}
Mensaje: {{userMessage}}

Ayuda al usuario con sus tareas en la red social. Si te pide escribir un post, dáselo. Si te pide resumir algo, hazlo. 
Tus sugerencias deben ser botones de acción cortos.

Genera una respuesta atractiva y útil.`,
});

const novaAssistantFlow = ai.defineFlow(
  {
    name: 'novaAssistantFlow',
    inputSchema: NovaAssistantInputSchema,
    outputSchema: NovaAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await novaAssistantPrompt(input);
    return output!;
  }
);
