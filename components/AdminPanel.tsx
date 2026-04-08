"use client";

import { useEffect, useState } from "react";

interface RSVPEntry {
  name: string;
  phone: string;
  attending: string;
  guests: string;
  message: string;
  timestamp: string;
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "wedding2026";

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [entries, setEntries] = useState<RSVPEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "accept" | "decline">("all");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  const fetchRSVPs = async () => {
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
    if (!scriptUrl || scriptUrl === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      setFetchError("Google Script URL is not configured in .env.local");
      return;
    }
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`${scriptUrl}?action=get`);
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.status === "success" && Array.isArray(data.data)) {
        setEntries(data.data);
      } else {
        setFetchError("Could not load RSVPs. Make sure the Apps Script is updated to support GET.");
      }
    } catch {
      setFetchError("Failed to fetch RSVPs. Check your script URL and make sure it supports GET requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchRSVPs();
  }, [authed]);

  const filtered = entries.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "accept" && e.attending.toLowerCase().includes("accept")) ||
      (filter === "decline" && e.attending.toLowerCase().includes("decline"));
    return matchSearch && matchFilter;
  });

  const totalAccepting = entries.filter((e) => e.attending.toLowerCase().includes("accept"));
  const totalGuests = totalAccepting.reduce((sum, e) => sum + (parseInt(e.guests) || 0), 0);
  const totalDeclined = entries.filter((e) => e.attending.toLowerCase().includes("decline")).length;

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6"
        style={{ background: "linear-gradient(160deg, #08080d 0%, #0d0d15 45%, #1a122f 100%)" }}
      >
        {/* Glow */}
        <div className="pointer-events-none fixed left-1/3 top-1/3 h-96 w-96 rounded-full bg-[#d4af37]/8 blur-[100px]" />

        <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* Lock icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 text-4xl">
            🔐
          </div>
          <p className="text-xs uppercase tracking-[0.5em] text-white/40">Admin Access</p>
          <h1 className="mt-3 font-serif text-4xl" style={{
            background: "linear-gradient(180deg, #fff0b2 0%, #d4af37 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            RSVP Dashboard
          </h1>
          <p className="mt-2 text-sm text-white/50">Enter the admin password to continue</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-center text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/30"
              autoFocus
            />
            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#f1d98b] px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              Unlock Dashboard
            </button>
          </form>

          <a href="/" className="mt-6 inline-block text-xs text-white/30 hover:text-white/60 transition">
            ← Return to Invitation
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-10"
      style={{ background: "linear-gradient(160deg, #08080d 0%, #0d0d15 45%, #1a122f 100%)" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-white/40">Admin Panel</p>
            <h1 className="mt-1 font-serif text-4xl" style={{
              background: "linear-gradient(180deg, #fff0b2 0%, #d4af37 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              RSVP Dashboard
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchRSVPs}
              disabled={loading}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 transition hover:border-[#d4af37]/40 hover:text-[#f1d98b] disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
            <a
              href="/"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
            >
              ← Invitation
            </a>
            <button
              onClick={() => setAuthed(false)}
              className="rounded-full border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm text-red-400 transition hover:bg-red-500/20"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total RSVPs", value: entries.length, icon: "📋", color: "from-[#d4af37]/20 to-[#d4af37]/5" },
            { label: "Attending", value: `${totalAccepting.length} (${totalGuests} guests)`, icon: "✅", color: "from-emerald-500/20 to-emerald-500/5" },
            { label: "Declined", value: totalDeclined, icon: "❌", color: "from-red-500/20 to-red-500/5" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-[24px] border border-white/10 bg-gradient-to-br ${stat.color} p-6 backdrop-blur-xl`}
            >
              <div className="mb-3 text-3xl">{stat.icon}</div>
              <div className="font-serif text-3xl text-white">{stat.value}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.3em] text-white/50">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/50 min-w-[200px]"
          />
          {(["all", "accept", "decline"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-5 py-3 text-sm uppercase tracking-[0.2em] transition ${
                filter === f
                  ? "bg-gradient-to-r from-[#d4af37] to-[#f1d98b] text-black font-semibold"
                  : "border border-white/10 text-white/60 hover:border-white/30"
              }`}
            >
              {f === "all" ? "All" : f === "accept" ? "Accepting" : "Declined"}
            </button>
          ))}
        </div>

        {/* Error */}
        {fetchError && (
          <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-sm text-amber-300">
            ⚠️ {fetchError}
            <p className="mt-1 text-xs text-amber-400/60">
              Update your google-apps-script.js to support GET requests for the admin panel to show live data.
            </p>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="text-center">
              <div className="mb-3 text-3xl animate-spin">⟳</div>
              <p className="text-white/50">Loading RSVPs...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-16 text-center backdrop-blur-xl">
            <div className="mb-4 text-5xl">💌</div>
            <p className="text-white/50">
              {entries.length === 0
                ? "No RSVPs yet. Share your invitation link!"
                : "No results match your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {["#", "Name", "Phone", "Attending", "Guests", "Message", "Submitted"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-xs uppercase tracking-[0.3em] text-white/40"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 transition hover:bg-white/5"
                    >
                      <td className="px-5 py-4 text-sm text-white/40">{i + 1}</td>
                      <td className="px-5 py-4 font-medium text-white">{entry.name}</td>
                      <td className="px-5 py-4 text-sm text-white/70">{entry.phone}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            entry.attending.toLowerCase().includes("accept")
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-red-500/15 text-red-400"
                          }`}
                        >
                          {entry.attending.toLowerCase().includes("accept") ? "✓ Accepting" : "✗ Declined"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-white/70">{entry.guests}</td>
                      <td className="max-w-[200px] px-5 py-4 text-sm text-white/50">{entry.message || "—"}</td>
                      <td className="px-5 py-4 text-xs text-white/40">
                        {entry.timestamp
                          ? new Date(entry.timestamp).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-white/10 px-5 py-4 text-xs text-white/30">
              Showing {filtered.length} of {entries.length} entries
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
