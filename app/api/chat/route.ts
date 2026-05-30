import Groq from 'groq-sdk';
import { MAIN_SYSTEM_PROMPT } from '../../../lib/chatPrompt';
import { tavily } from '@tavily/core';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
const tavilyClient = process.env.TAVILY_API_KEY 
  ? tavily({ apiKey: process.env.TAVILY_API_KEY }) 
  : null;

function detectSearchNeed(message: string, isFollowUp: boolean): boolean {
  const text = message.toLowerCase();

  // Skip conversational messages
  if (text.includes('thanks') || text.includes('can you help me') || text === 'hi' || text === 'hello' || text === 'hey') {
    return false;
  }

  // Skip conceptual or creative requests
  if (
    text.includes('explain quantum physics') || 
    text.includes('write a poem') || 
    text.includes('help me structure this') ||
    text.includes('write a story')
  ) {
    return false;
  }

  // Skip follow-up messages that clearly refer to prior context
  if (isFollowUp && (text.startsWith('why ') || text.startsWith('how ') || text.includes('that') || text.includes('it') || text.length < 15)) {
    return false;
  }

  // Triggers
  const signals = [
    '2024', '2025', '2026', 'today', 'this week', 'latest', 'recent', 'now', 'currently',
    'what happened', 'news about', 'update on',
    'stock', 'price', 'rate', 'score',
    'who is the ceo', 'who won', 'who is'
  ];

  if (signals.some(sig => text.includes(sig))) {
    return true;
  }

  return false;
}

export async function POST(req: Request) {
  try {
    const { messages, correctedAssumptions } = await req.json();

    // Map message list to format compatible with Groq SDK
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Detect search need on last user message
    const lastUserMessageObj = messages[messages.length - 1];
    const userMessage = lastUserMessageObj?.content || '';
    const isFollowUp = messages.length > 2;

    const shouldSearch = detectSearchNeed(userMessage, isFollowUp);

    let webContext = '';
    let searchPerformed = false;

    if (shouldSearch && tavilyClient) {
      try {
        const searchPromise = tavilyClient.search(userMessage, {
          searchDepth: 'basic',
          maxResults: 3,
          includeAnswer: true,
        });

        // 3 second timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Tavily search timeout')), 3000)
        );

        const searchResult = await Promise.race([searchPromise, timeoutPromise]);
        
        if (searchResult && searchResult.results && searchResult.results.length > 0) {
          webContext = searchResult.results
            .map((r: any) => `Source: ${r.url}\nTitle: ${r.title}\nContent: ${r.content}`)
            .join('\n\n');
          searchPerformed = true;
        }
      } catch (error) {
        console.error("Tavily API failed or timed out:", error);
      }
    }

    // Inject search context to system prompt
    let systemPrompt = MAIN_SYSTEM_PROMPT;
    if (searchPerformed && webContext) {
      systemPrompt = `You have access to the following real-time web search results to answer the user's question. Use this information as your primary source for current facts, news, and data. Always prefer this information over your training data when they conflict. Cite sources naturally in your answer when relevant.

CURRENT WEB SEARCH RESULTS:
${webContext}

---
` + systemPrompt;
    }

    // Inject corrected assumptions into system prompt if provided
    if (correctedAssumptions && correctedAssumptions.length > 0) {
      systemPrompt += `\n\n[CONTEXT CORRECTION]: The user has clarified/corrected their context. You MUST adjust your reasoning and subsequent answers to align with these corrections:\n` +
        correctedAssumptions.map((a: string) => `- ${a}`).join('\n');
    }

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedMessages,
      ],
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            controller.enqueue(new TextEncoder().encode(text));
          }
        } catch (err) {
          console.error("Stream reading error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'x-search-performed': searchPerformed ? 'true' : 'false',
        'Access-Control-Expose-Headers': 'x-search-performed',
      },
    });
  } catch (error: any) {
    console.error("Groq API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
