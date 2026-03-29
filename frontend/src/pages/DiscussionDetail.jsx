import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import CommentThread from '../components/CommentThread';
import VoteButtons from '../components/VoteButtons';
import SubjectBadge from '../components/SubjectBadge';
import postService from '../services/postService';
import { timeAgo } from '../utils/timeAgo';

const DiscussionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id || null;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortComments, setSortComments] = useState('best');
  const [userVote, setUserVote] = useState('none');

  const getVoteId = (vote) => (typeof vote === 'string' ? vote : vote?._id || vote?.id);

  const detectUserVote = (postData) => {
    if (!currentUserId || !postData) return 'none';
    const upvoteIds = (postData.upvotes || []).map(getVoteId);
    const downvoteIds = (postData.downvotes || []).map(getVoteId);
    if (upvoteIds.includes(currentUserId)) return 'up';
    if (downvoteIds.includes(currentUserId)) return 'down';
    return 'none';
  };

  const loadDiscussionDetail = async (commentSort = sortComments) => {
    try {
      setLoading(true);
      setError('');
      const [postData, commentsData] = await Promise.all([
        postService.getPostById(id),
        postService.getComments(id, commentSort)
      ]);

      setPost(postData);
      setComments(commentsData);
      setUserVote(detectUserVote(postData));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load discussion details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadDiscussionDetail(sortComments);
    }
  }, [id, sortComments, currentUserId]);

  const isOwner = Boolean(currentUserId && post?.author?._id && currentUserId === post.author._id);

  const handleVotePost = async (voteType) => {
    if (!currentUserId) {
      setError('Please log in to vote.');
      return;
    }

    if (!post) return;

    const previousPost = post;
    const previousVote = userVote;
    const newVote = userVote === voteType ? 'none' : voteType;

    const removeUserId = (votes) =>
      votes.filter((vote) => getVoteId(vote) !== currentUserId);

    let nextUpvotes = [...(post.upvotes || [])];
    let nextDownvotes = [...(post.downvotes || [])];

    if (newVote === 'up') {
      nextUpvotes = [...removeUserId(nextUpvotes), currentUserId];
      nextDownvotes = removeUserId(nextDownvotes);
    } else if (newVote === 'down') {
      nextDownvotes = [...removeUserId(nextDownvotes), currentUserId];
      nextUpvotes = removeUserId(nextUpvotes);
    } else {
      nextUpvotes = removeUserId(nextUpvotes);
      nextDownvotes = removeUserId(nextDownvotes);
    }

    setUserVote(newVote);
    setPost({
      ...post,
      upvotes: nextUpvotes,
      downvotes: nextDownvotes,
      voteScore: nextUpvotes.length - nextDownvotes.length,
    });

    try {
      const data = await postService.votePost(id, newVote);
      setPost((prev) =>
        prev
          ? {
            ...prev,
            voteScore: data.voteScore,
            upvotes: data.upvotes || [],
            downvotes: data.downvotes || [],
          }
          : prev
      );
      setUserVote(data.userVote || 'none');
    } catch (err) {
      setPost(previousPost);
      setUserVote(previousVote);
      console.error('Vote failed:', err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      alert('Please log in to comment.');
      return;
    }

    setSubmitting(true);
    try {
      const newComment = await postService.createComment({
        text: commentText.trim(),
        postId: id
      });
      setComments([newComment, ...comments]);
      setPost(prev => ({ ...prev, commentCount: (prev?.commentCount || 0) + 1 }));
      setCommentText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post?')) return;

    try {
      await postService.deletePost(id);
      navigate('/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  const handleReplyAdded = () => {
    postService.getComments(id, sortComments).then(setComments).catch(() => { });
    setPost(prev => ({ ...prev, commentCount: (prev?.commentCount || 0) + 1 }));
  };

  const handleCommentUpdated = (updatedComment) => {
    const updateCommentsTree = (commentsList) => {
      return commentsList.map(c =>
        c._id === updatedComment._id
          ? updatedComment
          : { ...c, replies: updateCommentsTree(c.replies || []) }
      );
    };
    setComments(updateCommentsTree(comments));
  };

  const handleCommentDeleted = (commentId) => {
    const markDeletedInTree = (commentsList) =>
      commentsList.map((comment) => {
        if (comment._id === commentId) {
          return {
            ...comment,
            isDeleted: true,
            text: '[deleted]',
            author: null,
            replies: markDeletedInTree(comment.replies || []),
          };
        }

        return {
          ...comment,
          replies: markDeletedInTree(comment.replies || []),
        };
      });

    setComments((prev) => markDeletedInTree(prev));
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] h-48 animate-pulse" />
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] h-24 animate-pulse" />
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] h-20 animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="text-slate-300">Post not found.</div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-6 pb-20 space-y-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/posts')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
        >
          <FiChevronLeft size={16} />
          Back to Forum
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/15 border border-red-400/40 text-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Post Card */}
        <article className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex gap-4">
            {/* Vote Column */}
            <div className="flex flex-col items-center gap-1 min-w-[50px]">
              <VoteButtons
                score={post.voteScore || 0}
                userVote={userVote}
                onUpvote={() => handleVotePost('up')}
                onDownvote={() => handleVotePost('down')}
                vertical={true}
                size="md"
              />
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <SubjectBadge subject={post.subject} />
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-400">u/{post.author?.name || 'Unknown'}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-400">{timeAgo(post.createdAt)}</span>
                {post.isPinned && <span className="text-xs">📌</span>}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-slate-50 mb-3">
                {post.title}
              </h1>

              {/* Content */}
              <p className="text-slate-200 whitespace-pre-wrap mb-4 leading-relaxed">
                {post.content}
              </p>

              {/* Image */}
              {post.image && (
                <img
                  src={post.image}
                  alt="Post attachment"
                  className="rounded-lg mb-4 max-w-full max-h-96 object-cover"
                />
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-white/5 border border-white/10 text-slate-400 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">
                  💬 {post.commentCount || 0} comments
                </span>
                {isOwner && (
                  <>
                    <button
                      onClick={handleDeletePost}
                      className="text-sm text-slate-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Comment Input */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">Add a Comment</h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What are your thoughts?"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/20 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setCommentText('')}
                className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg text-sm font-semibold hover:text-white"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="px-4 py-2 bg-blue-400/10 border border-blue-400/20 text-blue-300 rounded-lg text-sm font-semibold hover:bg-blue-400/20 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-amber-500/15 border border-amber-400/40 text-amber-200 rounded-xl px-4 py-3 text-sm">
            <Link to="/login" className="underline hover:no-underline">Log in</Link> to join the discussion.
          </div>
        )}

        {/* Comments Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </h2>
          <div className="flex gap-2">
            {['best', 'new', 'old'].map(sort => (
              <button
                key={sort}
                onClick={() => setSortComments(sort)}
                className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${sortComments === sort
                    ? 'bg-amber-400/10 border border-amber-400/30 text-amber-300'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                  }`}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Comments Thread */}
        <div className="space-y-2">
          {comments.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <CommentThread
                key={comment._id}
                comment={comment}
                postId={id}
                currentUserId={currentUserId}
                onReplyAdded={handleReplyAdded}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default DiscussionDetail;
