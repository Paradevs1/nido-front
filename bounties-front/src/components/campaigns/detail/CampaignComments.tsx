"use client";

import { useState, useEffect } from "react";
import { MdPushPin } from "react-icons/md";
import Button from "@/components/ui/Button";
import { creatorApi, Comment } from "@/lib/api/creator";
import { Campaign } from "@/lib/api/campaign";
import { useAuth } from "@/lib/contexts/AuthContext";
import TwitterAvatar from "@/components/ui/TwitterAvatar";

interface CampaignCommentsProps {
  campaign: Campaign;
  readOnly?: boolean;
}

export default function CampaignComments({ campaign, readOnly = false }: CampaignCommentsProps) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [pinningCommentId, setPinningCommentId] = useState<string | null>(null);

  const isHost = user && user.id === campaign.host_id;

  const fetchComments = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await creatorApi.getComments(campaign.id, page, 10);
      const fixedComments = response.comments.filter((c) => c.is_fixed);
      const normalComments = response.comments.filter((c) => !c.is_fixed);

      fixedComments.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      normalComments.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const sortedComments = [...fixedComments, ...normalComments];
      setComments(sortedComments);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err: unknown) {
      console.error("Erro ao buscar comentários:", err);
      setError("Erro ao carregar comentários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaign.id) {
      fetchComments(1);
    }
  }, [campaign.id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      await creatorApi.insertComment({
        campaignId: campaign.id,
        comment: newComment.trim(),
      });

      setNewComment("");
      // Recarregar comentários
      await fetchComments(currentPage);
    } catch (err: unknown) {
      console.error("Erro ao enviar comentário:", err);
      setError("Erro ao enviar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingText(currentText);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingText.trim()) return;

    try {
      await creatorApi.updateComment(commentId, {
        comment: editingText.trim(),
      });
      setEditingCommentId(null);
      setEditingText("");
      await fetchComments(currentPage);
    } catch (err: unknown) {
      console.error("Erro ao atualizar comentário:", err);
      setError("Erro ao atualizar comentário");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await creatorApi.deleteComment(commentId);
      await fetchComments(currentPage);
    } catch (err: unknown) {
      console.error("Erro ao deletar comentário:", err);
      setError("Erro ao deletar comentário");
    }
  };

  const handlePinFixed = async (commentId: string, isFixed: boolean) => {
    try {
      setPinningCommentId(commentId);
      await creatorApi.pinFixed(commentId, isFixed);
      await fetchComments(currentPage);
    } catch (err: unknown) {
      console.error("Error pinning/unpinning comment:", err);
      setError("Error pinning/unpinning comment");
    } finally {
      setPinningCommentId(null);
    }
  };
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">Comments</h2>

      {/* Add Comment Form - Only show if authenticated and not readOnly */}
      {isAuthenticated && !readOnly && (
        <div className="bg-transparent p-4 rounded-lg mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-transparent border-b border-gray-600 focus:border-blue-500 focus:ring-0 text-white placeholder-gray-500 transition resize-none"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="px-4 py-2 text-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Posting..." : "Comment"}
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`bg-[var(--color-card)] rounded-2xl p-4 relative ${
              comment.is_fixed ? "border-2 border-[var(--color-primary)]" : ""
            }`}
          >
            {isHost && comment.userIsEditOrDelete ? (
              <button
                onClick={() => handlePinFixed(comment.id, !comment.is_fixed)}
                disabled={pinningCommentId === comment.id}
                className="absolute top-2 right-2 text-[var(--color-primary)] hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center z-10"
              >
                <MdPushPin
                  className={`w-5 h-5 ${comment.is_fixed ? "rotate-45" : ""}`}
                />
              </button>
            ) : comment.is_fixed ? (
              <div className="absolute top-2 right-2 text-[var(--color-primary)] flex items-center z-10">
                <MdPushPin className="w-5 h-5 rotate-45" />
              </div>
            ) : null}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden relative">
                {comment.twitter_profile_image || comment.logo_company ? (
                  <TwitterAvatar
                    src={comment.twitter_profile_image || comment.logo_company}
                    alt={comment.username}
                    className="object-cover"
                    fill
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {comment.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white font-semibold text-sm">
                    {comment.username}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                {editingCommentId === comment.id ? (
                  <div className="mb-3">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full bg-transparent border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 resize-none break-all overflow-hidden max-w-full"
                      rows={3}
                      placeholder="Edit your comment..."
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm mb-3 break-all overflow-hidden max-w-full">
                    {comment.comment}
                  </p>
                )}

                <div className="flex items-center gap-5 mt-2">
                  {comment.userIsEditOrDelete &&
                    editingCommentId !== comment.id && (
                      <>
                        <button
                          onClick={() =>
                            handleStartEdit(comment.id, comment.comment)
                          }
                          className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-400 hover:text-red-300 text-xs cursor-pointer"
                        >
                          Delete
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => fetchComments(currentPage - 1)}
            disabled={currentPage <= 1}
            className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40 transition-colors hover:bg-white/5"
          >
            Previous
          </button>

          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => fetchComments(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="cursor-pointer px-4 py-2 rounded-full border border-white/20 text-white disabled:opacity-40 transition-colors hover:bg-white/5"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
