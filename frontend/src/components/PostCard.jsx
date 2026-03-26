import React, { useMemo, useState } from 'react';
import { FiMessageSquare, FiShare2 } from 'react-icons/fi';
import VoteButtons from './VoteButtons';
import SubjectBadge from './SubjectBadge';
import { timeAgo } from '../utils/timeAgo';

const getAuthorName = (author) => {
  if (!author) return 'Unknown Author';
  if (typeof author === 'string') return author;
  return author.name || author.username || author.email || 'Unknown Author';
};

const PostCard = ({ post, onVote, onClick }) => {
  const [userVote, setUserVote] = useState(null);
  const [localScore, setLocalScore] = useState(post.voteScore || post.upvotes?.length - post.downvotes?.length || 0);
  const [upvoted, setUpvoted] = useState(false);

  const title = post.title || 'Untitled';
  const authorName = getAuthorName(post.author);
  const subject = post.subject || 'General';
  const pinned = post.isPinned || false;

  const handleUpvote = (e) => {
    e.stopPropagation();
    const newVote = userVote === 'up' ? 'none' : 'up';
    setUserVote(newVote);
    
    if (newVote === 'up') {
      setLocalScore(localScore + (userVote === 'down' ? 2 : 1));
    } else if (newVote === 'none' && userVote === 'up') {
      setLocalScore(localScore - 1);
    }
    
    if (onVote) onVote(post._id, newVote);
  };

  const handleDownvote = (e) => {
    e.stopPropagation();
    const newVote = userVote === 'down' ? 'none' : 'down';
    setUserVote(newVote);
    
    if (newVote === 'down') {
      setLocalScore(localScore - (userVote === 'up' ? 2 : 1));
    } else if (newVote === 'none' && userVote === 'down') {
      setLocalScore(localScore + 1);
    }
    
    if (onVote) onVote(post._id, newVote);
  };

  return (
    <article
      onClick={() => onClick?.(post._id)}
      className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-4 flex gap-3 hover:border-blue-400/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Vote Column */}
      <div className="flex flex-col items-center gap-1 min-w-[40px]">
        <VoteButtons
          score={localScore}
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

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="bg-white/5 border border-white/10 text-slate-400 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
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
