import Groq from 'groq-sdk';
import { CLARITY_SYSTEM_PROMPT } from '../../../lib/clarityPrompt';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { responseText, userPrompt, searchPerformed } = await req.json();

    if (!responseText || !userPrompt) {
      return new Response(JSON.stringify({ error: "Missing responseText or userPrompt." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: CLARITY_SYSTEM_PROMPT },
        { 
          role: 'user', 
          content: `
USER PROMPT: ${userPrompt}

AI RESPONSE TO ANALYZE:
${responseText}

Return JSON only. No preamble. No markdown fences.
          `
        }
      ],
      stream: false,
      max_tokens: 1024,
      temperature: 0.3, // Low temp for consistent structured output
    });

    let raw = completion.choices[0].message.content || '{}';
    
    // Clean raw text to ensure it only has JSON (sometimes LLMs include markdown code block fences anyway)
    raw = raw.trim();
    if (raw.startsWith('```json')) {
      raw = raw.substring(7);
    } else if (raw.startsWith('```')) {
      raw = raw.substring(3);
    }
    if (raw.endsWith('```')) {
      raw = raw.substring(0, raw.length - 3);
    }
    raw = raw.trim();

    const parsed = JSON.parse(raw);

    if (searchPerformed) {
      if (!parsed.assumptions) {
        parsed.assumptions = [];
      }
      parsed.assumptions.unshift({
        id: 'web-search-assumption',
        text: 'Claude used live web search results to answer this question',
        isStatic: true,
        impact: 'low',
        suggestions: []
      });
    }

    return Response.json(parsed);
  } catch (error: any) {
    console.error("Clarity API error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
