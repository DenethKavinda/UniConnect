import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import postService from '../services/postService';
import { useAuth } from '../context/AuthContext';

const Discussions = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('latest');

    const loadPosts = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await postService.getAllPosts();
            const list = Array.isArray(data) ? data : data?.posts || data?.data || [];
            setPosts(list);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load discussions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const courseOptions = useMemo(() => {
        const courses = posts
            .map((post) => post.course || post.courseCode)
            .filter(Boolean);
        return ['all', ...new Set(courses)];
    }, [posts]);

    const visiblePosts = useMemo(() => {
        const filtered = posts.filter((post) => {
            if (courseFilter === 'all') return true;
            return (post.course || post.courseCode) === courseFilter;
        });

        if (sortOrder === 'latest') {
            return [...filtered].sort(
                (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
        }

        return filtered;
    }, [posts, courseFilter, sortOrder]);

    const handleDelete = async (postId) => {
        const confirmed = window.confirm('Delete this discussion?');
        if (!confirmed) return;

        try {
            await postService.deletePost(postId);
            setPosts((prev) => prev.filter((post) => (post._id || post.id) !== postId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete post.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
            <div className="glass-card mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Discussions</h1>
                        <p className="text-slate-300 mt-1">Ask questions and collaborate with peers by course.</p>
                    </div>
                    <Link to="/posts/new" className="btn-sliit-primary">
                        Ask Question
                    </Link>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="text-sm text-slate-300">
                        Course Filter
                        <select
                            value={courseFilter}
                            onChange={(event) => setCourseFilter(event.target.value)}
                            className="uni-input mt-1"
                        >
                            {courseOptions.map((course) => (
                                <option key={course} value={course} className="bg-slate-900">
                                    {course === 'all' ? 'All Courses' : course}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm text-slate-300">
                        Sort By
                        <select
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value)}
                            className="uni-input mt-1"
                        >
                            <option value="latest" className="bg-slate-900">Latest</option>
                        </select>
                    </label>
                </div>
            </div>

            {loading && <p className="text-slate-300">Loading discussions...</p>}
            {error && <p className="text-red-300 mb-4">{error}</p>}

            {!loading && !visiblePosts.length && !error && (
                <p className="text-slate-300">No discussions available for the selected filter.</p>
            )}

            <div className="space-y-4">
                {visiblePosts.map((post) => (
                    <PostCard
                        key={post._id || post.id}
                        post={post}
                        currentUser={user}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default Discussions;
