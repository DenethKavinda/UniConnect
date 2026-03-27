import React, { useEffect, useState } from 'react';
import { FiChevronUp, FiEdit2, FiTrash2 } from 'react-icons/fi';
import VoteButtons from './VoteButtons';
import postService from '../services/postService';
import { timeAgo } from '../utils/timeAgo';

const CommentThread = ({ comment, postId, currentUserId, onReplyAdded, onCommentUpdated, onCommentDeleted, depth = 0 }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [collapsed, setCollapsed] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [localVote, setLocalVote] = useState(null);
  const [localScore, setLocalScore] = useState(comment.voteScore || comment.upvotes?.length - comment.downvotes?.length || 0);
  const [replies, setReplies] = useState(comment.replies || []);

  const getVoteId = (vote) => (typeof vote === 'string' ? vote : vote?._id || vote?.id);

  useEffect(() => {
    setReplies(comment.replies || []);
  }, [comment.replies]);

  useEffect(() => {
    const upvoteIds = (comment.upvotes || []).map(getVoteId);
    const downvoteIds = (comment.downvotes || []).map(getVoteId);

    setLocalScore(
      typeof comment.voteScore === 'number'
        ? comment.voteScore
        : upvoteIds.length - downvoteIds.length
    );

    if (!currentUserId) {
      setLocalVote('none');
      return;
    }

    if (upvoteIds.includes(currentUserId)) {
      setLocalVote('up');
      return;
    }

    if (downvoteIds.includes(currentUserId)) {
      setLocalVote('down');
      return;
    }

    setLocalVote('none');
  }, [comment.upvotes, comment.downvotes, comment.voteScore, currentUserId]);

  const authorId = comment.author?._id || comment.author?.id;
  const isOwner = currentUserId && authorId === currentUserId;
  const authorName = comment.isDeleted ? '[deleted]' : (comment.author?.name || 'Unknown');

  // Depth-based indentation
  const getIndentClass = () => {
    if (depth === 0) return '';
    if (depth === 1) return 'border-l-2 border-blue-500/30 ml-6 pl-4';
    if (depth === 2) return 'border-l-2 border-amber-500/20 ml-10 pl-4';
    return 'border-l-2 border-slate-500/15 ml-14 pl-4';
  };

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!currentUserId || comment.isDeleted) return;
    const newVote = localVote === 'up' ? 'none' : 'up';
    const scoreDelta = newVote === 'up' ? (localVote === 'down' ? 2 : 1) : (localVote === 'up' ? -1 : 0);
    
    setLocalVote(newVote);
    setLocalScore(localScore + scoreDelta);
    
    try {
      await postService.voteComment(comment._id, newVote);
    } catch (err) {
      setLocalScore(localScore - scoreDelta);
      setLocalVote(localVote);
    }
  };

  const handleDownvote = async (e) => {
    e.stopPropagation();
    if (!currentUserId || comment.isDeleted) return;
    const newVote = localVote === 'down' ? 'none' : 'down';
    const scoreDelta = newVote === 'down' ? (localVote === 'up' ? -2 : -1) : (localVote === 'down' ? 1 : 0);
    
    setLocalVote(newVote);
    setLocalScore(localScore + scoreDelta);
    
    try {
      await postService.voteComment(comment._id, newVote);
    } catch (err) {
      setLocalScore(localScore - scoreDelta);
      setLocalVote(localVote);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!currentUserId) return;

    setIsSubmittingReply(true);
    try {
      const newComment = await postService.createComment({
        text: replyText.trim(),
        postId,
        parentCommentId: comment._id
      });
      setReplies([...replies, newComment]);
      setReplyText('');
      setShowReplyBox(false);
      if (onReplyAdded) onReplyAdded(newComment);
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;

    setIsSubmittingEdit(true);
    try {
      const updated = await postService.updateComment(comment._id, editText.trim());
      setIsEditing(false);
      if (onCommentUpdated) onCommentUpdated(updated);
    } catch (err) {
      console.error('Failed to update comment:', err);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await postService.deleteComment(comment._id);
      if (onCommentDeleted) onCommentDeleted(comment._id);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (collapsed) {
    return (
      <div className={`py-3 ${getIndentClass()}`}>
        <button
          onClick={() => setCollapsed(false)}
          className="text-sm text-slate-400 hover:text-slate-300"
        >
          [{comment.replies?.length || 0} hidden replies]
        </button>
      </div>
    );
  }

  const isEdited = comment.updatedAt && new Date(comment.updatedAt) > new Date(comment.createdAt);
  const editedMoreThanMinute = isEdited && (new Date(comment.updatedAt) - new Date(comment.createdAt)) > 60000;

  return (
    <div className={`py-3 ${getIndentClass()}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {comment.isDeleted ? '×' : (authorName[0] || '?').toUpperCase()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Metadata */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-200">
              u/{authorName}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-500">{timeAgo(comment.createdAt)}</span>
            {editedMoreThanMinute && (
              <>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-500 italic">(edited)</span>
              </>
            )}
          </div>

          {/* Comment Text or Edit Box */}
          {isEditing ? (
            <form onSubmit={handleSubmitEdit} className="space-y-2 mb-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/20 text-sm"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-3 py-1 bg-amber-400/10 text-amber-300 border border-amber-400/20 rounded-lg text-xs font-semibold hover:bg-amber-400/20 disabled:opacity-50"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.text);
                  }}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className={`text-sm ${comment.isDeleted ? 'italic text-slate-500' : 'text-slate-200'} mb-2 whitespace-pre-wrap`}>
              {comment.text}
            </p>
          )}

          {/* Vote Buttons + Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <VoteButtons
                score={localScore}
                userVote={localVote}
                onUpvote={handleUpvote}
                onDownvote={handleDownvote}
                vertical={false}
                size="sm"
              />
            </div>

            {!comment.isDeleted && (
              <div className="flex items-center gap-2 text-slate-500">
                <button
                  onClick={() => setShowReplyBox(!showReplyBox)}
                  className="text-xs hover:text-slate-300 transition-colors"
                >
                  Reply
                </button>

                {isOwner && (
                  <>
                    <span>•</span>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs hover:text-slate-300 transition-colors flex items-center gap-1"
                    >
                      <FiEdit2 size={12} />
                      Edit
                    </button>
                    <span>•</span>
                    <button
                      onClick={handleDelete}
                      className="text-xs hover:text-red-300 transition-colors flex items-center gap-1"
                    >
                      <FiTrash2 size={12} />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Reply Box */}
          {showReplyBox && (
            <form onSubmit={handleSubmitReply} className="mt-3 space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/20 text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="px-3 py-1 bg-blue-400/10 text-blue-300 border border-blue-400/20 rounded-lg text-xs font-semibold hover:bg-blue-400/20 disabled:opacity-50"
                >
                  {isSubmittingReply ? 'Posting...' : 'Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReplyBox(false)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Collapse Button */}
        {replies.length > 0 && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-500 hover:text-slate-300 mt-1 flex-shrink-0"
          >
            <FiChevronUp size={16} />
          </button>
        )}
      </div>

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <CommentThread
              key={reply._id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              onReplyAdded={onReplyAdded}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
