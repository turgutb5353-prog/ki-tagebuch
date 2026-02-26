"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { useThemeColors } from "../../lib/useThemeColors";

export default function Woche() {
  const colors = useThemeColors();
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [entryCount, setEntryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/");
        return;
      }
      setUser(data.user);
      loadWeeklyAnalysis(data.user.id);
    });
  }, []);

  const loadWeeklyAnalysis = async (userId: string) => {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const { data } = await supabase
      .from("entries")
      .select("role, content")
      .eq("user_id", userId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    if (!data || data.length === 0) {
      setAnalysis(
        "Du hast diese Woche noch keine Einträge. Schreib jeden Tag ein paar Gedanken – dann kann ich dir nächste Woche zeigen was ich erkenne.",
      );
      setLoading(false);
      return;
    }

    const userEntries = data.filter((e) => e.role === "user");
    setEntryCount(userEntries.length);

    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/woche", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authSession?.access_token}`,
      },
      body: JSON.stringify({ entries: data }),
    });

    const result = await res.json();
    setAnalysis(result.response);
    setLoading(false);
  };

  const getDayOfWeek = () => {
    return new Date().toLocaleDateString("de-DE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  if (!colors.mounted) return null;

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
        <h1 className="font-bold">Wochenrückblick</h1>
        <div className="w-16" />
      </div>

      <div className="flex-1 px-6 py-8 max-w-2xl w-full mx-auto">
        {/* Date */}
        <p
          className="text-sm mb-6 text-center"
          style={{ color: colors.accentLight }}
        >
          {getDayOfWeek()}
        </p>

        {/* Stats */}
        {entryCount > 0 && (
          <div
            className="rounded-2xl p-4 mb-6 text-center"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <p className="text-sm" style={{ color: colors.accentLight }}>
              Diese Woche hast du
            </p>
            <p className="text-3xl font-bold my-1">{entryCount}</p>
            <p className="text-sm" style={{ color: colors.accentLight }}>
              Gedanken geteilt
            </p>
          </div>
        )}

        {/* Analysis */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}
        >
          {loading ? (
            <div className="text-center py-8">
              <p
                className="animate-pulse"
                style={{ color: colors.accentLight }}
              >
                Analysiere deine Woche...
              </p>
            </div>
          ) : (
            <div
              className="text-sm leading-relaxed whitespace-pre-line"
              style={{ color: colors.text }}
            >
              {analysis}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
