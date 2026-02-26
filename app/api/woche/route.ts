import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    // Auth-Prüfung
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

    const { entries } = await req.json();

    if (!entries || entries.length === 0) {
      return NextResponse.json({ response: "Keine Einträge diese Woche." });
    }

    const text = entries
      .filter((e: any) => e.role === "user")
      .map((e: any) => e.content)
      .join("\n---\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `Du bist ein einfühlsamer Begleiter der Tagebucheinträge analysiert. 
      Antworte immer auf Deutsch. Sei warm und persönlich, nicht klinisch.
      Strukturiere deine Antwort in 3 Teile:
      1. 🌟 Was diese Woche gut lief (1-2 Sätze)
      2. 🔁 Muster die du erkennst (1-2 Sätze)
      3. 💡 Eine sanfte Frage oder Anregung für nächste Woche (1 Satz)`,
      messages: [
        {
          role: "user",
          content: `Hier sind meine Tagebucheinträge der letzten Woche:\n\n${text}`,
        },
      ],
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
