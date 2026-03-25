import api from './api';

const groupService = {
  getGroups: async () => {
    const response = await api.get('/groups');
    return response.data;
  },

  createGroup: async (payload) => {
    const response = await api.post('/groups', payload);
    return response.data;
  },

  joinGroup: async (groupId) => {
    const response = await api.post(`/groups/${groupId}/join`, {});
    return response.data;
  },

  getLiveActivity: async () => {
    const response = await api.get('/groups/activity');
    return response.data;
  }
};

export default groupService;
