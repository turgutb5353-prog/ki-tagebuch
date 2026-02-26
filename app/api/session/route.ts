import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    // Auth-Prüfung
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user)
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

    const { messages, systemPrompt } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: systemPrompt + " Halte deine Antworten kurz – maximal 3-4 Sätze. Stelle immer nur eine Frage.",
        },
        ...(messages.length === 0
          ? [{ role: "user" as const, content: "Starte die Session." }]
          : messages),
      ],
    });

    return NextResponse.json({
      response: completion.choices[0].message.content ?? "",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
