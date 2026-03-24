"use client";

export function DoodleBlob({
  color,
  size = 40,
  className = "",
  variant = 0,
}: {
  color: string;
  size?: number;
  className?: string;
  variant?: number;
}) {
  const blobs = [
    // rounded blob
    <svg key={0} width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M20 2C28 2 36 6 37 14C38 22 34 28 28 33C22 38 14 38 8 33C2 28 1 20 3 13C5 6 12 2 20 2Z"
        fill={color}
      />
    </svg>,
    // star-ish blob
    <svg key={1} width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M20 3C22 8 28 8 33 6C31 12 35 17 38 20C35 23 31 28 33 34C28 32 22 32 20 37C18 32 12 32 7 34C9 28 5 23 2 20C5 17 9 12 7 6C12 8 18 8 20 3Z"
        fill={color}
      />
    </svg>,
    // wonky circle
    <svg key={2} width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M20 4C26 3 32 7 35 13C38 19 37 26 33 31C29 36 22 38 16 36C10 34 5 29 4 22C3 15 6 9 11 5C14 3 17 4 20 4Z"
        fill={color}
      />
    </svg>,
    // squarish blob
    <svg key={3} width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M8 4C14 2 26 2 32 4C36 8 38 14 38 20C38 28 34 34 28 37C20 40 10 38 5 32C2 26 2 16 4 10C5 7 6 5 8 4Z"
        fill={color}
      />
    </svg>,
  ];

  return <span className={className}>{blobs[variant % blobs.length]}</span>;
}

export function HandDrawnLine({
  color = "#F0E6D8",
  width = "100%",
  className = "",
}: {
  color?: string;
  width?: string | number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={width}
      height="4"
      viewBox="0 0 200 4"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        d="M0 2C20 1 40 3 60 2C80 1 100 3 120 2C140 1 160 3 180 2C190 1.5 195 2 200 2"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleCorner({
  color = "#FFD93D",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
    >
      <circle cx="6" cy="6" r="4" fill={color} opacity="0.6" />
      <circle cx="18" cy="4" r="3" fill={color} opacity="0.4" />
      <circle cx="4" cy="18" r="3" fill={color} opacity="0.4" />
      <circle cx="12" cy="12" r="2.5" fill={color} opacity="0.3" />
    </svg>
  );
}

export function StreakFire({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "wiggle 2s ease-in-out infinite" }}
    >
      <path
        d="M12 2C12 2 6 8 6 14C6 17.3 8.7 20 12 20C15.3 20 18 17.3 18 14C18 8 12 2 12 2Z"
        fill="#FF9F43"
      />
      <path
        d="M12 8C12 8 9 12 9 15C9 16.7 10.3 18 12 18C13.7 18 15 16.7 15 15C15 12 12 8 12 8Z"
        fill="#FFD93D"
      />
      <path
        d="M12 12C12 12 10.5 14 10.5 15.5C10.5 16.3 11.2 17 12 17C12.8 17 13.5 16.3 13.5 15.5C13.5 14 12 12 12 12Z"
        fill="#FFF8F0"
      />
    </svg>
  );
}
