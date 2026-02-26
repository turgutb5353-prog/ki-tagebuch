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

    const { entries } = await req.json();

    const text = entries.map((e: any) => e.content).join("\n---\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Du bist ein tiefsinniger, einfühlsamer Psychologe der Tagebucheinträge analysiert.
      Antworte NUR als JSON ohne Markdown oder Backticks.
      Analysiere die Einträge tief und persönlich – nicht oberflächlich.
      Sei warm, ehrlich und präzise. Verwende "du" und sprich die Person direkt an.
      
      Antworte in diesem Format:
      {
        "satz": "Ein einziger kraftvoller Satz der diese Person zusammenfasst",
        "denkweise": "2-3 Sätze über wie diese Person denkt und die Welt wahrnimmt",
        "staerken": "2-3 Sätze über echte Stärken die aus den Einträgen erkennbar sind",
        "wachstum": "2-3 Sätze über Bereiche wo diese Person wachsen könnte – liebevoll formuliert",
        "werte": "2-3 Sätze über was dieser Person wirklich wichtig ist basierend auf dem was sie schreibt"
      }`,
        },
        {
          role: "user",
          content: `Hier sind meine Tagebucheinträge:\n\n${text}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fehler" }, { status: 500 });
  }
}
