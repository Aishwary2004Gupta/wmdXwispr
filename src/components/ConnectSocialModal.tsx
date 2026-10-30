"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link2, ShieldAlert, X } from "lucide-react";
import { PLATFORM_CONFIGS } from "@/lib/constants";
import { SocialAccount, SocialPlatform } from "@/types/sync";

interface ConnectSocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: Omit<SocialAccount, "id" | "connectedAt" | "recentPostCount">) => void;
  existingAccounts: SocialAccount[];
  initialUrl?: string;
}

const platformOptions = Object.values(PLATFORM_CONFIGS);

function detectPlatform(hostname: string): SocialPlatform {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  if (host === "x.com" || host === "twitter.com") return "twitter";
  if (host === "instagram.com" || host === "instagr.am") return "instagram";
  if (host === "linkedin.com") return "linkedin";
  if (host === "bsky.app") return "bluesky";
  if (host === "threads.net") return "threads";
  if (host === "youtube.com" || host === "youtu.be") return "youtube";
  if (host === "tiktok.com") return "tiktok";
  if (host === "github.com") return "github";
  return "other";
}

function parseProfileUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

function getHandle(pathname: string, platform: SocialPlatform, hostname: string) {
  const segments = pathname.split("/").filter(Boolean);
  let value = "";

  if (platform === "bluesky") {
    const profileIndex = segments.indexOf("profile");
    value = segments[profileIndex + 1] || "";
  } else if (platform === "linkedin") {
    const inIndex = segments.indexOf("in");
    value = inIndex >= 0 ? `in/${segments[inIndex + 1] || ""}` : segments[0] || "";
  } else if (platform === "youtube") {
    value = segments.find((segment) => segment.startsWith("@")) || segments[1] || segments[0] || "";
  } else {
    value = segments[0] || "";
  }

  if (!value) return hostname.replace(/^www\./, "");
  if (platform === "linkedin") return value;
  return value.startsWith("@") ? value : `@${value}`;
}

function titleFromHost(hostname: string) {
  const firstLabel = hostname.replace(/^www\./, "").split(".")[0] || "Other social";
  return firstLabel.charAt(0).toUpperCase() + firstLabel.slice(1);
}

export default function ConnectSocialModal({
  isOpen,
  onClose,
  onAddAccount,
  existingAccounts,
  initialUrl = "",
}: ConnectSocialModalProps) {
  const initialParsedUrl = parseProfileUrl(initialUrl.trim());
  const initialPlatform = initialParsedUrl ? detectPlatform(initialParsedUrl.hostname) : "twitter";
  const [profileUrl, setProfileUrl] = useState(initialUrl);
  const [platform, setPlatform] = useState<SocialPlatform>(initialPlatform);
  const [platformName, setPlatformName] = useState(
    initialPlatform === "other" && initialParsedUrl ? titleFromHost(initialParsedUrl.hostname) : "",
  );
  const [name, setName] = useState("");
  const [handle, setHandle] = useState(
    initialParsedUrl ? getHandle(initialParsedUrl.pathname, initialPlatform, initialParsedUrl.hostname) : "",
  );
  const [error, setError] = useState("");

  const parsedUrl = useMemo(() => parseProfileUrl(profileUrl.trim()), [profileUrl]);
  const platformConfig = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.other;
  const finalPlatformName = platform === "other"
    ? platformName.trim() || (parsedUrl ? titleFromHost(parsedUrl.hostname) : "Other social")
    : platformConfig.name;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleUrlChange = (value: string) => {
    setProfileUrl(value);
    setError("");
    const url = parseProfileUrl(value.trim());
    if (!url) return;
    const detected = detectPlatform(url.hostname);
    setPlatform(detected);
    setHandle(getHandle(url.pathname, detected, url.hostname));
    if (detected === "other") setPlatformName(titleFromHost(url.hostname));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = parseProfileUrl(profileUrl.trim());
    if (!url) {
      setError("Enter a valid profile link that starts with https:// or http://.");
      return;
    }

    const normalizedUrl = url.toString().replace(/\/$/, "");
    const alreadyConnected = existingAccounts.some(
      (account) => account.profileUrl.replace(/\/$/, "").toLowerCase() === normalizedUrl.toLowerCase(),
    );
    if (alreadyConnected) {
      setError("That profile link is already in your connected accounts.");
      return;
    }

    const savedHandle = handle.trim() || getHandle(url.pathname, platform, url.hostname);
    onAddAccount({
      platform,
      platformName: platform === "other" ? finalPlatformName : undefined,
      name: name.trim() || savedHandle,
      handle: savedHandle,
      avatar: "",
      profileUrl: normalizedUrl,
      status: "paused",
      followers: "—",
      badge: "Link saved",
      bio: "Profile link saved locally. Connect an official integration to authorize publishing.",
      isVerifiedOwner: false,
      authProvider: "profile_link",
      lastVerifiedAt: "Not connected",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="modal-content connect-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-modal-title"
        style={{ maxWidth: "620px" }}
      >
        <div className="connect-modal-header">
          <div className="connect-modal-title-wrap">
            <div className="connect-modal-icon" style={{ color: "var(--primary)" }}>
              <Link2 size={19} />
            </div>
            <div>
              <h2 id="connect-modal-title">Add a profile link</h2>
              <p>Choose a social site and paste your profile URL.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="connect-form">
          <label className="connect-field">
            <span>Profile link</span>
            <input
              type="url"
              value={profileUrl}
              onChange={(event) => handleUrlChange(event.target.value)}
              placeholder="https://social.example/@you"
              autoFocus
              required
            />
          </label>

          <div className="connect-form-grid">
            <label className="connect-field">
              <span>Platform</span>
              <select value={platform} onChange={(event) => setPlatform(event.target.value as SocialPlatform)}>
                {platformOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </label>
            <label className="connect-field">
              <span>{platform === "other" ? "Social network name" : "Display name (optional)"}</span>
              <input
                value={platform === "other" ? platformName : name}
                onChange={(event) => platform === "other" ? setPlatformName(event.target.value) : setName(event.target.value)}
                placeholder={platform === "other" ? "e.g. Mastodon, Reddit" : "Your name"}
                required={platform === "other"}
              />
            </label>
          </div>

          <label className="connect-field">
            <span>Handle (optional)</span>
            <input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@yourname" />
          </label>

          {parsedUrl && (
            <div className="connect-preview">
              <span className="connect-preview-mark" style={{ background: "rgba(36, 85, 207, 0.08)", color: "var(--primary)" }}>
                {finalPlatformName.slice(0, 1).toUpperCase()}
              </span>
              <div className="connect-preview-copy">
                <strong>{name.trim() || handle || finalPlatformName}</strong>
                <span>{finalPlatformName} · {parsedUrl.hostname}</span>
              </div>
              <a href={parsedUrl.toString()} target="_blank" rel="noreferrer">Preview ↗</a>
            </div>
          )}

          <div className="connect-notice">
            <ShieldAlert size={17} />
            <p>
              Saving this link does not sign you in or verify that you own the profile. Publishing requires a separate OAuth sign-in with this social network. This project does not have the platform integrations or developer credentials needed to start that sign-in yet.
            </p>
          </div>

          {error && <p className="connect-error" role="alert">{error}</p>}

          <div className="connect-actions">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!parsedUrl}>
              <Link2 size={16} />
              <span>Save link only</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
