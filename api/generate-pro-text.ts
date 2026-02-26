import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { difficulty, topic, problemKeys } = req.body;

  try {
    // Get an active token from Supabase
    const { data: tokens, error } = await supabase
      .from('github_tokens')
      .select('*')
      .eq('status', 'active')
      .order('id', { ascending: true });

    if (error || !tokens || tokens.length === 0) {
      return res.status(500).json({ error: 'No active GitHub tokens available' });
    }

    for (const tokenRow of tokens) {
      const tokenValue = process.env[tokenRow.token_name];
      if (!tokenValue) {
        // If env var is missing, mark as out
        await supabase.from('github_tokens').update({ status: 'out' }).eq('id', tokenRow.id);
        continue;
      }

      try {
        const client = new OpenAI({ baseURL: "https://models.inference.ai.azure.com", apiKey: tokenValue });
        
        let prompt = `Generate a typing practice text for a ${difficulty} level typist. `;
        if (topic) prompt += `The topic should be about: ${topic}. `;
        if (problemKeys && problemKeys.length > 0) {
          prompt += `The text MUST frequently use these specific characters to help the user practice them: ${problemKeys.join(', ')}. `;
        }
        prompt += `The text should be natural, engaging, and exactly 3-4 sentences long. Do not include any conversational filler, just the text itself.`;

        const response = await client.chat.completions.create({
          messages: [
            { role: "system", content: "You are a helpful assistant that generates typing practice texts." },
            { role: "user", content: prompt }
          ],
          model: "gpt-4o",
          temperature: 0.8,
          max_tokens: 150,
        });

        const text = response.choices[0].message.content;
        if (!text) throw new Error("No text generated");

        return res.status(200).json({ text });
      } catch (e) {
        console.error(`Token ${tokenRow.token_name} failed:`, e);
        // Mark as out and try next
        await supabase.from('github_tokens').update({ status: 'out' }).eq('id', tokenRow.id);
      }
    }

    res.status(500).json({ error: 'All GitHub tokens failed or are exhausted' });
  } catch (error: any) {
    console.error('Pro text generation error:', error);
    res.status(500).json({ error: error.message });
  }
}
