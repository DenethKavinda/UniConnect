import api from './api';

const postService = {
  // Posts
  getAllPosts: async (params = {}) => {
    const response = await api.get('/posts', { params });
    return response.data;
  },
  
  getPostById: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },
  
  createPost: async (postData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },
  
  updatePost: async (postId, postData) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },
  
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },
  
  votePost: async (postId, voteType) => {
    const response = await api.post(`/posts/${postId}/vote`, { voteType });
    return response.data;
  },

  // Comments
  getComments: async (postId, sort = 'best') => {
    const response = await api.get(`/comments/post/${postId}`, { params: { sort } });
    return response.data;
  },
  
  createComment: async ({ text, postId, parentCommentId }) => {
    const response = await api.post('/comments', { text, postId, parentCommentId });
    return response.data;
  },
  
  updateComment: async (commentId, text) => {
    const response = await api.put(`/comments/${commentId}`, { text });
    return response.data;
  },
  
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
  
  voteComment: async (commentId, voteType) => {
    const response = await api.post(`/comments/${commentId}/vote`, { voteType });
    return response.data;
  }
};

export default postService;
