import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiCamera, FiX, FiSave, FiLock } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { updateAvatar, updateUserSettings } from "../services/userSettingsService";

const isValidImage = (file) => {
  if (!file) return false;
  const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  return allowed.has(file.type);
};

export default function UserSettingsModal({ open, onClose }) {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatarPreview, setAvatarPreview] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const displayAvatar = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatarUrl) {
      const url = String(user.avatarUrl);
      if (/^https?:\/\//i.test(url)) return url;
      return url;
    }
    return "";
  }, [avatarPreview, user?.avatarUrl]);

  const userInitial = useMemo(() => {
    const raw = user?.name || user?.email || "U";
    return String(raw).trim().charAt(0).toUpperCase() || "U";
  }, [user?.name, user?.email]);

  useEffect(() => {
    if (!open) return;
    setUsername(user?.username || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setAvatarPreview("");
    setError("");
    setSuccess("");
  }, [open, user?.username]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const setUserAndPersist = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  const handlePickAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    if (!isValidImage(file)) {
      setError("Please choose a JPG, PNG, WEBP, or GIF image.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setSavingAvatar(true);
      const data = await updateAvatar(file);
      if (data?.user) {
        setUserAndPersist({ ...user, ...data.user });
      }
      setSuccess("Avatar updated.");
    } catch (err) {
      const message = err?.response?.data?.message || "Avatar upload failed.";
      setError(message);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleSaveSettings = async () => {
    setError("");
    setSuccess("");

    const payload = {
      username: username?.trim(),
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
      confirmPassword: confirmPassword || undefined,
    };

    // Do not send password fields unless the user is changing password
    if (!payload.newPassword && !payload.confirmPassword) {
      delete payload.currentPassword;
      delete payload.newPassword;
      delete payload.confirmPassword;
    }

    try {
      setSavingSettings(true);
      const data = await updateUserSettings(payload);
      if (data?.user) {
        setUserAndPersist({ ...user, ...data.user });
      }
      setSuccess("Settings updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err?.response?.data?.message || "Update failed.";
      setError(message);
    } finally {
      setSavingSettings(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close settings"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl rounded-[2rem] border border-blue-500/20 bg-[rgba(10,13,23,0.92)] backdrop-blur-xl shadow-2xl shadow-blue-500/10">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300/70">
                User Settings
              </div>
              <div className="text-xl font-black text-[var(--app-text)]">
                Account
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-[var(--app-text)] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)]"
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>

          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avatar */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-bold text-[var(--app-text)] mb-3">
                Profile Picture
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-blue-400/25 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 shadow-[0_0_25px_rgba(59,130,246,0.15)] flex items-center justify-center">
                    {displayAvatar ? (
                      // avatarUrl is served by backend as /uploads/...; Vite proxy will pass through in dev
                      <img
                        src={displayAvatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-black text-[var(--app-text)]">
                        {userInitial}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handlePickAvatar}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 flex items-center justify-center hover:bg-blue-500/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-focus)]"
                    aria-label="Upload avatar"
                    disabled={savingAvatar}
                    title="Upload new avatar"
                  >
                    <FiCamera />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--app-text)] truncate">
                    {user?.name || "User"}
                  </div>
                  <div className="text-xs text-blue-200/70 truncate">
                    {user?.email || ""}
                  </div>
                  <div className="mt-2 text-[10px] uppercase tracking-widest text-[var(--app-text-muted)]">
                    {savingAvatar ? "Uploading…" : "Click camera to upload"}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-bold text-[var(--app-text)] mb-3">
                Profile
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-blue-200/60 mb-2">
                    Name
                  </label>
                  <input
                    value={user?.name || ""}
                    readOnly
                    className="w-full rounded-xl px-4 py-3 bg-black/20 border border-white/10 text-[var(--app-text)] opacity-90"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-blue-200/60 mb-2">
                    Email (locked)
                  </label>
                  <input
                    value={user?.email || ""}
                    readOnly
                    className="w-full rounded-xl px-4 py-3 bg-black/20 border border-white/10 text-[var(--app-text)] opacity-90"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-blue-200/60 mb-2">
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-black/20 border border-blue-400/20 text-[var(--app-text)] focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-500/30"
                    placeholder="username"
                    autoComplete="username"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="md:col-span-2 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 p-5 shadow-[0_0_35px_rgba(59,130,246,0.08)]">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--app-text)] mb-3">
                <FiLock className="text-blue-300" /> Edit Password
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-black/20 border border-white/10 text-[var(--app-text)] focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-500/30"
                  placeholder="Current"
                  autoComplete="current-password"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-black/20 border border-white/10 text-[var(--app-text)] focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-500/30"
                  placeholder="New"
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 bg-black/20 border border-white/10 text-[var(--app-text)] focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-500/30"
                  placeholder="Confirm"
                  autoComplete="new-password"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="min-h-[18px] text-xs">
                  {error ? (
                    <span className="text-red-300">{error}</span>
                  ) : success ? (
                    <span className="text-emerald-300">{success}</span>
                  ) : (
                    <span className="text-blue-200/60">
                      Username can be changed. Email is locked.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="app-btn-primary px-5 py-3 rounded-xl font-black flex items-center gap-2 hover:brightness-110 transition-colors disabled:opacity-60"
                >
                  <FiSave />
                  {savingSettings ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
