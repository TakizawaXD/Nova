'use server';
/**
 * @fileOverview An AI agent for discovering and summarizing popular posts on NovaSphere.
 *
 * - discoverPopularPosts - A function that handles the AI-enhanced post discovery process.
 * - AiEnhancedPostDiscoveryInput - The input type for the discoverPopularPosts function.
 * - AiEnhancedPostDiscoveryOutput - The return type for the discoverPopularPosts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PopularPostSchema = z.object({
  id: z.string().describe('The unique identifier of the post.'),
  content: z.string().describe('The main text content of the post.'),
  mediaUrl: z.string().optional().describe('Optional URL to the media attached to the post.'),
  likes: z.number().describe('Number of likes the post has received.'),
  comments: z.number().describe('Number of comments the post has received.'),
  shares: z.number().describe('Number of shares the post has received.'),
});

const AiEnhancedPostDiscoveryInputSchema = z.object({
  popularPosts: z.array(PopularPostSchema).describe('A list of popular posts to be summarized and recommended.'),
});
export type AiEnhancedPostDiscoveryInput = z.infer<typeof AiEnhancedPostDiscoveryInputSchema>;

const RecommendedPostSchema = z.object({
  postId: z.string().describe('The unique identifier of the original post.'),
  summary: z.string().describe('A concise, AI-generated summary of the post content.'),
  originalContent: z.string().describe('The full original text content of the post.'),
  mediaUrl: z.string().optional().describe('Optional URL to the media attached to the original post.'),
});

const AiEnhancedPostDiscoveryOutputSchema = z.object({
  recommendedPosts: z.array(RecommendedPostSchema).describe('A list of popular posts with AI-generated summaries.'),
});
export type AiEnhancedPostDiscoveryOutput = z.infer<typeof AiEnhancedPostDiscoveryOutputSchema>;

export async function discoverPopularPosts(input: AiEnhancedPostDiscoveryInput): Promise<AiEnhancedPostDiscoveryOutput> {
  return aiEnhancedPostDiscoveryFlow(input);
}

const aiEnhancedPostDiscoveryPrompt = ai.definePrompt({
  name: 'aiEnhancedPostDiscoveryPrompt',
  input: { schema: AiEnhancedPostDiscoveryInputSchema },
  output: { schema: AiEnhancedPostDiscoveryOutputSchema },
  prompt: `You are an AI social media content analyst for NovaSphere. Your task is to review a list of popular posts and provide a concise, engaging summary for each.

The summaries should highlight the key topic or content of the post, making users want to click and read more.

Analyze the following popular posts:

{{#each popularPosts}}
---
Post ID: {{this.id}}
Content: "{{this.content}}"
Likes: {{this.likes}}
Comments: {{this.comments}}
Shares: {{this.shares}}
{{#if this.mediaUrl}}Media URL: {{this.mediaUrl}}{{/if}}
---
{{/each}}

Based on the above, generate a list of recommended posts, each with a concise summary. Ensure the output strictly follows the JSON schema provided.`,
});

const aiEnhancedPostDiscoveryFlow = ai.defineFlow(
  {
    name: 'aiEnhancedPostDiscoveryFlow',
    inputSchema: AiEnhancedPostDiscoveryInputSchema,
    outputSchema: AiEnhancedPostDiscoveryOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await aiEnhancedPostDiscoveryPrompt(input);
      if (!output) throw new Error('No output from AI');
      return output;
    } catch (error) {
      console.error('Error in AI discovery flow, falling back to local processing:', error);
      // Fallback: Manually create summaries if AI is unavailable or fails
      return {
        recommendedPosts: input.popularPosts.map(post => ({
          postId: post.id,
          summary: post.content.length > 100 
            ? post.content.substring(0, 100) + '...' 
            : post.content,
          originalContent: post.content,
          mediaUrl: post.mediaUrl
        }))
      };
    }
  }
);
