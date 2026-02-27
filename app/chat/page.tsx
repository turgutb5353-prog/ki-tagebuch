"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { useThemeColors } from "../../lib/useThemeColors";
import SkeletonPage from "../../components/SkeletonPage";
import BottomNav from "../../components/BottomNav";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const MOODS = [
  { emoji: "😔", value: 1, label: "Schlecht" },
  { emoji: "😕", value: 2, label: "Nicht so gut" },
  { emoji: "😐", value: 3, label: "Okay" },
  { emoji: "🙂", value: 4, label: "Gut" },
  { emoji: "😄", value: 5, label: "Super" },
];

const DAILY_QUESTIONS = [
  "Was hat dich heute überrascht?",
  "Worüber hast du heute am meisten nachgedacht?",
  "Was war der schönste Moment heute?",
  "Was hat dich heute gestresst und warum?",
  "Für was bist du heute dankbar?",
  "Was hättest du heute anders gemacht?",
  "Was hat dir heute Energie gegeben?",
  "Welche Emotion hat heute dominiert?",
  "Was hast du heute über dich gelernt?",
  "Was willst du morgen besser machen?",
];

export default function Chat() {
  const colors = useThemeColors();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load entries on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/");
        return;
      }
      setUser(data.user);
      loadEntries(data.user.id);
    });
  }, [router]);

  // Scroll to bottom on message changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showMoodPicker]);

  const loadEntries = async (userId: string) => {
    const { data } = await supabase
      .from("entries")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
  };

  const saveMessage = async (userId: string, role: string, content: string) => {
    await supabase.from("entries").insert({ user_id: userId, role, content });
  };

  const saveMood = async (mood: number) => {
    if (!user) return;
    await supabase.from("moods").insert({ user_id: user.id, mood });
    setSelectedMood(mood);
    setShowMoodPicker(false);
  };

  const newChat = async () => {
    if (!user) return;
    await supabase.from("entries").delete().eq("user_id", user.id);
    setMessages([]);
    setSelectedMood(null);
    setShowMoodPicker(false);
  };

  const getDailyQuestion = () => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    return DAILY_QUESTIONS[dayOfYear % DAILY_QUESTIONS.length];
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setShowMoodPicker(false);
    await saveMessage(user.id, "user", input);

    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authSession?.access_token}`,
      },
      body: JSON.stringify({
        entries: newMessages,
        context:
          "Du bist ein einfühlsamer Tagebuch-Assistent. Antworte kurz, warmherzig und ermutigend.",
      }),
    });

    const data = await res.json();
    setMessages([
      ...newMessages,
      { role: "assistant", content: data.response },
    ]);
    await saveMessage(user.id, "assistant", data.response);
    setLoading(false);
    setShowMoodPicker(true);
  };

  if (!colors.mounted)
    return <SkeletonPage variant="chat" titleWidth="55px" rightButton />;

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: colors.bg,
        color: colors.text,
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center px-6 py-4"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          className="transition text-sm"
          style={{ color: colors.accent }}
        >
          ← Zurück
        </button>
        <h1 className="font-bold">Spura</h1>
        <button
          type="button"
          onClick={newChat}
          className="text-xs transition px-3 py-1 rounded-full"
          style={{
            color: colors.accent,
            border: `1px solid ${colors.border}`,
          }}
        >
          ✏️ Neu
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 flex flex-col gap-4 max-w-2xl w-full mx-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center mt-16 gap-6">
            <div className="text-center">
              <p
                className="text-xs mb-2 uppercase tracking-widest"
                style={{ color: colors.accentLight }}
              >
                Frage des Tages
              </p>
              <p className="text-xl font-medium max-w-md leading-relaxed">
                {getDailyQuestion()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInput(getDailyQuestion())}
              className="text-sm transition px-5 py-2 rounded-full"
              style={{
                color: colors.accent,
                border: `1px solid ${colors.border}`,
              }}
            >
              Diese Frage beantworten →
            </button>
            <p className="text-xs" style={{ color: colors.accentLight }}>
              oder schreib einfach drauflos...
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0 text-sm"
                style={{
                  background: colors.accent,
                  color: colors.bg,
                }}
              >
                📔
              </div>
            )}
            <div
              className="max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      background: colors.accent,
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
                background: colors.accent,
                color: colors.bg,
              }}
            >
              📔
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
        {showMoodPicker && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm" style={{ color: colors.accentLight }}>
              Wie fühlst du dich gerade?
            </p>
            <div className="flex gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => saveMood(mood.value)}
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl transition-all hover:scale-110"
                  style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span
                    className="text-xs"
                    style={{ color: colors.accentLight }}
                  >
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedMood && !showMoodPicker && (
          <div className="text-center">
            <span className="text-xs" style={{ color: colors.accentLight }}>
              Stimmung gespeichert{" "}
              {MOODS.find((m) => m.value === selectedMood)?.emoji}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-24 max-w-2xl w-full mx-auto">
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
            placeholder="Schreib hier..."
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
              background: colors.accent,
              color: colors.bg,
            }}
          >
            →
          </button>
        </div>
        <p
          className="text-center text-xs mt-2"
          style={{ color: colors.accentLight }}
        >
          Enter zum Senden · Shift+Enter für neue Zeile
        </p>
      </div>
      <BottomNav bg={colors.bg} border={colors.border} accent={colors.accent} accentLight={colors.accentLight} text={colors.text} />
    </main>
  );
}
