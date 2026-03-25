import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';
import commentService from '../services/commentService';
import postService from '../services/postService';

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
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString();
};

const DiscussionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [error, setError] = useState('');
    const [upvotes, setUpvotes] = useState(0);

    const loadDiscussion = async () => {
        try {
            setLoading(true);
            setError('');
            const [postData, commentData] = await Promise.all([
                postService.getPostById(id),
                commentService.getCommentsByPost(id)
            ]);

            const resolvedPost = postData?.post || postData?.data || postData;
            const resolvedComments = Array.isArray(commentData)
                ? commentData
                : commentData?.comments || commentData?.data || [];

            setPost(resolvedPost);
            setComments(resolvedComments);
            setUpvotes(resolvedPost?.likeCount || resolvedPost?.upvotes || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load discussion details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadDiscussion();
        }
    }, [id]);

    const userId = user?._id || user?.id || null;
    const ownerId = useMemo(() => getAuthorId(post?.author), [post]);
    const isOwner = Boolean(userId && ownerId && userId === ownerId);

    const handleCommentSubmit = async (text) => {
        try {
            setSubmittingComment(true);
            await commentService.createComment(id, { text, content: text });
            const commentData = await commentService.getCommentsByPost(id);
            const resolvedComments = Array.isArray(commentData)
                ? commentData
                : commentData?.comments || commentData?.data || [];
            setComments(resolvedComments);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit comment.');
            return false;
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm('Delete this discussion?');
        if (!confirmed) return;

        try {
            await postService.deletePost(id);
            navigate('/posts');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete post.');
        }
    };

    if (loading) {
        return <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 text-slate-300">Loading discussion...</div>;
    }

    if (!post) {
        return <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 text-slate-300">Discussion not found.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-6">
            {error && <p className="text-red-300">{error}</p>}

            <article className="glass-card">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                    <span className="text-xs uppercase tracking-wider text-slate-300 bg-white/10 rounded-full px-3 py-1">
                        {post.course || post.courseCode || 'General'}
                    </span>
                    <button
                        type="button"
                        onClick={() => setUpvotes((prev) => prev + 1)}
                        className="text-sm text-[#F7941D] hover:text-[#ffad4f] transition-colors"
                    >
                        Upvote ({upvotes})
                    </button>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">{post.title || 'Untitled question'}</h1>
                <p className="text-slate-100 whitespace-pre-wrap leading-relaxed mb-5">
                    {post.content || post.description || 'No content provided.'}
                </p>

                <div className="text-sm text-slate-400 flex flex-wrap gap-4 mb-5">
                    <span>{getAuthorName(post.author)}</span>
                    <span>{formatDate(post.createdAt)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link to="/posts" className="px-4 py-2 rounded-lg text-sm font-semibold border border-white/20 text-slate-200 hover:bg-white/10 transition-colors">
                        Back to Discussions
                    </Link>

                    {isOwner ? (
                        <>
                            <Link
                                to={`/posts/${id}/edit`}
                                className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#00538E] text-blue-300 hover:bg-[#00538E]/20 transition-colors"
                            >
                                Edit
                            </Link>
                            <button
                                type="button"
                                onClick={handleDelete}
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

            <CommentForm onSubmit={handleCommentSubmit} submitting={submittingComment} />

            <section className="glass-card">
                <h2 className="text-xl font-semibold text-white mb-4">Answers ({comments.length})</h2>
                <CommentList comments={comments} />
            </section>
        </div>
    );
};

export default DiscussionDetail;
