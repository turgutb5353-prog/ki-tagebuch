"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { useThemeColors } from "../../../lib/useThemeColors";
import SkeletonPage from "../../../components/SkeletonPage";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SESSIONS: Record<
  string,
  { emoji: string; titel: string; prompt: string; color: string }
> = {
  stress: {
    emoji: "😤",
    titel: "Stress & Druck",
    color: "#d4a5a5",
    prompt:
      "Der User möchte über Stress und Druck in seinem Leben nachdenken. Stelle tiefe, gezielte Fragen über die Stressquellen, wie er damit umgeht, und was er verändern könnte. Sei einfühlsam aber direkt. Fang mit einer einladenden Eröffnungsfrage an. Antworte auf Deutsch.",
  },
  dankbarkeit: {
    emoji: "🙏",
    titel: "Dankbarkeit",
    color: "#6b8e6f",
    prompt:
      "Der User möchte Dankbarkeit üben. Hilf ihm tiefe Dankbarkeit zu entdecken. Stelle Fragen die ihn zum Nachdenken bringen über Menschen, Momente und Chancen. Fang mit einer einladenden Eröffnungsfrage an. Antworte auf Deutsch.",
  },
  beziehungen: {
    emoji: "❤️",
    titel: "Beziehungen",
    color: "#a08968",
    prompt:
      "Der User möchte über seine Beziehungen nachdenken. Stelle tiefe Fragen über wichtige Menschen, wie diese Beziehungen ihn prägen, und was er sich wünscht. Fang mit einer einladenden Eröffnungsfrage an. Antworte auf Deutsch.",
  },
  ziele: {
    emoji: "🎯",
    titel: "Ziele & Träume",
    color: "#7a6c5d",
    prompt:
      "Der User möchte über seine Ziele und Träume nachdenken. Stelle tiefe Fragen über seine echten Wünsche, was ihn abhält, und welche Schritte er jetzt machen könnte. Fang mit einer einladenden Eröffnungsfrage an. Antworte auf Deutsch.",
  },
  selbstbild: {
    emoji: "🪞",
    titel: "Selbstbild",
    color: "#8b7355",
    prompt:
      "Der User möchte über sein Selbstbild nachdenken. Stelle tiefe Fragen darüber wer er ist, wie er sich selbst sieht, und was er verändern oder akzeptieren möchte. Fang mit einer einladenden Eröffnungsfrage an. Antworte auf Deutsch.",
  },
  energie: {
    emoji: "⚡",
    titel: "Energie & Motivation",
    color: "#a4886f",
    prompt:
      "Der User möchte über seine Energie und Motivation nachdenken. Stelle Fragen darüber was ihm Energie gibt und nimmt, und wie er mehr davon in sein Leben bringen kann. Fang mit einer einladenden Eröffnungsfrage an. Antworte auf Deutsch.",
  },
};

export default function SessionChat() {
  const colors = useThemeColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  const session = SESSIONS[sessionId];

  // Lock body scroll while on session chat page
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/");
        return;
      }
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = async () => {
    setStarted(true);
    setLoading(true);

    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authSession?.access_token}`,
      },
      body: JSON.stringify({
        messages: [],
        systemPrompt: session.prompt,
      }),
    });

    const data = await res.json();
    setMessages([{ role: "assistant", content: data.response }]);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authSession?.access_token}`,
      },
      body: JSON.stringify({
        messages: newMessages,
        systemPrompt: session.prompt,
      }),
    });

    const data = await res.json();
    setMessages([
      ...newMessages,
      { role: "assistant", content: data.response },
    ]);
    setLoading(false);
  };

  if (!colors.mounted) return <SkeletonPage variant="chat" titleWidth="90px" />;
  if (!session) return null;

  return (
    <main
      className="fixed inset-0 flex flex-col items-center overflow-hidden"
      style={{
        background: colors.bg,
        color: colors.text,
      }}
    >
      <div className="w-full max-w-md flex flex-col h-full">
        <div
          className="sticky top-0 z-10 flex justify-between items-center px-6 py-4"
          style={{ borderBottom: `1px solid ${colors.border}`, background: colors.bg }}
        >
          <button
            type="button"
            onClick={() => router.push("/sessions")}
            className="transition text-sm"
            style={{ color: colors.accent }}
          >
            ← Zurück
          </button>
          <div className="flex items-center gap-2">
            <span>{session.emoji}</span>
            <h1 className="font-bold">{session.titel}</h1>
          </div>
          <div className="w-16" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 flex flex-col gap-4">
          {!started ? (
            <div className="flex flex-col items-center mt-16 gap-6 px-4">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
                style={{ background: session.color, color: colors.bg }}
              >
                {session.emoji}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">{session.titel}</h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.accentLight }}
                >
                  Claude führt dich mit gezielten Fragen durch diese Reflexion.
                  Nimm dir Zeit – es gibt keine falschen Antworten.
                </p>
              </div>
              <button
                type="button"
                onClick={startSession}
                className="w-full rounded-2xl py-4 font-semibold transition-all"
                style={{ background: session.color, color: colors.bg }}
              >
                Session starten →
              </button>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-sm"
                      style={{
                        background: session.color,
                        color: colors.bg,
                      }}
                    >
                      {session.emoji}
                    </div>
                  )}
                  <div
                    className="max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? {
                            background: session.color,
                            color: colors.bg,
                          }
                        : {
                            background: colors.cardBg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                    style={{
                      background: session.color,
                      color: colors.bg,
                    }}
                  >
                    {session.emoji}
                  </div>
                  <div
                    className="rounded-2xl px-4 py-3 text-sm"
                    style={{ background: colors.cardBg }}
                  >
                    <span
                      className="animate-pulse"
                      style={{ color: colors.accentLight }}
                    >
                      tippt...
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {started && (
          <div className="px-4 pb-6">
            <div
              className="flex gap-2 items-end rounded-2xl p-2"
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <textarea
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none resize-none"
                rows={2}
                placeholder="Deine Antwort..."
                style={{
                  color: colors.text,
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="rounded-xl px-4 py-2 font-medium transition-all disabled:opacity-40 mb-1"
                style={{
                  background: session.color,
                  color: colors.bg,
                }}
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
