"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  CommunityMessage,
  listMessages,
  sendMessage,
  deleteMessage,
  searchMessages,
} from "@/lib/api/community";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";

interface CommunityChatProps {
  communityId: string;
  isHost: boolean;
  readOnly?: boolean;
}

const POLL_INTERVAL = 15_000; // 15 seconds
const MESSAGES_PER_PAGE = 30;

export default function CommunityChat({ communityId, isHost, readOnly }: CommunityChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CommunityMessage[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast, hideToast, toast } = useToast();

  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    try {
      const res = await listMessages(communityId, { page: pageNum, limit: MESSAGES_PER_PAGE });
      if (append) {
        setMessages((prev) => [...prev, ...res.messages]);
      } else {
        setMessages(res.messages);
      }
      setTotal(res.total);
    } catch {
      // Silent fail for polling
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  // Initial load + polling
  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(() => fetchMessages(), POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  // Scroll to bottom on new messages (within chat container only)
  useEffect(() => {
    if (page === 1 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length, page]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const text = newMessage.trim();
    if (!text) return;
    setSending(true);
    try {
      await sendMessage(communityId, text);
      setNewMessage("");
      await fetchMessages();
    } catch (err: any) {
      showToast(err.message || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (msgId: string) => {
    try {
      await deleteMessage(communityId, msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err: any) {
      showToast(err.message || "Failed to delete message", "error");
    }
  };

  const canDelete = (msg: CommunityMessage) => {
    if (isHost) return true;
    return isOwnMessage(msg);
  };

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    if (showEmoji) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  const insertEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  // Search with debounce
  useEffect(() => {
    if (!searchOpen || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchMessages(communityId, { q: searchQuery, limit: 20 });
        setSearchResults(res.messages);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchQuery, searchOpen, communityId]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const isOwnMessage = (msg: CommunityMessage) => {
    if (msg.sender_id === user?.id) return true;
    if (msg.sender.username && msg.sender.username === user?.username) return true;
    return false;
  };

  // Messages come from API sorted newest-first; reverse for display
  const displayMessages = [...messages].reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[350px] sm:h-[400px] md:h-[calc(100vh-280px)]">
      {/* Messages */}
      {/* Search bar */}
      <div className="flex items-center gap-2 mb-2">
        {searchOpen ? (
          <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              autoFocus
              className="flex-1 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
              onKeyDown={(e) => e.key === "Escape" && closeSearch()}
            />
            <button onClick={closeSearch} className="cursor-pointer text-white/40 hover:text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="cursor-pointer ml-auto p-1.5 text-white/30 hover:text-white/60 transition-colors"
            aria-label="Search messages"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Search results overlay */}
      {searchOpen && searchQuery.length >= 2 && (
        <div className="mb-2 max-h-48 overflow-y-auto bg-white/5 border border-white/10 rounded-lg">
          {searchLoading ? (
            <div className="p-4 text-center text-white/40 text-xs">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-white/40 text-xs">No results found</div>
          ) : (
            searchResults.map((msg) => (
              <button
                key={msg.id}
                onClick={closeSearch}
                className="cursor-pointer w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--color-accent)]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-[10px]">{msg.sender.username?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/60 text-xs font-medium">{msg.sender.username}</span>
                    {msg.sender_role === "HOST" && (
                      <span className="text-[8px] bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-1 py-0.5 rounded-full">HOST</span>
                    )}
                  </div>
                  <p className="text-white/50 text-xs mt-0.5 line-clamp-1"
                    dangerouslySetInnerHTML={{
                      __html: msg.message.replace(
                        new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                        '<mark class="bg-yellow-500/30 text-yellow-200 rounded px-0.5">$1</mark>'
                      ),
                    }}
                  />
                </div>
                <span className="text-white/20 text-[10px] flex-shrink-0">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {displayMessages.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-12">
            No messages yet. Start the conversation!
          </p>
        ) : (
          <>
            {total > messages.length && (
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchMessages(nextPage, true);
                }}
                className="cursor-pointer w-full text-center py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                Load older messages
              </button>
            )}
            {displayMessages.map((msg) => {
              const isOwn = isOwnMessage(msg);
              const avatarSrc = msg.sender_role === "HOST"
                ? (msg.sender.logo_company || msg.sender.twitter_profile_image)
                : msg.sender.twitter_profile_image;
              return (
                <div
                  key={msg.id}
                  className={`group flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent)]/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={msg.sender.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xs font-medium">
                        {msg.sender.username?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div className={`max-w-[85%] sm:max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-medium ${msg.sender_role === "HOST" ? "text-[var(--color-primary)]" : "text-white/60"}`}>
                        {msg.sender.username}
                        {msg.sender_role === "HOST" && (
                          <span className="ml-1 text-[10px] bg-[var(--color-primary)]/20 px-1.5 py-0.5 rounded-full">
                            HOST
                          </span>
                        )}
                      </span>
                    </div>
                    <div
                      className={`inline-block px-3 py-2 rounded-lg text-sm ${
                        isOwn
                          ? "bg-[var(--color-primary)]/20 text-white"
                          : "bg-white/5 text-white/80"
                      }`}
                    >
                      {msg.message}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-white/30">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {canDelete(msg) && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="cursor-pointer opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
                          aria-label="Delete message"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
        <div className="relative" ref={emojiRef}>
          <button
            type="button"
            onClick={() => !readOnly && setShowEmoji((p) => !p)}
            disabled={readOnly}
            className={`p-2 transition-colors ${readOnly ? "text-white/20 cursor-not-allowed" : "cursor-pointer text-white/40 hover:text-white/70"}`}
            aria-label="Emoji"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
          </button>
          {showEmoji && <EmojiPicker onSelect={insertEmoji} />}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={readOnly ? "View only" : "Type a message..."}
          disabled={readOnly}
          className={`flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)] ${readOnly ? "text-white/30 cursor-not-allowed" : "text-white"}`}
        />
        <button
          type="submit"
          disabled={readOnly || sending || !newMessage.trim()}
          aria-label="Send message"
          className={`w-11 h-11 flex items-center justify-center text-white rounded-lg transition-opacity disabled:opacity-50 ${
            readOnly ? "bg-[var(--color-primary)]/30 cursor-not-allowed" : "cursor-pointer bg-[var(--color-primary)] hover:opacity-90"
          }`}
        >
          {sending ? (
            <span className="text-sm font-semibold">...</span>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Emoji Picker
// ---------------------------------------------------------------------------

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊",
      "😇","🥰","😍","🤩","😘","😗","😋","😛","😜","🤪",
      "😝","🤑","🤗","🤭","🤫","🤔","🫡","🤐","🤨","😐",
      "😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔",
      "😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥴","😵",
      "🤯","🥳","🥸","😎","🤓","🧐",
    ],
  },
  {
    label: "Gestures",
    emojis: [
      "👋","🤚","🖐️","✋","🖖","🫱","🫲","👌","🤌","🤏",
      "✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","👇",
      "☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶",
      "👐","🤲","🙏","💪","🫂",
    ],
  },
  {
    label: "Hearts",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
      "❤️‍🔥","💕","💞","💓","💗","💖","💘","💝","💟",
    ],
  },
  {
    label: "Objects",
    emojis: [
      "🔥","⭐","🌟","✨","💫","🎉","🎊","🏆","🥇","🥈",
      "🥉","🎯","🚀","💰","💎","💡","📣","📢","🔔","🎵",
      "🎶","💻","📱","📸","🎮","🎬","📈","📉","✅","❌",
      "⚠️","💯","🆕","🆒","🆓","ℹ️",
    ],
  },
  {
    label: "Flags",
    emojis: [
      "🏳️","🏴","🇧🇷","🇺🇸","🇬🇧","🇪🇸","🇫🇷","🇩🇪","🇯🇵","🇰🇷",
      "🇨🇳","🇮🇳","🇵🇹","🇮🇹","🇦🇷","🇲🇽","🇨🇴","🇨🇱",
    ],
  },
];

function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="absolute bottom-full left-0 mb-2 w-[85vw] max-w-72 bg-[var(--color-card)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
      {/* Category tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.label}
            type="button"
            onClick={() => setActiveCategory(i)}
            className={`cursor-pointer flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors ${
              activeCategory === i
                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {/* Emoji grid */}
      <div className="p-2 h-40 sm:h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSelect(emoji)}
              className="cursor-pointer w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
