import React from 'react';
import { FiMessageSquare, FiShare2 } from 'react-icons/fi';
import VoteButtons from './VoteButtons';
import SubjectBadge from './SubjectBadge';
import { timeAgo } from '../utils/timeAgo';

const getAuthorName = (author) => {
  if (!author) return 'Unknown Author';
  if (typeof author === 'string') return author;
  return author.name || author.username || author.email || 'Unknown Author';
};

const getVoteId = (vote) => (typeof vote === 'string' ? vote : vote?._id || vote?.id);

const PostCard = ({ post, currentUserId, onVote, onClick, onTagClick }) => {

  const title = post.title || 'Untitled';
  const authorName = getAuthorName(post.author);
  const subject = post.subject || 'General';
  const pinned = post.isPinned || false;

  const upvoteIds = (post.upvotes || []).map(getVoteId);
  const downvoteIds = (post.downvotes || []).map(getVoteId);
  const score = typeof post.voteScore === 'number' ? post.voteScore : upvoteIds.length - downvoteIds.length;
  const userVote = currentUserId
    ? upvoteIds.includes(currentUserId)
      ? 'up'
      : downvoteIds.includes(currentUserId)
        ? 'down'
        : 'none'
    : 'none';

  const handleUpvote = (e) => {
    e.stopPropagation();
    if (onVote) onVote(post._id, 'up');
  };

  const handleDownvote = (e) => {
    e.stopPropagation();
    if (onVote) onVote(post._id, 'down');
  };

  return (
    <article
      onClick={() => onClick?.(post._id)}
      className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-4 flex gap-3 hover:border-blue-400/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Vote Column */}
      <div className="flex flex-col items-center gap-1 min-w-[40px]">
        <VoteButtons
          score={score}
          userVote={userVote}
          onUpvote={handleUpvote}
          onDownvote={handleDownvote}
          vertical={true}
          size="sm"
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <SubjectBadge subject={subject} />
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-400">u/{authorName}</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-400">{timeAgo(post.createdAt)}</span>
          {pinned && <span className="text-xs">📌</span>}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-100 line-clamp-2 mb-1">
          {title}
        </h3>

        {/* Content Preview */}
        <p className="text-sm text-slate-400 line-clamp-2 mb-2">
          {post.content}
        </p>

        {/* Image Preview */}
        {post.image && (
          <div className="mb-2 overflow-hidden rounded-lg border border-white/10">
            <img
              src={post.image}
              alt="Post attachment"
              className="h-44 w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag.toLowerCase());
                }}
                className="bg-white/5 border border-white/10 text-slate-400 text-xs px-2 py-0.5 rounded-full hover:text-slate-200 hover:border-white/20 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-4 text-slate-500 text-sm mt-2">
          <div className="flex items-center gap-1 hover:text-slate-300">
            <FiMessageSquare size={16} />
            <span>{post.commentCount || 0}</span>
          </div>
          <button
            className="flex items-center gap-1 hover:text-slate-300"
            onClick={(e) => e.stopPropagation()}
          >
            <FiShare2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
