import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import postService from '../services/postService';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['All', 'General', 'IT1010', 'IT2020', 'IT3020', 'SE3040', 'SE3050', 'CS4010', 'CS4020', 'BM2010', 'EN3010'];

const Discussions = () => {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id || null;
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        subject: selectedSubject === 'All' ? undefined : selectedSubject,
        sort: sortBy,
        page,
        limit: 10
      };
      const data = await postService.getAllPosts(params);
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load discussions.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedSubject, sortBy, page]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    return posts.filter(post =>
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  const handleDelete = async (postId) => {
    const confirmed = window.confirm('Delete this discussion?');
    if (!confirmed) return;

    try {
      await postService.deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!currentUserId) {
      setError('Please log in to vote.');
      return;
    }

    const getVoteState = (post) => {
      const upvoteIds = (post.upvotes || []).map((vote) =>
        typeof vote === 'string' ? vote : vote?._id || vote?.id
      );
      const downvoteIds = (post.downvotes || []).map((vote) =>
        typeof vote === 'string' ? vote : vote?._id || vote?.id
      );
      if (upvoteIds.includes(currentUserId)) return 'up';
      if (downvoteIds.includes(currentUserId)) return 'down';
      return 'none';
    };

    const previousPosts = posts;

    const nextPosts = posts.map((post) => {
      if (post._id !== postId) return post;

      const previousVote = getVoteState(post);
      let nextUpvotes = [...(post.upvotes || [])];
      let nextDownvotes = [...(post.downvotes || [])];

      const removeUserId = (votes) =>
        votes.filter((vote) => {
          const id = typeof vote === 'string' ? vote : vote?._id || vote?.id;
          return id !== currentUserId;
        });

      if (voteType === 'up') {
        if (previousVote === 'up') {
          nextUpvotes = removeUserId(nextUpvotes);
        } else {
          nextUpvotes = [...removeUserId(nextUpvotes), currentUserId];
          nextDownvotes = removeUserId(nextDownvotes);
        }
      } else if (voteType === 'down') {
        if (previousVote === 'down') {
          nextDownvotes = removeUserId(nextDownvotes);
        } else {
          nextDownvotes = [...removeUserId(nextDownvotes), currentUserId];
          nextUpvotes = removeUserId(nextUpvotes);
        }
      } else {
        nextUpvotes = removeUserId(nextUpvotes);
        nextDownvotes = removeUserId(nextDownvotes);
      }

      return {
        ...post,
        upvotes: nextUpvotes,
        downvotes: nextDownvotes,
        voteScore: nextUpvotes.length - nextDownvotes.length,
      };
    });

    setPosts(nextPosts);

    try {
      const data = await postService.votePost(postId, voteType);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                voteScore: data.voteScore,
                upvotes: data.upvotes || [],
                downvotes: data.downvotes || [],
              }
            : post
        )
      );
    } catch (err) {
      setPosts(previousPosts);
      console.error('Vote failed:', err);
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/posts/${postId}`);
  };

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-20">
      {/* Header */}
      <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">UniConnect Forum</h1>
            <p className="text-slate-300">Discuss, ask questions, and collaborate with peers</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">{posts.length} posts · {SUBJECTS.length - 1} subjects</p>
            <Link to="/posts/create" className="app-btn-primary font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition-all">
              + Create Post
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/15 border border-red-400/40 text-red-200 rounded-xl px-4 py-3 mb-6">
          {error}
          <button
            onClick={loadPosts}
            className="ml-4 underline hover:no-underline text-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Left Sidebar - Subject Categories */}
        <div className="hidden xl:block">
          <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-4 sticky top-[90px]">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Communities</h3>
            <div className="space-y-2">
              {SUBJECTS.map(subject => (
                <button
                  key={subject}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setPage(1);
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-lg transition-all text-sm ${
                    selectedSubject === subject
                      ? 'bg-amber-400/10 border-l-2 border-amber-400 text-amber-300'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Feed */}
        <div className="lg:col-span-2 xl:col-span-2">
          {/* Sort and Search Bar */}
          <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {['hot', 'top', 'new'].map(sort => (
                  <button
                    key={sort}
                    onClick={() => {
                      setSortBy(sort);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      sortBy === sort
                        ? 'bg-amber-400/10 border border-amber-400/30 text-amber-400'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sort === 'hot' && '🔥'} {sort === 'top' && '⬆'} {sort === 'new' && '🆕'} {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 md:flex-none bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/20 text-sm"
              />
            </div>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.06] h-32 animate-pulse" />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={currentUserId}
                  onVote={handleVote}
                  onClick={handlePostClick}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 rounded-lg hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar - Info */}
        <div className="hidden lg:block">
          <div className="space-y-4 sticky top-[90px]">
            {/* About */}
            <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">About UniConnect Forum</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A Reddit-style platform for students to share knowledge, ask questions, and support each other across all courses.
              </p>
              <Link
                to="/posts/create"
                className="app-btn-primary mt-3 block w-full text-center font-semibold text-sm py-2 rounded-lg hover:brightness-110 transition-all"
              >
                + New Post
              </Link>
            </div>

            {/* Popular Tags */}
            <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-3">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['help', 'assignment', 'exam', 'project', 'question'].map(tag => (
                  <span
                    key={tag}
                    className="bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-500/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Discussions;
