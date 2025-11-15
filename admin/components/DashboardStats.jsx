"use client";
import React, { useEffect, useState } from "react";
import { FiUsers, FiFileText, FiBookmark, FiHeart, FiTag, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";

const StatCard = ({ label, value, icon: Icon, bgGradient = "from-amber-100 to-amber-50", subtle }) => (
  <div className={`rounded-xl shadow-lg p-4 flex items-center gap-4 transition hover:scale-[1.02] transform ${subtle ? "bg-white/80" : ""}`} style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
    <div className={`p-3 rounded-lg text-white flex items-center justify-center`} style={{ background: null }}>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
        boxShadow: "inset 0 -6px 18px rgba(0,0,0,0.06)"
      }}>
        <Icon className="text-2xl" />
      </div>
    </div>

    <div className="flex-1">
      <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-gray-900">{value}</div>
    </div>
  </div>
);

export default function DashboardStats({ apiBase = "" }) {
  const API_BASE = apiBase || process.env.NEXT_PUBLIC_API_URL || "";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/admin/stats`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || `Fetch failed: ${res.status}`);
        }
        const body = await res.json();
        if (!mounted) return;
        setStats(body.data || null);
      } catch (e) {
        console.error("DashboardStats fetch error:", e);
        if (mounted) setErr(e.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [API_BASE]);

  if (loading) return <div className="p-6">Loading stats...</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!stats) return <div className="p-6">No stats</div>;

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900">Admin Dashboard</h3>
          <p className="text-sm text-gray-500">Overview of platform metrics — updated live.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">Last updated</div>
          <div className="text-sm font-medium text-gray-700">{new Date().toLocaleString()}</div>
        </div>
      </div>

      {/* Top row: big colourful stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg,#FFEDD5 0%, #FFF7ED 100%)" }}>
          <div className="p-4 flex items-center gap-4">
            <div className="bg-amber-500/90 text-white rounded-xl p-3">
              <FiUsers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-amber-700 uppercase tracking-wide">Total Users</div>
              <div className="text-2xl font-extrabold text-amber-900">{stats.totalUsers ?? 0}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg,#E0F2FE 0%, #F0F9FF 100%)" }}>
          <div className="p-4 flex items-center gap-4">
            <div className="bg-sky-500/90 text-white rounded-xl p-3">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-sky-700 uppercase tracking-wide">Total Poems</div>
              <div className="text-2xl font-extrabold text-sky-900">{stats.totalPoems ?? 0}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg,#FEF3C7 0%, #FFFBEB 100%)" }}>
          <div className="p-4 flex items-center gap-4">
            <div className="bg-yellow-500/90 text-white rounded-xl p-3">
              <FiBookmark className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-yellow-700 uppercase tracking-wide">Total Bookmarks</div>
              <div className="text-2xl font-extrabold text-yellow-900">{stats.totalBookmarks ?? 0}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg,#FEE2E2 0%, #FFF1F2 100%)" }}>
          <div className="p-4 flex items-center gap-4">
            <div className="bg-pink-500/90 text-white rounded-xl p-3">
              <FiHeart className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-pink-700 uppercase tracking-wide">Total Likes</div>
              <div className="text-2xl font-extrabold text-pink-900">{stats.totalLikes ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories + Status grouped panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Categories */}
        <div className="col-span-1 lg:col-span-1 bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-700">Categories</div>
              <div className="text-xs text-gray-400">Distribution by category</div>
            </div>
            <div className="text-xs text-gray-500">Total { (stats.gadhyaCount ?? 0) + (stats.kavyaCount ?? 0) }</div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-25">
              <div className="text-xs text-indigo-600">Gadhya</div>
              <div className="mt-1 text-xl font-bold text-indigo-900">{stats.gadhyaCount ?? 0}</div>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-25">
              <div className="text-xs text-emerald-600">Kavya</div>
              <div className="mt-1 text-xl font-bold text-emerald-900">{stats.kavyaCount ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Status: approved/pending/rejected */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-700">Poems by status</div>
              <div className="text-xs text-gray-400">Quick view of moderation queue</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">Queue</div>
              <div className="text-sm font-medium text-gray-700">{stats.pendingPoems ?? 0} pending</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-emerald-50 flex flex-col items-center">
              <div className="p-3 rounded-full bg-white shadow-sm">
                <FiCheckCircle className="text-emerald-600 w-6 h-6" />
              </div>
              <div className="mt-3 text-xs text-gray-500">Approved</div>
              <div className="mt-1 text-xl font-bold text-emerald-800">{stats.approvedPoems ?? 0}</div>
            </div>

            <div className="p-4 rounded-lg bg-yellow-50 flex flex-col items-center">
              <div className="p-3 rounded-full bg-white shadow-sm">
                <FiClock className="text-yellow-600 w-6 h-6" />
              </div>
              <div className="mt-3 text-xs text-gray-500">Pending</div>
              <div className="mt-1 text-xl font-bold text-yellow-800">{stats.pendingPoems ?? 0}</div>
            </div>

            <div className="p-4 rounded-lg bg-red-50 flex flex-col items-center">
              <div className="p-3 rounded-full bg-white shadow-sm">
                <FiXCircle className="text-red-600 w-6 h-6" />
              </div>
              <div className="mt-3 text-xs text-gray-500">Rejected</div>
              <div className="mt-1 text-xl font-bold text-red-800">{stats.rejectedPoems ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* footer small summary */}
      <div className="text-sm text-gray-500">Tip: Click on "Admin Pending Posts" in the sidebar to view lists and moderate items.</div>
    </div>
  );
}
