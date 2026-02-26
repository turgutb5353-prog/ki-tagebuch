"use client";

import { useRouter } from "next/navigation";
import { useThemeColors } from "../../lib/useThemeColors";
import SkeletonPage from "../../components/SkeletonPage";

const SESSIONS = [
  {
    id: "stress",
    emoji: "😤",
    titel: "Stress & Druck",
    beschreibung: "Was belastet dich gerade?",
    color: "#d4a5a5",
    prompt:
      "Der User möchte über Stress und Druck in seinem Leben nachdenken. Stelle tiefe, gezielte Fragen über die Stressquellen, wie er damit umgeht, und was er verändern könnte. Sei einfühlsam aber direkt.",
  },
  {
    id: "dankbarkeit",
    emoji: "🙏",
    titel: "Dankbarkeit",
    beschreibung: "Was ist gut in deinem Leben?",
    color: "#6b8e6f",
    prompt:
      "Der User möchte Dankbarkeit üben. Hilf ihm tiefe Dankbarkeit zu entdecken – nicht nur oberflächliche Dinge. Stelle Fragen die ihn zum Nachdenken bringen über Menschen, Momente und Chancen in seinem Leben.",
  },
  {
    id: "beziehungen",
    emoji: "❤️",
    titel: "Beziehungen",
    beschreibung: "Menschen in deinem Leben",
    color: "#a08968",
    prompt:
      "Der User möchte über seine Beziehungen nachdenken. Stelle tiefe Fragen über wichtige Menschen in seinem Leben, wie diese Beziehungen ihn prägen, und was er sich von diesen Beziehungen wünscht.",
  },
  {
    id: "ziele",
    emoji: "🎯",
    titel: "Ziele & Träume",
    beschreibung: "Was willst du erreichen?",
    color: "#7a6c5d",
    prompt:
      "Der User möchte über seine Ziele und Träume nachdenken. Stelle tiefe Fragen über seine echten Wünsche, was ihn davon abhält, und welche kleinen Schritte er jetzt machen könnte.",
  },
  {
    id: "selbstbild",
    emoji: "🪞",
    titel: "Selbstbild",
    beschreibung: "Wer bist du wirklich?",
    color: "#8b7355",
    prompt:
      "Der User möchte über sein Selbstbild nachdenken. Stelle tiefe Fragen darüber wer er ist, wie er sich selbst sieht im Vergleich zu wie andere ihn sehen, und was er an sich verändern oder akzeptieren möchte.",
  },
  {
    id: "energie",
    emoji: "⚡",
    titel: "Energie & Motivation",
    beschreibung: "Was gibt dir Kraft?",
    color: "#a4886f",
    prompt:
      "Der User möchte über seine Energie und Motivation nachdenken. Stelle Fragen darüber was ihm Energie gibt und nimmt, was ihn motiviert, und wie er mehr von dem in sein Leben bringen kann was ihn erfüllt.",
  },
];

export default function Sessions() {
  const colors = useThemeColors();
  const router = useRouter();

  if (!colors.mounted) return <SkeletonPage variant="list" titleWidth="70px" />;

  return (
    <main
      className="min-h-screen flex flex-col items-center"
      style={{
        background: colors.bg,
        color: colors.text,
      }}
    >
      <div className="w-full max-w-md flex flex-col min-h-screen px-6 pb-6">
        <div
          className="flex items-center py-4 mb-2"
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
          <h1 className="font-bold mx-auto">Sessions</h1>
          <div className="w-16" />
        </div>

        <p className="text-sm mb-6 mt-4" style={{ color: colors.accentLight }}>
          Wähle ein Thema – Claude führt dich mit gezielten Fragen durch die
          Reflexion.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {SESSIONS.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => router.push(`/sessions/${session.id}`)}
              className="rounded-3xl p-5 text-left transition-all hover:scale-105 active:scale-95"
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
                style={{
                  background: session.color,
                  color: colors.bg,
                }}
              >
                {session.emoji}
              </div>
              <p className="font-semibold text-sm">{session.titel}</p>
              <p className="text-xs mt-1" style={{ color: colors.accentLight }}>
                {session.beschreibung}
              </p>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
