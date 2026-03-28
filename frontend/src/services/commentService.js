import api from './api';

const commentService = {
    async getCommentsByPost(postId, sort = 'best') {
        const response = await api.get(`/comments/post/${postId}`, { params: { sort } });
        return response.data;
    },

    async createComment(postId, payload) {
        const response = await api.post('/comments', { ...payload, post: postId, postId });
        return response.data;
    },

    async updateComment(commentId, payload) {
        const response = await api.put(`/comments/${commentId}`, payload);
        return response.data;
    },

    async deleteComment(commentId) {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    },

    async voteComment(commentId, voteType) {
        const response = await api.post(`/comments/${commentId}/vote`, { voteType });
        return response.data;
    }
};

export default commentService;
