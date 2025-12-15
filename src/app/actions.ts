'use server';

import {
  generateUselessFact as generateUselessFactFlow,
  type GenerateUselessFactInput,
  type GenerateUselessFactOutput
} from '@/ai/flows/generate-useless-fact';

export async function getUselessFact(input: GenerateUselessFactInput): Promise<GenerateUselessFactOutput> {
  return await generateUselessFactFlow(input);
}
