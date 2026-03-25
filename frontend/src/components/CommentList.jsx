import React from 'react';

const getCommentAuthor = (author) => {
    if (!author) return 'Unknown User';
    if (typeof author === 'string') return author;
    return author.name || author.username || author.email || 'Unknown User';
};

const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString();
};

const CommentCard = ({ comment, level = 0 }) => {
    const replies = Array.isArray(comment.replies) ? comment.replies : [];

    return (
        <div className={`border border-white/10 bg-white/5 rounded-xl p-4 ${level > 0 ? 'ml-4 md:ml-8' : ''}`}>
            <p className="text-slate-100 mb-3 whitespace-pre-wrap">{comment.text || comment.content || ''}</p>
            <div className="text-xs text-slate-400 flex flex-wrap gap-3">
                <span>{getCommentAuthor(comment.author)}</span>
                <span>{formatDate(comment.createdAt)}</span>
            </div>
            {replies.length > 0 && (
                <div className="mt-3 space-y-3">
                    {replies.map((reply) => (
                        <CommentCard key={reply._id || reply.id} comment={reply} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const buildCommentTree = (comments) => {
    const map = new Map();
    const roots = [];

    comments.forEach((item) => {
        const id = item._id || item.id;
        if (!id) return;
        map.set(id, { ...item, replies: [] });
    });

    map.forEach((item) => {
        const parentId = item.parentComment || item.parentId || item.parent;
        if (parentId && map.has(parentId)) {
            map.get(parentId).replies.push(item);
        } else {
            roots.push(item);
        }
    });

    return roots;
};

const CommentList = ({ comments = [] }) => {
    if (!comments.length) {
        return <p className="text-slate-400">No answers yet. Be the first to respond.</p>;
    }

    const threaded = buildCommentTree(comments);

    return (
        <div className="space-y-3">
            {threaded.map((comment) => (
                <CommentCard key={comment._id || comment.id} comment={comment} />
            ))}
        </div>
    );
};

export default CommentList;
