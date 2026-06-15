import OpenAI from "openai";
import { Message } from "../types/index";

const SYSTEM_PROMPT = `You are a customer support agent for Nova Store, a fictional e-commerce store specializing in electronics and gadgets.

Shipping Policy:
- Free standard shipping (5–7 business days) on orders over $50.
- Express shipping available for $9.99 (2 business days).
- We ship to USA, Canada, UK, and Australia only.

Return & Refund Policy:
- 30-day returns accepted on all items.
- Items must be unused and in original packaging.
- Refunds are processed within 5–7 business days after the item is received.
- Sale items are final sale — no returns or refunds.

Support Hours:
- Monday–Friday, 9 AM – 6 PM EST for full support.
- Weekend support available via chat only.

Tone: Be helpful, concise, and friendly. Do not invent or assume any policies not listed above. If a customer asks about something outside these policies, let them know you can only speak to what is listed and suggest they reach out during business hours for further assistance.`;

let _openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30_000,
    });
  }
  return _openai;
}

export async function generateReply(
  history: Message[],
  userMessage: string,
): Promise<string> {
  try {
    const openai = getClient();
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((msg) => ({
        role: (msg.sender === "ai" ? "assistant" : "user") as
          | "assistant"
          | "user",
        content: msg.text,
      })),
      { role: "user", content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.4,
    });

    return (
      completion.choices[0]?.message?.content?.trim() ??
      "I couldn't generate a response. Please try again."
    );
  } catch (err: unknown) {
    const error = err as Record<string, unknown>;
    const message = typeof error.message === "string" ? error.message : "";
    const status = error.status;
    const code = error.code;

    console.error('[llmService] generateReply error — status:', status, 'code:', code, 'message:', message);

    if (status === 401 || code === "invalid_api_key") {
      return "I'm having trouble connecting right now. Please try again later.";
    }
    if (status === 429) {
      return "I'm receiving a lot of messages right now. Please wait a moment and try again.";
    }
    if (
      error.name === "AbortError" ||
      code === "ETIMEDOUT" ||
      message.toLowerCase().includes("timeout")
    ) {
      return "The request timed out. Please try sending your message again.";
    }
    return "Something went wrong on my end. Please try again.";
  }
}
