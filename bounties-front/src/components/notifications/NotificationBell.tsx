"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
  type NotificationType,
} from "@/lib/api/notifications";

const POLL_INTERVAL = 30_000;

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getNotificationText(n: Notification): string {
  const p = n.payload;
  switch (n.type) {
    case "JOIN_REQUEST":
      return `${p.creator_name || "A creator"} requested to join ${p.community_name || "your community"}`;
    case "JOIN_REQUEST_APPROVED":
      return `Your request to join ${p.community_name || "a community"} was approved`;
    case "JOIN_REQUEST_REJECTED":
      return `Your request to join ${p.community_name || "a community"} was rejected`;
    case "MEMBER_REMOVED":
      return `You were removed from ${p.community_name || "a community"}`;
    case "ANNOUNCEMENT_PUBLISHED":
      return `New announcement in ${p.community_name || "a community"}: ${p.announcement_title || ""}`;
    default:
      return "New notification";
  }
}

function getNotificationIcon(type: NotificationType): React.ReactNode {
  switch (type) {
    case "JOIN_REQUEST":
      return (
        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
      );
    case "JOIN_REQUEST_APPROVED":
      return (
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "JOIN_REQUEST_REJECTED":
    case "MEMBER_REMOVED":
      return (
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "ANNOUNCEMENT_PUBLISHED":
      return (
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      );
  }
}

function getNotificationHref(n: Notification, role: string): string {
  const p = n.payload;
  switch (n.type) {
    case "JOIN_REQUEST":
      return p.community_id ? `/host/communities/${p.community_id}` : "/host/communities";
    case "JOIN_REQUEST_APPROVED":
      return p.community_id ? `/creator/communities/${p.community_id}` : "/creator/communities";
    case "JOIN_REQUEST_REJECTED":
    case "MEMBER_REMOVED":
      return "/creator/communities";
    case "ANNOUNCEMENT_PUBLISHED":
      return p.community_id
        ? (role === "host" ? `/host/communities/${p.community_id}` : `/creator/communities/${p.community_id}`)
        : "/creator/communities";
    default:
      return role === "host" ? "/host/communities" : "/creator/communities";
  }
}

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const role = user?.role || "creator";
  const canShow = isAuthenticated && (role === "host" || role === "creator");

  // Poll unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!canShow) return;
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.unread_count);
    } catch { }
  }, [canShow]);

  useEffect(() => {
    fetchUnreadCount();
    pollRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchUnreadCount]);

  const [notifPage, setNotifPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const NOTIF_LIMIT = 10;

  // Load notifications when panel opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setNotifPage(1);
    listNotifications({ page: 1, limit: NOTIF_LIMIT })
      .then((res) => {
        setNotifications(res.notifications);
        setHasMore(res.page < res.totalPages);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [open]);

  const loadMore = async () => {
    const nextPage = notifPage + 1;
    setLoadingMore(true);
    try {
      const res = await listNotifications({ page: nextPage, limit: NOTIF_LIMIT });
      setNotifications((prev) => [...prev, ...res.notifications]);
      setNotifPage(nextPage);
      setHasMore(res.page < res.totalPages);
    } catch { }
    finally { setLoadingMore(false); }
  };

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleMarkRead = async (n: Notification) => {
    if (n.read) return;
    try { await markAsRead(n.id); } catch { }
    setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnreadCount(0);
    } catch { }
    finally { setMarkingAll(false); }
  };

  if (!canShow) return null;

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="cursor-pointer relative p-2 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] flex items-center justify-center rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--color-card)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-white font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="cursor-pointer text-[var(--color-primary)] text-xs hover:underline disabled:opacity-50"
              >
                {markingAll ? "..." : "Mark all as read"}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-10 h-10 mx-auto text-white/15 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-white/40 text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 ${
                    !n.read ? "bg-white/[0.03]" : ""
                  }`}
                >
                  {getNotificationIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? "text-white" : "text-white/60"}`}>
                      {getNotificationText(n)}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n)}
                      className="cursor-pointer text-[10px] text-[var(--color-primary)] hover:underline flex-shrink-0 mt-0.5"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="cursor-pointer w-full py-2.5 text-xs text-[var(--color-primary)] hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "See more"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
