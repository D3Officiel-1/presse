'use server';

/**
 * @fileOverview A flow for generating smart reply suggestions based on the content of a message.
 *
 * - generateSmartReplySuggestions - A function that generates smart reply suggestions.
 * - SmartReplySuggestionsInput - The input type for the generateSmartReplySuggestions function.
 * - SmartReplySuggestionsOutput - The return type for the generateSmartReplySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartReplySuggestionsInputSchema = z.object({
  messageContent: z
    .string()
    .describe('Le contenu du dernier message reçu.'),
});
export type SmartReplySuggestionsInput = z.infer<typeof SmartReplySuggestionsInputSchema>;

const SmartReplySuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('Un tableau de suggestions de réponses intelligentes.'),
});
export type SmartReplySuggestionsOutput = z.infer<typeof SmartReplySuggestionsOutputSchema>;

export async function generateSmartReplySuggestions(
  input: SmartReplySuggestionsInput
): Promise<SmartReplySuggestionsOutput> {
  return smartReplySuggestionsFlow(input);
}

const smartReplySuggestionsPrompt = ai.definePrompt({
  name: 'smartReplySuggestionsPrompt',
  input: {schema: SmartReplySuggestionsInputSchema},
  output: {schema: SmartReplySuggestionsOutputSchema},
  prompt: `Vous êtes un assistant conçu pour fournir des suggestions de réponses intelligentes pour un message donné.

  Étant donné le message suivant, générez trois suggestions de réponses courtes et pertinentes parmi lesquelles l'utilisateur peut choisir.
  Les réponses doivent être appropriées pour une conversation informelle.

  Message: {{{messageContent}}}

  Vos suggestions :`,
});

const smartReplySuggestionsFlow = ai.defineFlow(
  {
    name: 'smartReplySuggestionsFlow',
    inputSchema: SmartReplySuggestionsInputSchema,
    outputSchema: SmartReplySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await smartReplySuggestionsPrompt(input);
    return output!;
  }
);
