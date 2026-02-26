"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { useThemeColors } from "../../lib/useThemeColors";
import SkeletonPage from "../../components/SkeletonPage";
import BottomNav from "../../components/BottomNav";

export default function Spiegel() {
  const colors = useThemeColors();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/");
        return;
      }
      setUser(data.user);
      checkEntries(data.user.id);
    });
  }, []);

  const checkEntries = async (userId: string) => {
    const { data } = await supabase
      .from("entries")
      .select("role, content, created_at")
      .eq("user_id", userId)
      .eq("role", "user")
      .order("created_at", { ascending: true });
    if (data) setEntryCount(data.length);
  };

  const generateProfile = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from("entries")
      .select("content, created_at")
      .eq("user_id", user.id)
      .eq("role", "user")
      .order("created_at", { ascending: true });

    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/spiegel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authSession?.access_token}`,
      },
      body: JSON.stringify({ entries: data }),
    });

    const result = await res.json();
    setAnalysis(result);
    setLoading(false);
  };

  if (!colors.mounted)
    return <SkeletonPage variant="content" titleWidth="90px" />;

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
        <h1 className="font-bold">Dein Spiegel</h1>
        <div className="w-16" />
      </div>

      <div className="flex-1 px-6 py-8 pb-24 max-w-2xl w-full mx-auto flex flex-col gap-6">
        {!analysis && !loading && (
          <>
            {entryCount < 5 ? (
              <div
                className="rounded-3xl p-8 text-center"
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="text-5xl mb-4">🔮</div>
                <p className="font-semibold mb-2">Noch nicht genug Einträge</p>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: colors.accentLight }}
                >
                  Schreib mindestens 5 Mal ins Tagebuch damit ich dich wirklich
                  kennenlernen kann.
                </p>
                <div
                  className="mt-6 rounded-full h-2 overflow-hidden"
                  style={{ background: colors.border }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(entryCount / 5) * 100}%`,
                      background: colors.accent,
                    }}
                  />
                </div>
                <p
                  className="text-xs mt-2"
                  style={{ color: colors.accentLight }}
                >
                  {entryCount} / 5 Einträge
                </p>
              </div>
            ) : (
              <div
                className="rounded-3xl p-8 text-center"
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="text-5xl mb-4">🔮</div>
                <p className="font-semibold text-xl mb-2">
                  Bereit für deinen Spiegel
                </p>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: colors.accentLight }}
                >
                  Ich habe {entryCount} Einträge von dir gelesen. Lass mich dir
                  zeigen was ich erkenne.
                </p>
                <button
                  type="button"
                  onClick={generateProfile}
                  className="w-full rounded-2xl py-4 font-semibold text-lg transition-all hover:opacity-90"
                  style={{
                    background: colors.accent,
                    color: colors.bg,
                  }}
                >
                  Meinen Spiegel anzeigen ✨
                </button>
              </div>
            )}
          </>
        )}

        {loading && (
          <div
            className="rounded-3xl p-8 text-center"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="text-5xl mb-4 animate-pulse">🔮</div>
            <p className="font-semibold mb-2">Ich lese deine Einträge...</p>
            <p className="text-sm" style={{ color: colors.accentLight }}>
              Das dauert einen Moment.
            </p>
          </div>
        )}

        {analysis && (
          <div className="flex flex-col gap-4">
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
                Das bist du in einem Satz
              </p>
              <p className="text-lg font-medium leading-relaxed italic">
                "{analysis.satz}"
              </p>
            </div>

            {[
              {
                emoji: "🧠",
                titel: "Deine Denkweise",
                inhalt: analysis.denkweise,
              },
              {
                emoji: "💪",
                titel: "Deine Stärken",
                inhalt: analysis.staerken,
              },
              {
                emoji: "🌱",
                titel: "Deine Wachstumsbereiche",
                inhalt: analysis.wachstum,
              },
              {
                emoji: "❤️",
                titel: "Was dir wirklich wichtig ist",
                inhalt: analysis.werte,
              },
            ].map((section) => (
              <div
                key={section.titel}
                className="rounded-3xl p-6"
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{section.emoji}</span>
                  <p className="font-semibold">{section.titel}</p>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.accentLight }}
                >
                  {section.inhalt}
                </p>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setAnalysis(null)}
              className="text-xs text-center transition py-2"
              style={{ color: colors.accent }}
            >
              Neu analysieren
            </button>
          </div>
        )}
      </div>
      <BottomNav bg={colors.bg} border={colors.border} accent={colors.accent} accentLight={colors.accentLight} text={colors.text} />
    </main>
  );
}
