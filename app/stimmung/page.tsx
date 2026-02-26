"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { useThemeColors } from "../../lib/useThemeColors";
import SkeletonPage from "../../components/SkeletonPage";
import BottomNav from "../../components/BottomNav";

const MOODS = [
  { emoji: "😔", value: 1, label: "Schlecht" },
  { emoji: "😕", value: 2, label: "Nicht so gut" },
  { emoji: "😐", value: 3, label: "Okay" },
  { emoji: "🙂", value: 4, label: "Gut" },
  { emoji: "😄", value: 5, label: "Super" },
];

export default function Stimmung() {
  const colors = useThemeColors();
  const [moods, setMoods] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/");
        return;
      }
      setUser(data.user);
      loadMoods(data.user.id);
    });
  }, []);

  const loadMoods = async (userId: string) => {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data } = await supabase
      .from("moods")
      .select("mood, created_at")
      .eq("user_id", userId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });
    if (data) setMoods(data);
  };

  const getAverage = () => {
    if (moods.length === 0) return null;
    return Math.round(moods.reduce((sum, m) => sum + m.mood, 0) / moods.length);
  };

  const avg = getAverage();

  if (!colors.mounted)
    return <SkeletonPage variant="content" titleWidth="75px" />;

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: colors.bg,
        color: colors.text,
      }}
    >
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
        <h1 className="font-bold">Stimmung</h1>
        <div className="w-16" />
      </div>

      <div className="flex-1 px-6 py-8 pb-24 max-w-2xl w-full mx-auto flex flex-col gap-6">
        {/* Durchschnitt */}
        {avg && (
          <div
            className="rounded-3xl p-6 text-center"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: colors.accentLight }}
            >
              Durchschnitt diese Woche
            </p>
            <div className="text-6xl mb-2">{MOODS[avg - 1].emoji}</div>
            <p className="font-semibold">{MOODS[avg - 1].label}</p>
          </div>
        )}

        {/* Verlauf */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: colors.accentLight }}
          >
            Letzte 7 Tage
          </p>
          {moods.length === 0 ? (
            <p
              className="text-sm text-center py-4"
              style={{ color: colors.accentLight }}
            >
              Noch keine Einträge. Geh ins Tagebuch und bewerte deine Stimmung
              nach einem Chat.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {moods.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="text-xs w-20"
                    style={{ color: colors.accentLight }}
                  >
                    {new Date(m.created_at).toLocaleDateString("de-DE", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="text-2xl">{MOODS[m.mood - 1].emoji}</span>
                  <div
                    className="flex-1 rounded-full h-2 overflow-hidden"
                    style={{ background: colors.border }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(m.mood / 5) * 100}%`,
                        background: colors.accent,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: colors.accentLight }}
                  >
                    {MOODS[m.mood - 1].label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>      <BottomNav bg={colors.bg} border={colors.border} accent={colors.accent} accentLight={colors.accentLight} text={colors.text} />    </main>
  );
}
