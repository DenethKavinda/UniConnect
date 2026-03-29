import React, { useState } from 'react';

const CommentForm = ({ onSubmit, submitting = false }) => {
    const [text, setText] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!text.trim()) return;

        const didSucceed = await onSubmit(text.trim());
        if (didSucceed) {
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card space-y-4">
            <h3 className="text-lg font-semibold text-white">Add Your Answer</h3>
            <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={4}
                placeholder="Share your answer or guidance..."
                className="uni-input resize-y min-h-[120px]"
            />
            <button
                type="submit"
                disabled={submitting}
                className="btn-sliit-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {submitting ? 'Posting...' : 'Submit Answer'}
            </button>
        </form>
    );
};

export default CommentForm;
