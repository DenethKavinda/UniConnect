import React from 'react';

const SubjectBadge = ({ subject, onClick, active = false }) => {
  // Color mapping based on subject code
  const getColors = (subj) => {
    if (!subj) return { bg: 'bg-slate-500/20', border: 'border-slate-400/30', text: 'text-slate-300' };
    
    const code = subj.toUpperCase();
    
    if (code.startsWith('IT')) {
      return { bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-300' };
    } else if (code.startsWith('SE')) {
      return { bg: 'bg-purple-500/20', border: 'border-purple-400/30', text: 'text-purple-300' };
    } else if (code.startsWith('CS')) {
      return { bg: 'bg-green-500/20', border: 'border-green-400/30', text: 'text-green-300' };
    } else if (code.startsWith('BM')) {
      return { bg: 'bg-orange-500/20', border: 'border-orange-400/30', text: 'text-orange-300' };
    } else if (code.startsWith('EN')) {
      return { bg: 'bg-teal-500/20', border: 'border-teal-400/30', text: 'text-teal-300' };
    } else if (code === 'GENERAL') {
      return { bg: 'bg-slate-500/20', border: 'border-slate-400/30', text: 'text-slate-300' };
    }
    
    return { bg: 'bg-slate-500/20', border: 'border-slate-400/30', text: 'text-slate-300' };
  };

  const colors = getColors(subject);
  const ringClass = active ? 'ring-1 ring-current' : '';

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all ${colors.bg} ${colors.border} ${colors.text} ${
        onClick ? 'cursor-pointer hover:brightness-125' : ''
      } ${ringClass}`}
    >
      {subject || 'General'}
    </button>
  );
};

export default SubjectBadge;
