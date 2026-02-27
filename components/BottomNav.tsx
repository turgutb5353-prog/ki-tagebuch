"use client";

import { useRouter, usePathname } from "next/navigation";

const TABS = [
  { icon: "💬", label: "Chat", href: "/chat" },
  { icon: "📊", label: "Woche", href: "/woche" },
  { icon: "😊", label: "Stimmung", href: "/stimmung" },
  { icon: "🧘", label: "Sessions", href: "/sessions" },
  { icon: "🔮", label: "Spiegel", href: "/spiegel" },
];

interface Props {
  /** bg and accent colours from useThemeColors – pass them down so we don't re-call the hook */
  bg: string;
  border: string;
  accent: string;
  accentLight: string;
  text: string;
}

export default function BottomNav({ bg, border, accent, accentLight, text }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      style={{
        background:
          bg === "#2c2817"
            ? "rgba(44, 40, 23, 0.55)"
            : "rgba(250, 248, 243, 0.6)",
      }}
      className="fixed bottom-4 left-3 right-3 flex justify-around items-center pt-1 pb-0 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.18)] backdrop-blur-md z-50"
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <button
            key={tab.href}
            type="button"
            onClick={() => router.push(tab.href)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-150 ease-out active:scale-95 active:opacity-75"
            style={{
              color: isActive ? accent : accentLight,
              fontWeight: isActive ? 700 : 400,
            }}
          >
            <span
              className="text-2xl leading-none transition-transform"
              style={{ transform: isActive ? "scale(1.15)" : "scale(1)" }}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] leading-tight">{tab.label}</span>
            {isActive && (
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: accent }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
