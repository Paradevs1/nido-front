"use client";

import { useState } from "react";
import {
  CommunityAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePinAnnouncement,
  CreateAnnouncementRequest,
} from "@/lib/api/community";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import ConfirmModal from "./ConfirmModal";
import MultiImageUpload from "./MultiImageUpload";
import AnnouncementImageThumb from "./AnnouncementImageThumb";
import BaseButton from "@/components/ui/Button";

interface AnnouncementsListProps {
  communityId: string;
  announcements: CommunityAnnouncement[];
  canManage: boolean;
  onRefresh: () => void;
}

export default function AnnouncementsList({
  communityId,
  announcements,
  canManage,
  onRefresh,
}: AnnouncementsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAnnouncementRequest>({ title: "", description: "" });
  const [formImages, setFormImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [pinningId, setPinningId] = useState<string | null>(null);
  const { showToast, hideToast, toast } = useToast();

  const isValidUrl = (url: string) => /^https?:\/\/.+/.test(url);

  const handleTogglePin = async (announcementId: string, isPinned: boolean) => {
    setPinningId(announcementId);
    try {
      await togglePinAnnouncement(communityId, announcementId);
      showToast(isPinned ? "Announcement unpinned" : "Announcement pinned", "success");
      onRefresh();
    } catch (err: any) {
      showToast(err.message || "Failed to toggle pin", "error");
    } finally {
      setPinningId(null);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "" });
    setFormImages([]);
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast("Title and description are required", "warning");
      return;
    }
    if (formData.link && !isValidUrl(formData.link)) {
      showToast("Link must be a valid URL (http:// or https://)", "warning");
      return;
    }
    setLoading(true);
    try {
      const payload: CreateAnnouncementRequest = {
        ...formData,
        ...(formImages.length > 0 && { images: formImages }),
      };
      if (editingId) {
        await updateAnnouncement(communityId, editingId, payload);
        showToast("Announcement updated", "success");
      } else {
        await createAnnouncement(communityId, payload);
        showToast("Announcement created", "success");
      }
      resetForm();
      onRefresh();
    } catch (err: any) {
      showToast(err.message || "Failed to save announcement", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      await deleteAnnouncement(communityId, deletingId);
      showToast("Announcement deleted", "success");
      setDeletingId(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || "Failed to delete announcement", "error");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (announcement: CommunityAnnouncement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      link: announcement.link || undefined,
    });
    // Merge existing images: images array + legacy image_url
    const imgs: string[] = [];
    if (announcement.images && announcement.images.length > 0) {
      imgs.push(...announcement.images);
    } else if (announcement.image_url) {
      imgs.push(announcement.image_url);
    }
    setFormImages(imgs);
    setShowForm(true);
  };

  /** Get all images for an announcement (images array + legacy image_url fallback) */
  const getImages = (a: CommunityAnnouncement): string[] => {
    if (a.images && a.images.length > 0) return a.images;
    if (a.image_url) return [a.image_url];
    return [];
  };

  return (
    <div>
      {/* Create button */}
      {canManage && !showForm && (
        <BaseButton
          onClick={() => { resetForm(); setShowForm(true); }}
          variant="default"
          className="mb-4 px-5 py-2.5 text-sm font-semibold cursor-pointer"
        >
          + New Announcement
        </BaseButton>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 rounded-lg p-4 mb-4 space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)]"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)]"
          />
          <input
            type="url"
            placeholder="Link (optional) — https://..."
            value={formData.link || ""}
            onChange={(e) => setFormData((p) => ({ ...p, link: e.target.value || undefined }))}
            maxLength={2000}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)]"
          />
          <MultiImageUpload
            values={formImages}
            onChange={setFormImages}
            label="Images (optional, max 5)"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <BaseButton
              type="submit"
              disabled={loading}
              variant="default"
              className="px-5 py-2 text-sm font-semibold cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : editingId ? "Update" : "Create"}
            </BaseButton>
          </div>
        </form>
      )}

      {/* List */}
      {announcements.length === 0 ? (
        <p className="text-white/40 text-sm py-8 text-center">No announcements yet</p>
      ) : (
        <div className="space-y-4">
          {[...announcements].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((a) => {
            const images = getImages(a);
            const isNew = (Date.now() - new Date(a.created_at).getTime()) < 1000 * 60 * 60 * 48;
            return (
              <div
                key={a.id}
                className={`rounded-xl overflow-hidden transition-all ${
                  a.pinned
                    ? "bg-gradient-to-br from-[var(--color-primary)]/8 to-[var(--color-primary)]/3 border border-[var(--color-primary)]/25"
                    : "bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.12]"
                }`}
              >
                {/* Header: title + actions */}
                <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    {(a.pinned || isNew) && (
                      <div className="flex items-center gap-2 mb-2">
                        {a.pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide uppercase text-[var(--color-primary)] bg-[var(--color-primary)]/12 px-2 py-0.5 rounded-full border border-[var(--color-primary)]/20">
                            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M15 4.5l-4 4L7 10l-1.5 1.5 7 7L14 17l1.5-3.5 4-4" />
                              <path d="M9 15l-4.5 4.5" />
                              <path d="M14.5 4L20 9.5" />
                            </svg>
                            Pinned
                          </span>
                        )}
                        {isNew && !a.pinned && (
                          <span className="inline-flex items-center text-[10px] font-semibold tracking-wide uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            New
                          </span>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h4 className="text-white font-semibold text-base leading-snug tracking-tight">
                      {a.title}
                    </h4>

                    {/* Subtle gradient divider */}
                    <div className="mt-2 mb-3 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

                    {/* Description */}
                    <p className="text-white/55 text-sm leading-relaxed whitespace-pre-wrap">
                      {a.description}
                    </p>

                    {/* Link chip */}
                    {a.link && (
                      <a
                        href={a.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-[var(--color-primary)] text-xs font-medium bg-[var(--color-primary)]/8 hover:bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/20 rounded-full px-3 py-1 max-w-full overflow-hidden transition-colors"
                      >
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <span className="truncate">{a.link}</span>
                      </a>
                    )}
                  </div>

                  {/* Action buttons */}
                  {canManage && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleTogglePin(a.id, !!a.pinned)}
                        disabled={pinningId === a.id}
                        className={`cursor-pointer p-1.5 transition-colors disabled:opacity-50 ${a.pinned ? "text-[var(--color-primary)]" : "text-white/40 hover:text-[var(--color-primary)]"}`}
                        aria-label={a.pinned ? "Unpin" : "Pin"}
                        title={a.pinned ? "Unpin" : "Pin"}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={a.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth={a.pinned ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 4.5l-4 4L7 10l-1.5 1.5 7 7L14 17l1.5-3.5 4-4" />
                          <path d="M9 15l-4.5 4.5" />
                          <path d="M14.5 4L20 9.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => startEdit(a)}
                        className="cursor-pointer p-1.5 text-white/40 hover:text-white transition-colors"
                        aria-label="Edit announcement"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingId(a.id)}
                        className="cursor-pointer p-1.5 text-white/40 hover:text-red-400 transition-colors"
                        aria-label="Delete announcement"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Images — single image bleeds full-width (no px padding) */}
                {images.length > 0 && (
                  <div className="px-5 pb-3">
                    {images.length === 1 ? (
                      <AnnouncementImageThumb
                        src={images[0]}
                        alt={`${a.title} image 1`}
                        variant="banner"
                        onClick={() => setExpandedImage(images[0])}
                      />
                    ) : (
                      <div className="flex flex-wrap items-start gap-2 overflow-x-auto pb-1">
                        {images.map((src, i) => (
                          <AnnouncementImageThumb
                            key={`${a.id}-img-${i}`}
                            src={src}
                            alt={`${a.title} image ${i + 1}`}
                            variant="card"
                            onClick={() => setExpandedImage(src)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer: date */}
                <div className="flex items-center px-5 py-2.5 border-t border-white/[0.06]">
                  <span className="text-white/25 text-[11px] tabular-nums">
                    {new Date(a.created_at).toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image lightbox */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6"
          onClick={() => setExpandedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <img
            src={expandedImage}
            alt="Expanded"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[min(90vh,900px)] max-w-[min(95vw,1200px)] w-auto h-auto object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

      {deletingId && (
        <ConfirmModal
          title="Delete Announcement"
          message="Are you sure you want to delete this announcement?"
          confirmLabel="Delete"
          isDestructive
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
    </div>
  );
}
