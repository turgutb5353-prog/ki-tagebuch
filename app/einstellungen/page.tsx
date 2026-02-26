"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Einstellungen() {
  const [reminderSet, setReminderSet] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const theme = localStorage.getItem("theme");
    setDarkMode(theme === "dark");
  }, []);

  const setupReminder = async () => {
    if (!("Notification" in window)) {
      alert("Dein Browser unterstützt keine Benachrichtigungen.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Bitte erlaube Benachrichtigungen in deinem Browser.");
      return;
    }
    const scheduleDaily = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(21, 0, 0, 0);
      if (now > target) target.setDate(target.getDate() + 1);
      const delay = target.getTime() - now.getTime();
      setTimeout(() => {
        new Notification("Spura 🌙", {
          body: "Wie war dein Tag? Schreib kurz rein.",
          icon: "/favicon.ico",
        });
        scheduleDaily();
      }, delay);
    };
    scheduleDaily();
    setReminderSet(true);
  };

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) return null;

  const bgColor = darkMode ? "#2c2817" : "#faf8f3";
  const textColor = darkMode ? "#faf8f3" : "#2c2817";
  const borderColor = darkMode
    ? "rgba(250, 248, 243, 0.1)"
    : "rgba(44, 40, 23, 0.1)";
  const cardBg = darkMode
    ? "rgba(250, 248, 243, 0.05)"
    : "rgba(44, 40, 23, 0.03)";
  const accentColor = "#8b7355";

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: bgColor,
        color: textColor,
      }}
    >
      <div
        className="flex justify-between items-center px-6 py-4"
        style={{ borderBottom: `1px solid ${borderColor}` }}
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          className="transition text-sm"
          style={{ color: accentColor }}
        >
          ← Zurück
        </button>
        <h1 className="font-bold">Einstellungen</h1>
        <div className="w-16" />
      </div>

      <div className="flex-1 px-6 py-8 max-w-2xl w-full mx-auto flex flex-col gap-4">
        {/* Theme Toggle */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{
                  background: accentColor,
                  color: bgColor,
                }}
              >
                {darkMode ? "🌙" : "☀️"}
              </div>
              <div>
                <p className="font-semibold">Design</p>
                <p
                  className="text-xs"
                  style={{ color: darkMode ? "#a4886f" : "#a4886f" }}
                >
                  {darkMode ? "Dark Mode aktiv" : "Heller Modus aktiv"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full px-4 py-2 font-medium transition-all"
              style={{
                background: accentColor,
                color: bgColor,
              }}
            >
              Wechseln
            </button>
          </div>
        </div>

        {/* Erinnerung */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: accentColor,
              }}
            >
              🔔
            </div>
            <div>
              <p className="font-semibold">Tägliche Erinnerung</p>
              <p
                className="text-xs"
                style={{ color: darkMode ? "#a4886f" : "#a4886f" }}
              >
                Jeden Abend um 21 Uhr
              </p>
            </div>
          </div>
          {reminderSet ? (
            <div
              className="rounded-2xl py-3 text-center"
              style={{
                background: accentColor,
                color: bgColor,
              }}
            >
              <p className="text-sm">✓ Erinnerung aktiviert</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={setupReminder}
              className="w-full rounded-2xl py-3 font-medium transition-all"
              style={{
                background: accentColor,
                color: bgColor,
              }}
            >
              Erinnerung aktivieren
            </button>
          )}
        </div>

        {/* Info */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: accentColor,
              }}
            >
              📔
            </div>
            <div>
              <p className="font-semibold">Spura</p>
              <p
                className="text-xs"
                style={{ color: darkMode ? "#a4886f" : "#a4886f" }}
              >
                Version 1.0 · Powered by Claude
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
