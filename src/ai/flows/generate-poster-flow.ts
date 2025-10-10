'use server';
/**
 * @fileOverview An AI flow for generating movie posters.
 *
 * - generateMoviePoster - A function that generates a movie poster image from a movie name.
 * - GenerateMoviePosterInput - The input type for the generateMoviePoster function.
 * - GenerateMoviePosterOutput - The return type for the generateMoviePoster function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateMoviePosterInputSchema = z.object({
  movieName: z.string().describe('The name of the movie.'),
});
export type GenerateMoviePosterInput = z.infer<typeof GenerateMoviePosterInputSchema>;

const GenerateMoviePosterOutputSchema = z.object({
  posterUrl: z.string().describe('The data URI of the generated movie poster.'),
});
export type GenerateMoviePosterOutput = z.infer<typeof GenerateMoviePosterOutputSchema>;

export async function generateMoviePoster(input: GenerateMoviePosterInput): Promise<GenerateMoviePosterOutput> {
  return generateMoviePosterFlow(input);
}

const generateMoviePosterFlow = ai.defineFlow(
  {
    name: 'generateMoviePosterFlow',
    inputSchema: GenerateMoviePosterInputSchema,
    outputSchema: GenerateMoviePosterOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A movie poster for a film titled '${input.movieName}'. The poster should be visually striking, cinematic, high-quality, and evoke the genre of the movie. Do not include any text unless it is part of the movie title itself.`,
      config: {
        aspectRatio: '2:3'
      }
    });

    if (!media.url) {
      throw new Error('Image generation failed to return a URL.');
    }
    
    return { posterUrl: media.url };
  }
);
