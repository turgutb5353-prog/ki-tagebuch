import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json();

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system:
        systemPrompt +
        " Halte deine Antworten kurz – maximal 3-4 Sätze. Stelle immer nur eine Frage.",
      messages:
        messages.length === 0
          ? [{ role: "user", content: "Starte die Session." }]
          : messages,
    });

    return NextResponse.json({
      response:
        message.content[0].type === "text" ? message.content[0].text : "",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
