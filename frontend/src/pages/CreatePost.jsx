import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import postService from '../services/postService';

const initialState = {
    title: '',
    description: '',
    course: ''
};

const CreatePost = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialState);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.title.trim() || !formData.description.trim() || !formData.course.trim()) {
            setError('Please fill in title, description, and course.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            await postService.createPost({
                title: formData.title.trim(),
                content: formData.description.trim(),
                description: formData.description.trim(),
                course: formData.course.trim()
            });

            navigate('/posts');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
            <div className="glass-card">
                <h1 className="text-3xl font-bold text-white mb-2">Ask a Question</h1>
                <p className="text-slate-300 mb-6">Create a discussion for your course and get answers from peers.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm text-slate-200 mb-1">
                            Title
                        </label>
                        <input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="What are you struggling with?"
                            className="uni-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="course" className="block text-sm text-slate-200 mb-1">
                            Course
                        </label>
                        <input
                            id="course"
                            name="course"
                            value={formData.course}
                            onChange={handleChange}
                            placeholder="e.g. CS2022"
                            className="uni-input"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm text-slate-200 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows={6}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your question in detail..."
                            className="uni-input resize-y"
                        />
                    </div>

                    {error && <p className="text-red-300 text-sm">{error}</p>}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-sliit-primary disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Post Question'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/posts')}
                            className="px-5 py-2 rounded-lg border border-white/20 text-slate-200 hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
