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
};

export default groupService;
