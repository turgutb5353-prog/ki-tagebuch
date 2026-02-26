"use client";

/**
 * SkeletonPage – shown while useThemeColors().mounted is false.
 * Uses fixed neutral colours so it looks good before the theme loads.
 */

const BG = "#faf8f3";
const PULSE = "rgba(44,40,23,0.08)";
const BORDER = "rgba(44,40,23,0.1)";

function Bar({
  width = "100%",
  height = 14,
  radius = 8,
  style = {},
}: {
  width?: string | number;
  height?: number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="animate-pulse"
      style={{
        width,
        height,
        borderRadius: radius,
        background: PULSE,
        ...style,
      }}
    />
  );
}

type Variant = "chat" | "list" | "content" | "settings";

interface Props {
  /** Which layout skeleton to show */
  variant?: Variant;
  /** Optional title placeholder width, e.g. "60px" */
  titleWidth?: string;
  /** Whether to show a right-side action button placeholder */
  rightButton?: boolean;
}

export default function SkeletonPage({
  variant = "content",
  titleWidth = "80px",
  rightButton = false,
}: Props) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: BG, color: "transparent" }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center px-6 py-4"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <Bar width={52} height={13} radius={6} />
        <Bar width={titleWidth} height={15} radius={7} />
        {rightButton ? (
          <Bar width={52} height={26} radius={999} />
        ) : (
          <div style={{ width: 52 }} />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-8 max-w-2xl w-full mx-auto flex flex-col gap-4">
        {variant === "chat" && <ChatSkeleton />}
        {variant === "list" && <ListSkeleton />}
        {variant === "content" && <ContentSkeleton />}
        {variant === "settings" && <SettingsSkeleton />}
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <>
      {/* Assistant bubble */}
      <div className="flex justify-start">
        <div
          className="animate-pulse rounded-3xl rounded-tl-none p-4 flex flex-col gap-2"
          style={{ background: PULSE, width: "70%", minHeight: 64 }}
        >
          <Bar width="90%" height={12} />
          <Bar width="75%" height={12} />
          <Bar width="55%" height={12} />
        </div>
      </div>
      {/* User bubble */}
      <div className="flex justify-end">
        <div
          className="animate-pulse rounded-3xl rounded-tr-none p-4 flex flex-col gap-2"
          style={{ background: PULSE, width: "55%", minHeight: 48 }}
        >
          <Bar width="85%" height={12} />
          <Bar width="60%" height={12} />
        </div>
      </div>
      {/* Assistant bubble */}
      <div className="flex justify-start">
        <div
          className="animate-pulse rounded-3xl rounded-tl-none p-4 flex flex-col gap-2"
          style={{ background: PULSE, width: "65%", minHeight: 48 }}
        >
          <Bar width="80%" height={12} />
          <Bar width="50%" height={12} />
        </div>
      </div>
      {/* Input bar at bottom */}
      <div className="mt-auto pt-4">
        <Bar width="100%" height={48} radius={24} />
      </div>
    </>
  );
}

function ListSkeleton() {
  const items = [1, 2, 3, 4];
  return (
    <>
      <Bar width="55%" height={13} radius={6} style={{ marginBottom: 8 }} />
      <div className="grid grid-cols-2 gap-4">
        {items.map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-3xl p-5 flex flex-col gap-3"
            style={{ background: PULSE, minHeight: 120 }}
          >
            <Bar width={36} height={36} radius={12} />
            <Bar width="75%" height={13} />
            <Bar width="90%" height={11} />
            <Bar width="60%" height={11} />
          </div>
        ))}
      </div>
    </>
  );
}

function ContentSkeleton() {
  return (
    <>
      <Bar width="40%" height={13} radius={6} />
      <div
        className="animate-pulse rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: PULSE, minHeight: 100 }}
      >
        <Bar width="90%" height={13} />
        <Bar width="80%" height={13} />
        <Bar width="65%" height={13} />
      </div>
      <div
        className="animate-pulse rounded-2xl p-5 flex flex-col gap-3"
        style={{ background: PULSE, minHeight: 80 }}
      >
        <Bar width="75%" height={13} />
        <Bar width="55%" height={13} />
      </div>
      <Bar width="30%" height={40} radius={24} style={{ marginTop: 8 }} />
    </>
  );
}

function SettingsSkeleton() {
  const rows = [1, 2, 3];
  return (
    <>
      {rows.map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl p-5 flex items-center justify-between"
          style={{ background: PULSE, minHeight: 64 }}
        >
          <div className="flex flex-col gap-2" style={{ width: "60%" }}>
            <Bar width="70%" height={13} />
            <Bar width="90%" height={11} />
          </div>
          <Bar width={44} height={26} radius={999} />
        </div>
      ))}
    </>
  );
}
