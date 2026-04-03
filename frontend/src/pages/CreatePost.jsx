import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiChevronLeft, FiX } from 'react-icons/fi';
import postService from '../services/postService';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = ['General', 'IT1010', 'IT2020', 'IT3020', 'SE3040', 'SE3050', 'CS4010', 'CS4020', 'BM2010', 'EN3010'];

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('General');
  const [tagsInput, setTagsInput] = useState('');
  const [tags, setTags] = useState([]);
  const [imageDataList, setImageDataList] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  if (!user) {
    return (
      <>
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 md:px-6 py-12 text-center">
          <p className="text-slate-300 mb-4">Please log in to create a post.</p>
          <Link to="/posts" className="text-blue-400 hover:text-blue-300">
            Back to Forum
          </Link>
        </div>
      </>
    );
  }

  const handleTagInputChange = (e) => {
    setTagsInput(e.target.value);
  };

  const handleTagInputBlur = () => {
    if (tagsInput.trim()) {
      const newTags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
      setTags((prev) => [...prev, ...newTags]);
      setTagsInput('');
    }
  };

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentCount = imageDataList.length;
    if (currentCount >= 5) {
      setError('You can upload up to 5 images per post');
      e.target.value = '';
      return;
    }

    if (currentCount + files.length > 5) {
      setError(`You can upload up to 5 images per post (currently selected: ${currentCount})`);
      e.target.value = '';
      return;
    }

    const hasInvalidType = files.some(
      (file) => !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
    );
    if (hasInvalidType) {
      setError('Only image files are allowed (jpeg, png, gif, webp)');
      e.target.value = '';
      return;
    }

    const hasInvalidSize = files.some((file) => file.size > 5 * 1024 * 1024);
    if (hasInvalidSize) {
      setError('Each image file size must be less than 5MB');
      e.target.value = '';
      return;
    }

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              resolve(typeof event.target?.result === 'string' ? event.target.result : '');
            };
            reader.readAsDataURL(file);
          })
      )
    ).then((results) => {
      const cleaned = results.filter(Boolean);
      setImageDataList((prev) => [...prev, ...cleaned].slice(0, 5));
      setImagePreviews((prev) => [...prev, ...cleaned].slice(0, 5));
      setError('');
      e.target.value = '';
    });
  };

  const removeImage = (indexToRemove) => {
    setImageDataList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setSubmitting(true);
    try {
      const parsedTags = [
        ...tags,
        ...tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      ];

      const newPost = await postService.createPost({
        title: title.trim(),
        content: content.trim(),
        subject,
        tags: parsedTags,
        images: imageDataList,
      });
      navigate(`/posts/${newPost._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setSubmitting(false);
    }
  };

  const titleRemaining = 300 - title.length;
  const contentRemaining = 10000 - content.length;

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-6 pb-20">
      {/* Breadcrumb */}
      <Link
        to="/posts"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm transition-colors mb-6"
      >
        <FiChevronLeft size={16} />
        Back to Forum
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">Create a Post</h1>
        <p className="text-slate-300">Share your thoughts and start a discussion</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/15 border border-red-400/40 text-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Section 1: Post Content */}
        <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100">1. Post Content</h2>

          {/* Title */}
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="title" className="text-sm text-slate-200 font-semibold">
                Title *
              </label>
              <span className={`text-xs ${titleRemaining < 50 ? 'text-amber-300' : 'text-slate-500'}`}>
                {titleRemaining}/300
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 300))}
              placeholder="What's your question?"
              maxLength={300}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/20"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="content" className="text-sm text-slate-200 font-semibold">
                Content *
              </label>
              <span className={`text-xs ${contentRemaining < 500 ? 'text-amber-300' : 'text-slate-500'}`}>
                {contentRemaining}/10000
              </span>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 10000))}
              placeholder="Provide more details about your question..."
              rows={6}
              maxLength={10000}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/20 resize-none"
            />
          </div>
        </div>

        {/* Section 2: Details */}
        <div className="bg-white/[0.06] border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100">2. Details</h2>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm text-slate-200 font-semibold mb-2">
              Subject
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/20"
            >
              {SUBJECTS.map(s => (
                <option key={s} value={s} className="bg-slate-900">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm text-slate-200 font-semibold mb-2">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={handleTagInputChange}
              onBlur={handleTagInputBlur}
              placeholder="e.g. homework, assignment, help"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/20"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, idx) => (
                  <div
                    key={idx}
                    className="bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(idx)}
                      className="hover:text-amber-200"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm text-slate-200 font-semibold mb-2">
              Images (optional)
            </label>
            <div className="space-y-3">
              {/* File Upload Input */}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-amber-400/10 file:text-amber-300 file:cursor-pointer hover:file:bg-amber-400/20 outline-none focus:border-blue-400/70 focus:ring-1 focus:ring-blue-400/20"
                />
                <p className="text-xs text-slate-400 mt-1">Up to 5 images, max 5MB each (JPEG, PNG, GIF, WebP)</p>
              </div>

              {/* Image Preview */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-xl border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500/20 border border-red-400/30 text-red-300 rounded-full p-1 hover:bg-red-500/30 transition-colors"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="px-6 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:text-white font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="app-btn-primary px-6 py-2 rounded-lg font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default CreatePost;
