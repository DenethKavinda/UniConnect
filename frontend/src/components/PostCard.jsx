import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const getAuthorName = (author) => {
    if (!author) return 'Unknown Author';
    if (typeof author === 'string') return author;
    return author.name || author.username || author.email || 'Unknown Author';
};

const getAuthorId = (author) => {
    if (!author) return null;
    if (typeof author === 'string') return author;
    return author._id || author.id || null;
};

const formatDate = (value) => {
    if (!value) return 'Unknown date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString();
};

const PostCard = ({ post, currentUser, onDelete }) => {
    const [upvotes, setUpvotes] = useState(post.likeCount || post.upvotes || 0);

    const userId = currentUser?._id || currentUser?.id || null;
    const ownerId = useMemo(() => getAuthorId(post.author), [post.author]);
    const isOwner = Boolean(userId && ownerId && userId === ownerId);

    const title = post.title || 'Untitled question';
    const course = post.course || post.courseCode || 'General';
    const authorName = getAuthorName(post.author);

    return (
        <article className="glass-card">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="text-xs uppercase tracking-wider text-slate-300 bg-white/10 rounded-full px-3 py-1">
                    {course}
                </span>
                <button
                    type="button"
                    onClick={() => setUpvotes((prev) => prev + 1)}
                    className="text-sm text-[#F7941D] hover:text-[#ffad4f] transition-colors"
                >
                    Upvote ({upvotes})
                </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-300 mb-6 line-clamp-2">{post.content || post.description || 'No description provided.'}</p>

            <div className="text-sm text-slate-400 space-y-1 mb-6">
                <p>By {authorName}</p>
                <p>{formatDate(post.createdAt)}</p>
            </div>

            <div className="flex flex-wrap gap-2">
                <Link
                    to={`/posts/${post._id || post.id}`}
                    className="btn-sliit-primary text-sm py-2 px-4"
                >
                    View Discussion
                </Link>

                {isOwner ? (
                    <>
                        <Link
                            to={`/posts/${post._id || post.id}/edit`}
                            className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#00538E] text-blue-300 hover:bg-[#00538E]/20 transition-colors"
                        >
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={() => onDelete(post._id || post.id)}
                            className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-400/40 text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                            Delete
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#F7941D]/40 text-[#F7941D] hover:bg-[#F7941D]/10 transition-colors"
                    >
                        Report
                    </button>
                )}
            </div>
        </article>
    );
};

export default PostCard;
