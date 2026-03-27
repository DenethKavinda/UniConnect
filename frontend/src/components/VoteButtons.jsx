import React from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

const VoteButtons = ({ score, userVote, onUpvote, onDownvote, vertical = true, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  const buttonClasses = size === 'sm' ? 'p-1' : 'p-1.5';

  const scoreColor =
    score > 0 ? 'text-amber-400' :
    score < 0 ? 'text-blue-400' :
    'text-slate-300';

  const containerClass = vertical
    ? 'flex flex-col items-center gap-1'
    : 'flex flex-row items-center gap-1';

  return (
    <div className={containerClass}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpvote?.(e);
        }}
        className={`${buttonClasses} rounded-lg transition-all ${
          userVote === 'up'
            ? 'text-amber-400 bg-amber-400/20'
            : 'text-slate-400 hover:text-amber-400 hover:bg-amber-400/10'
        }`}
        title="Upvote"
      >
        <FiArrowUp size={size === 'sm' ? 14 : 16} />
      </button>
      
      <span className={`${scoreColor} font-semibold text-xs`}>
        {score}
      </span>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDownvote?.(e);
        }}
        className={`${buttonClasses} rounded-lg transition-all ${
          userVote === 'down'
            ? 'text-blue-400 bg-blue-400/20'
            : 'text-slate-400 hover:text-blue-400 hover:bg-blue-400/10'
        }`}
        title="Downvote"
      >
        <FiArrowDown size={size === 'sm' ? 14 : 16} />
      </button>
    </div>
  );
};

export default VoteButtons;
