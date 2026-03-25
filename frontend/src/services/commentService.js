import api from './api';

const commentService = {
    async getCommentsByPost(postId) {
        const response = await api.get(`/comments/post/${postId}`);
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
    }
};

export default commentService;
