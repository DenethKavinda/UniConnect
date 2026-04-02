import API from './api';

const groupService = {
  getGroups: async () => {
    const response = await API.get('/groups');
    return response.data;
  },

  createGroup: async (payload) => {
    const response = await API.post('/groups', payload);
    return response.data;
  },

  joinGroup: async (groupId) => {
    const response = await API.post(`/groups/${groupId}/join`, {});
    return response.data;
  },

  getGroupFiles: async (groupId) => {
    const response = await API.get(`/groups/${groupId}/files`);
    return response.data;
  },

  uploadGroupFiles: async (groupId, files) => {
    const data = new FormData();
    for (const file of files) {
      data.append('files', file);
    }
    const response = await API.post(`/groups/${groupId}/files`, data);
    return response.data;
  },

  downloadGroupFile: async (groupId, fileId) => {
    const response = await API.get(`/groups/${groupId}/files/${fileId}/download`, { responseType: 'blob' });
    return response;
  },

  deleteGroupFile: async (groupId, fileId) => {
    const response = await API.delete(`/groups/${groupId}/files/${fileId}`);
    return response.data;
  },
};

export default groupService;
