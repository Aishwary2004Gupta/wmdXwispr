import React from "react";
import Image from "next/image";

interface AccountAvatarProps {
  src?: string;
  name: string;
  size: number;
  color?: string;
}

export default function AccountAvatar({ src, name, size, color = "#818cf8" }: AccountAvatarProps) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    flex: `0 0 ${size}px`,
    borderRadius: "50%",
    objectFit: "cover",
    border: `2px solid ${color}`,
    background: `${color}18`,
    color,
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: Math.max(12, Math.round(size * 0.38)),
  };

  if (src) return <Image src={src} alt={name} width={size} height={size} unoptimized style={style} />;
  return <div aria-label={`${name} profile placeholder`} role="img" style={style}>{name.slice(0, 1).toUpperCase()}</div>;
}
