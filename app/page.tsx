"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

const useThemeColors = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setDarkMode(theme === "dark");
  }, []);

  return {
    bg: darkMode ? "#2c2817" : "#faf8f3",
    text: darkMode ? "#faf8f3" : "#2c2817",
    accent: "#8b7355",
    accentLight: "#a4886f",
    border: darkMode ? "rgba(250, 248, 243, 0.1)" : "rgba(44, 40, 23, 0.1)",
    cardBg: darkMode ? "rgba(250, 248, 243, 0.05)" : "rgba(44, 40, 23, 0.03)",
  };
};

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const colors = useThemeColors();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError("");
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setAuthError("Bestätigungsmail gesendet!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setAuthError("Login fehlgeschlagen.");
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  const saveMood = async (mood: number) => {
    if (!user) return;
    await supabase.from("moods").insert({ user_id: user.id, mood });
    setTodayMood(mood);
  };

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Guten Morgen";
    if (h < 18) return "Guten Tag";
    return "Guten Abend";
  };

  if (!user) {
    return (
      <main
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: colors.bg,
          color: colors.text,
        }}
      >
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">📔</div>
            <h1 className="text-3xl font-bold mb-1">Ki-Tagebuch</h1>
            <p style={{ color: colors.accentLight }} className="text-sm">
              Dein persönliches Tagebuch
            </p>
          </div>
          <div
            className="rounded-3xl p-6 flex flex-col gap-4"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
            />
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              className="rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                color: colors.text,
              }}
            />
            {authError && (
              <p
                className="text-sm text-center"
                style={{ color: colors.accentLight }}
              >
                {authError}
              </p>
            )}
            <button
              onClick={handleAuth}
              disabled={authLoading}
              className="rounded-xl py-3 font-semibold transition-all"
              style={{
                background: colors.accent,
                color: colors.bg,
              }}
            >
              {authLoading
                ? "..."
                : isRegister
                  ? "Konto erstellen"
                  : "Einloggen"}
            </button>
            <p
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError("");
              }}
              className="text-center text-xs cursor-pointer transition"
              style={{ color: colors.accentLight }}
            >
              {isRegister
                ? "Bereits ein Konto? Einloggen"
                : "Noch kein Konto? Registrieren"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const menuItems = [
    {
      icon: "💬",
      title: "Tagebuch",
      description: "Schreib über deinen Tag",
      href: "/chat",
      gradient: "linear-gradient(135deg, #667eea, #764ba2)",
    },
    {
      icon: "📊",
      title: "Wochenrückblick",
      description: "Muster & Erkenntnisse",
      href: "/woche",
      gradient: "linear-gradient(135deg, #f093fb, #f5576c)",
    },
    {
      icon: "😊",
      title: "Stimmung",
      description: "Deine Stimmungskurve",
      href: "/stimmung",
      gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
    },
    {
      icon: "🧘",
      title: "Sessions",
      description: "Geführte Reflexion",
      href: "/sessions",
      gradient: "linear-gradient(135deg, #f5576c, #f093fb)",
    },
    {
      icon: "🔮",
      title: "KI-Spiegel",
      description: "Wer bist du wirklich?",
      href: "/spiegel",
      gradient: "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    },
    {
      icon: "⚙️",
      title: "Einstellungen",
      description: "Erinnerungen & mehr",
      href: "/einstellungen",
      gradient: "linear-gradient(135deg, #43e97b, #38f9d7)",
    },
  ];

  return (
    <main
      className="min-h-screen flex flex-col items-center"
      style={{
        background: colors.bg,
        color: colors.text,
      }}
    >
      <div className="w-full max-w-md flex flex-col flex-1 gap-4 px-6 pb-6">
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <p className="text-sm mb-1" style={{ color: colors.accentLight }}>
            {getTimeGreeting()}
          </p>
          <h1 className="text-3xl font-bold">Ki-Tagebuch 📔</h1>
          <p className="text-sm mt-1" style={{ color: colors.accentLight }}>
            {user.email}
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.slice(0, 4).map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="rounded-3xl p-5 text-left transition-all hover:scale-105 active:scale-95"
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
                style={{ background: colors.accent }}
              >
                {item.icon}
              </div>
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs mt-1" style={{ color: colors.accentLight }}>
                {item.description}
              </p>
            </button>
          ))}
        </div>
        {menuItems.slice(4).map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="rounded-3xl p-5 text-left transition-all hover:scale-105 active:scale-95 w-full"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: "24px",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: colors.accent }}
              >
                {item.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p
                  className="text-xs mt-1"
                  style={{ color: colors.accentLight }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        ))}
        {/* Schnell-Stimmung */}
        <div className="px-6 pb-4">
          <div
            className="rounded-3xl p-5"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <p className="font-semibold text-sm mb-1">Wie geht's dir heute?</p>
            <p className="text-xs mb-4" style={{ color: colors.accentLight }}>
              Tippe auf ein Emoji
            </p>
            {todayMood ? (
              <div className="text-center py-2">
                <span className="text-3xl">
                  {["😔", "😕", "😐", "🙂", "😄"][todayMood - 1]}
                </span>
                <p
                  className="text-xs mt-2"
                  style={{ color: colors.accentLight }}
                >
                  Gespeichert ✓
                </p>
              </div>
            ) : (
              <div className="flex justify-between">
                {[
                  { emoji: "😔", value: 1 },
                  { emoji: "😕", value: 2 },
                  { emoji: "😐", value: 3 },
                  { emoji: "🙂", value: 4 },
                  { emoji: "😄", value: 5 },
                ].map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => saveMood(mood.value)}
                    className="text-3xl transition-all hover:scale-125 active:scale-95"
                  >
                    {mood.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Logout */}
        <div className="px-6 py-8 text-center">
          <button
            onClick={handleLogout}
            className="text-xs transition"
            style={{ color: colors.accentLight }}
          >
            Ausloggen
          </button>
        </div>
      </div>
    </main>
  );
}
