'use server';

/**
 * @fileOverview Generates a completely useless fact on demand.
 *
 * - generateUselessFact - A function that generates a useless fact.
 * - GenerateUselessFactInput - The input type for the generateUselessFact function.
 * - GenerateUselessFactOutput - The return type for the generateUselessFact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUselessFactInputSchema = z.object({
  request: z.string().optional().describe('An optional request for a specific type of useless fact.'),
});
export type GenerateUselessFactInput = z.infer<typeof GenerateUselessFactInputSchema>;

const GenerateUselessFactOutputSchema = z.object({
  fact: z.string().describe('A completely useless fact.'),
});
export type GenerateUselessFactOutput = z.infer<typeof GenerateUselessFactOutputSchema>;

export async function generateUselessFact(input: GenerateUselessFactInput): Promise<GenerateUselessFactOutput> {
  return generateUselessFactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUselessFactPrompt',
  input: {schema: GenerateUselessFactInputSchema},
  output: {schema: GenerateUselessFactOutputSchema},
  prompt: `You are a useless fact generator. Generate a completely useless and random fact. Optional user request: {{{request}}}`,
});

const generateUselessFactFlow = ai.defineFlow(
  {
    name: 'generateUselessFactFlow',
    inputSchema: GenerateUselessFactInputSchema,
    outputSchema: GenerateUselessFactOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
