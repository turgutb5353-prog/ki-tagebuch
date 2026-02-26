import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { entries } = await req.json();

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `Du bist ein einfühlsamer, persönlicher Tagebuch-Begleiter. 
      Deine Aufgabe ist es, dem Nutzer zuzuhören, tiefere Fragen zu stellen und sanft Muster in seinen Gedanken und Gefühlen zu reflektieren.
      Antworte immer auf Deutsch. Sei warm, nicht therapeutisch. Maximal 3-4 Sätze.`,
      messages: entries,
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
